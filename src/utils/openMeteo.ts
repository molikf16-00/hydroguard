import {
  completeSum,
  contiguousHours,
  isReading,
  cacheAgeMinutes as getCacheAge,
  daysBefore,
} from "./dataQuality";
import {
  RiskCalculationInputs,
  calculateTransparentRiskScore,
} from "./riskScoring";
import {
  AlertHistoryItem,
  RiskLevel,
  SourceMetric,
  TransparentRiskScore,
  TrendPoint,
  VillageData,
} from "../types";
import {
  CatchmentSettings,
  MODEL_ASSUMPTIONS,
  VillageConfigItem,
} from "../config/catchmentConfig";

/**
 * LIVE DATA LAYER (Open-Meteo)
 *
 * - Fetches forecast-model rainfall + topsoil moisture and GloFAS river discharge for EVERY village
 *   coordinate in the catchment config (one request each, comma-separated coordinates).
 * - All times are requested in GMT and compared in UTC; display is converted to IST.
 * - Everything shown is MODEL output on a coarse grid, not sensor readings.
 * - If the network fails, only a previously fetched real response (max 6 h old) may be shown, labelled cached.
 *   There is no synthetic fallback: with no data the app says so.
 */

const CACHE_KEY = "hydroguard_live_open_meteo_cache_v3";

export class NoLiveDataError extends Error {
  constructor(message = "No live data available") {
    super(message);
    this.name = "NoLiveDataError";
  }
}

// ---------------------------------------------------------------------------
// Raw API shapes
// ---------------------------------------------------------------------------
interface RawForecastLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
  hourly: {
    time: string[];
    precipitation: Array<number | null>;
    soil_moisture_0_to_7cm: Array<number | null>;
  };
}

interface RawFloodLocation {
  daily?: {
    time: string[];
    river_discharge: Array<number | null>;
  };
}

export interface RawBundle {
  fetchedAtIso: string;
  coordKey: string;
  forecast: RawForecastLocation[];
  flood: Array<RawFloodLocation | null>;
}

// ---------------------------------------------------------------------------
// Public result type
// ---------------------------------------------------------------------------
export interface LiveCatchmentState {
  villageScores: Record<string, TransparentRiskScore>;
  validAtIso: string;
  metrics: {
    rainfall: SourceMetric;
    riverLevel: SourceMetric;
    soilMoisture: SourceMetric;
    terrainSatellite: SourceMetric;
  };
  trendHistory: TrendPoint[];
  riskScore: TransparentRiskScore;
  villages: VillageData[];
  headline: string;
  description: string;
  lastUpdatedText: string;
  isCached: boolean;
  cacheAgeMinutes: number;
  drivingVillageName: string;
  alerts: AlertHistoryItem[];
  fetchedAtIso: string;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
async function fetchWithTimeout(
  url: string,
  timeoutMs = 8000,
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

const num = (v: number | null | undefined): number =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function formatIST(date: Date, withSeconds = false): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

function utcHourKey(date: Date): string {
  return `${date.toISOString().slice(0, 13)}:00`;
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Last index whose time (GMT, "YYYY-MM-DDTHH:00") is <= the reference hour. -1 if none. */
export function findCurrentIndex(times: string[], ref: Date): number {
  const key = utcHourKey(ref);
  let found = -1;
  for (let i = 0; i < times.length; i++) {
    if (times[i] <= key) found = i;
    else break;
  }
  return found;
}

/**
 * Discharge ratio for a given UTC date: value on that date / median of the earlier days.
 * Needs at least 3 valid earlier days and a positive baseline; otherwise null (= unavailable).
 */
export function dischargeRatioForDate(
  daily: RawFloodLocation["daily"] | undefined,
  dateKey: string,
): { value: number; baseline: number; ratio: number } | null {
  if (
    !daily ||
    !Array.isArray(daily.time) ||
    !Array.isArray(daily.river_discharge)
  )
    return null;
  const idx = daily.time.indexOf(dateKey);
  if (idx < 0) return null;
  const value = daily.river_discharge[idx];
  if (!isReading(value)) return null;
  const earlier = daily.river_discharge.slice(0, idx).filter(isReading);
  if (earlier.length < 3) return null;
  const baseline = median(earlier);
  if (!(baseline > 0)) return null;
  return { value, baseline, ratio: value / baseline };
}

function lastValid(
  arr: Array<number | null>,
  idx: number,
  lookback = 6,
): number | null {
  for (let i = idx; i >= Math.max(0, idx - lookback); i--) {
    const v = arr[i];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

const soilToPct = (m3m3: number) =>
  Math.min(
    100,
    Math.max(
      0,
      Math.round((m3m3 / MODEL_ASSUMPTIONS.soilFieldCapacityM3M3) * 100),
    ),
  );

function coordKeyOf(config: CatchmentSettings): string {
  return config.villages
    .map((v) => `${v.lat.toFixed(4)},${v.lon.toFixed(4)}`)
    .join("|");
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------
export async function fetchBundle(
  config: CatchmentSettings,
  signal?: AbortSignal,
): Promise<RawBundle> {
  const lats = config.villages.map((v) => v.lat.toFixed(4)).join(",");
  const lons = config.villages.map((v) => v.lon.toFixed(4)).join(",");

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&hourly=precipitation,soil_moisture_0_to_7cm&past_days=5&forecast_days=2&timezone=GMT`;
  const forecastRes = await fetchWithTimeout(forecastUrl, 25000, signal);
  if (!forecastRes.ok)
    throw new Error(`Forecast API returned status ${forecastRes.status}`);
  const forecastJson = await forecastRes.json();
  const forecast: RawForecastLocation[] = Array.isArray(forecastJson)
    ? forecastJson
    : [forecastJson];
  if (forecast.length !== config.villages.length) {
    throw new Error("Forecast API returned an unexpected number of locations");
  }

  let flood: Array<RawFloodLocation | null> = config.villages.map(() => null);
  try {
    const floodUrl =
      `https://flood-api.open-meteo.com/v1/flood?latitude=${lats}&longitude=${lons}` +
      `&daily=river_discharge&past_days=8&forecast_days=1`;
    const floodRes = await fetchWithTimeout(floodUrl, 15000, signal);
    if (floodRes.ok) {
      const floodJson = await floodRes.json();
      const arr: RawFloodLocation[] = Array.isArray(floodJson)
        ? floodJson
        : [floodJson];
      if (arr.length === config.villages.length) flood = arr;
    }
  } catch (e) {
    signal?.throwIfAborted();
    console.warn(
      "Flood API unavailable; river discharge will be marked unavailable",
      e,
    );
  }

  return {
    fetchedAtIso: new Date().toISOString(),
    coordKey: coordKeyOf(config),
    forecast,
    flood,
  };
}

function readCache(
  config: CatchmentSettings,
): { bundle: RawBundle; ageMin: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const bundle = JSON.parse(raw) as RawBundle;
    if (bundle.coordKey !== coordKeyOf(config)) return null;
    const ageMin = getCacheAge(bundle.fetchedAtIso);
    if (ageMin === null) return null;
    return { bundle, ageMin };
  } catch {
    return null;
  }
}

/**
 * Fetch live data for the whole catchment. Throws NoLiveDataError if neither the network nor a
 * recent real cached response is available.
 */
export async function fetchLiveCatchmentData(
  config: CatchmentSettings,
  signal?: AbortSignal,
): Promise<LiveCatchmentState> {
  let bundle: RawBundle | null = null;
  try {
    bundle = await fetchBundle(config, signal);
    processBundle(bundle, config, new Date(), false, 0); // Validate before caching.
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(bundle));
    } catch (cacheErr) {
      console.warn("LocalStorage caching error", cacheErr);
    }
  } catch (networkError) {
    signal?.throwIfAborted();
    bundle = null;
    console.warn("Open-Meteo request failed, checking cache", networkError);
  }

  if (bundle) return processBundle(bundle, config, new Date(), false, 0);

  const cached = readCache(config);
  if (!cached)
    throw new NoLiveDataError(
      "Could not reach Open-Meteo and there is no recent cached response.",
    );
  // For cached data, "now" is the moment it was fetched, never the present.
  return processBundle(
    cached.bundle,
    config,
    new Date(cached.bundle.fetchedAtIso),
    true,
    cached.ageMin,
  );
}

// ---------------------------------------------------------------------------
// Scoring windows shared by "current" and "trend"
// ---------------------------------------------------------------------------
function inputsAt(
  loc: RawForecastLocation,
  idx: number,
  ratio: number | null,
  freshnessText: string,
): RiskCalculationInputs | null {
  const soilRaw = loc.hourly.soil_moisture_0_to_7cm[idx];
  const p = loc.hourly.precipitation;
  const rain72 = completeSum(p, idx, 72);
  if (
    !isReading(soilRaw) ||
    soilRaw > 1 ||
    rain72 === null ||
    !contiguousHours(loc.hourly.time, idx, 72)
  )
    return null;
  return {
    rain1hMm: p[idx] as number,
    rain3hMm: completeSum(p, idx, 3)!,
    rain24hMm: completeSum(p, idx, 24)!,
    rain72hAntecedentMm: rain72,
    soilMoistureSaturationPct: soilToPct(soilRaw),
    riverDischargeRatio: ratio,
    freshnessText,
  };
}

// ---------------------------------------------------------------------------
// Processing
// ---------------------------------------------------------------------------
const TIER_ORDER: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "SEVERE"];

export function processBundle(
  bundle: RawBundle,
  config: CatchmentSettings,
  refDate: Date,
  isCached: boolean,
  cacheAgeMinutes: number,
): LiveCatchmentState {
  if (
    !config.villages.length ||
    bundle.forecast.length !== config.villages.length
  )
    throw new NoLiveDataError("Incomplete village coverage.");
  const freshnessText = isCached
    ? `Cached: fetched ${cacheAgeMinutes} min ago (offline fallback)`
    : `Live: Open-Meteo model data, ${formatIST(refDate)} IST`;
  const timestampText = isCached
    ? `Cached (${cacheAgeMinutes} min ago)`
    : `${formatIST(refDate)} IST`;
  const dateKey = utcDateKey(refDate);

  interface Scored {
    cfg: VillageConfigItem;
    loc: RawForecastLocation;
    flood: RawFloodLocation | null;
    idx: number;
    inputs: RiskCalculationInputs;
    score: TransparentRiskScore;
    discharge: { value: number; baseline: number; ratio: number } | null;
  }

  const scored: Scored[] = config.villages.map((cfg, i) => {
    const loc = bundle.forecast[i];
    if (
      !loc?.hourly ||
      !Array.isArray(loc.hourly.time) ||
      !Array.isArray(loc.hourly.precipitation) ||
      !Array.isArray(loc.hourly.soil_moisture_0_to_7cm) ||
      !Number.isFinite(loc.latitude) ||
      !Number.isFinite(loc.longitude)
    )
      throw new NoLiveDataError("Invalid forecast response.");
    const flood = bundle.flood[i] ?? null;
    const idx = findCurrentIndex(loc.hourly.time, refDate);
    if (idx < 0 || loc.hourly.time[idx] !== utcHourKey(refDate))
      throw new NoLiveDataError("Model data does not cover the current hour.");
    const discharge = dischargeRatioForDate(flood?.daily, dateKey);
    const inputs = inputsAt(
      loc,
      idx,
      discharge ? discharge.ratio : null,
      freshnessText,
    );
    if (!inputs)
      throw new NoLiveDataError(
        "Insufficient data: complete 72-hour rainfall and current soil moisture are required.",
      );
    return {
      cfg,
      loc,
      flood,
      idx,
      inputs,
      score: calculateTransparentRiskScore(inputs),
      discharge,
    };
  });

  const driver = scored.reduce(
    (best, cur) => (cur.score.totalScore > best.score.totalScore ? cur : best),
    scored[0],
  );
  const driverScore = driver.score;

  // ---- Villages (each scored from its own grid cell) ----
  const villages: VillageData[] = scored.map((s) => ({
    id: s.cfg.id,
    name: s.cfg.name,
    lat: s.cfg.lat,
    lon: s.cfg.lon,
    riskLevel: s.score.riskLevel,
    riskScore: s.score.totalScore,
  }));

  // ---- Metrics for the highest-risk village cell ----
  const d = driver;
  const p = d.loc.hourly.precipitation;
  const soilSeries = d.loc.hourly.soil_moisture_0_to_7cm;
  const shortName = d.cfg.name.split(" (")[0];
  const gridLabel = `${shortName} nearest grid point`;
  const gridCoords = `Model grid point ${d.loc.latitude.toFixed(2)}, ${d.loc.longitude.toFixed(2)} (village is at ${d.cfg.lat.toFixed(2)}, ${d.cfg.lon.toFixed(2)})`;
  const recentFrom = Math.max(0, d.idx - 23);
  const rain24 = d.inputs.rain24hMm;
  const soilPct = d.inputs.soilMoistureSaturationPct;
  const soilRawNow = lastValid(soilSeries, d.idx) ?? 0;

  const rainfall: SourceMetric = {
    title: "Rainfall (24 h)",
    iconType: "rain",
    value: rain24.toFixed(1),
    numericValue: +rain24.toFixed(1),
    unit: "mm / 24 h",
    trend: d.inputs.rain1hMm >= 1 ? "Increasing" : "Stable",
    status:
      rain24 >= 115.6
        ? "Critical"
        : rain24 >= 64.5
          ? "High"
          : rain24 >= 15.6
            ? "Moderate"
            : "Normal",
    statusLevel:
      rain24 >= 115.6
        ? "SEVERE"
        : rain24 >= 64.5
          ? "HIGH"
          : rain24 >= 15.6
            ? "MEDIUM"
            : "LOW",
    thresholdLabel: "IMD Heavy (24 h)",
    thresholdValue: "64.5 mm",
    sparkline: p.slice(recentFrom, d.idx + 1).map(num),
    details: `1 h: ${d.inputs.rain1hMm.toFixed(1)} mm | 3 h: ${d.inputs.rain3hMm.toFixed(1)} mm | 72 h: ${d.inputs.rain72hAntecedentMm.toFixed(1)} mm. Sparkline shows hourly model rainfall for the last ${d.idx - recentFrom + 1} hours. ${gridCoords}.`,
    sourceName: "Open-Meteo forecast API (model data)",
    sourceTimestamp: timestampText,
    sourceMethod:
      'Open-Meteo "best match" blend of weather-model output, grid spacing roughly 10-25 km. Past hours are model values, not rain-gauge observations.',
    stationLabel: gridLabel,
    sourceKindLabel: "Model data",
    hardwareLabel: "Model grid, not a sensor",
    accuracyLabel: "Uncalibrated",
  };

  const dis = d.discharge;
  const dailyVals = (d.flood?.daily?.river_discharge ?? []).filter(
    (v): v is number => typeof v === "number",
  );
  const riverLevel: SourceMetric = dis
    ? {
        title: "River discharge",
        iconType: "river",
        value: dis.value.toFixed(1),
        numericValue: +dis.value.toFixed(1),
        unit: "m³/s",
        trend: dis.ratio > 1.3 ? "Increasing" : "Stable",
        status:
          dis.ratio >= 2.8
            ? "Critical"
            : dis.ratio >= 1.8
              ? "High"
              : dis.ratio >= 1.3
                ? "Moderate"
                : "Normal",
        statusLevel:
          dis.ratio >= 2.8
            ? "SEVERE"
            : dis.ratio >= 1.8
              ? "HIGH"
              : dis.ratio >= 1.3
                ? "MEDIUM"
                : "LOW",
        thresholdLabel: "HydroGuard heuristic",
        thresholdValue: "1.8x recent median",
        sparkline: dailyVals,
        details: `Today's modelled discharge is ${dis.ratio.toFixed(2)}x the median of the earlier days (${dis.baseline.toFixed(1)} m³/s). This is a modelled daily value, not a river-gauge reading.`,
        sourceName:
          "Copernicus GloFAS via Open-Meteo Flood API (model, not a gauge)",
        sourceTimestamp: timestampText,
        sourceMethod:
          "GloFAS hydrological model on a ~5 km grid, daily values. The grid cell may not sit exactly on the Rishi Ganga channel.",
        stationLabel: gridLabel,
        sourceKindLabel: "Model data",
        hardwareLabel: "Model grid, not a gauge",
        accuracyLabel: "Uncalibrated",
      }
    : {
        title: "River discharge",
        iconType: "river",
        value: "Unavailable",
        numericValue: 0,
        unit: "m³/s",
        trend: "Stable",
        status: "Unavailable",
        statusLevel: "LOW",
        thresholdLabel: "HydroGuard heuristic",
        thresholdValue: "1.8x recent median",
        sparkline: [],
        details:
          "GloFAS discharge could not be fetched or has too little history. The river factor is excluded from the score and the other weights are renormalized.",
        sourceName:
          "Copernicus GloFAS via Open-Meteo Flood API (model, not a gauge)",
        sourceTimestamp: timestampText,
        sourceMethod: "No value available.",
        stationLabel: gridLabel,
        sourceKindLabel: "Model data",
        hardwareLabel: "Model grid, not a gauge",
        accuracyLabel: "n/a",
        unavailable: true,
        unavailableReason: "Discharge data unavailable",
      };

  const soilMoisture: SourceMetric = {
    title: "Topsoil moisture",
    iconType: "soil",
    value: String(soilPct),
    numericValue: soilPct,
    unit: "% of assumed cap.",
    trend: soilPct > 65 ? "Elevated" : "Stable",
    status:
      soilPct >= 85
        ? "Highly saturated"
        : soilPct >= 70
          ? "High"
          : soilPct >= 50
            ? "Moderate"
            : "Normal",
    statusLevel:
      soilPct >= 85
        ? "SEVERE"
        : soilPct >= 70
          ? "HIGH"
          : soilPct >= 50
            ? "MEDIUM"
            : "LOW",
    thresholdLabel: "HydroGuard heuristic",
    thresholdValue: "85% of assumed capacity",
    sparkline: soilSeries
      .slice(recentFrom, d.idx + 1)
      .map((v) => soilToPct(num(v))),
    details: `Model topsoil moisture ${soilRawNow.toFixed(3)} m³/m³ divided by an assumed field capacity of ${MODEL_ASSUMPTIONS.soilFieldCapacityM3M3} m³/m³ (Assumption). Real capacity depends on the local soil.`,
    sourceName: "Open-Meteo forecast API (model data)",
    sourceTimestamp: timestampText,
    sourceMethod:
      "Weather-model land-surface scheme, 0-7 cm layer. Not a soil probe.",
    stationLabel: gridLabel,
    sourceKindLabel: "Model data",
    hardwareLabel: "Model grid, not a probe",
    accuracyLabel: "Capacity assumed",
  };

  const terrainSatellite: SourceMetric = {
    title: "Terrain / slope",
    iconType: "satellite",
    value: "Not integrated",
    numericValue: 0,
    unit: "",
    trend: "Stable",
    status: "Not integrated",
    statusLevel: "LOW",
    thresholdLabel: "Status",
    thresholdValue: "Planned: DEM + Sentinel-1",
    sparkline: [],
    details:
      "No elevation-model or satellite data feeds the score yet. Terrain analysis and cryospheric triggers are planned.",
    sourceName: "None (planned)",
    sourceTimestamp: "-",
    sourceMethod: "Not integrated.",
    stationLabel: "No data source",
    sourceKindLabel: "Planned",
    hardwareLabel: "Not integrated",
    accuracyLabel: "n/a",
    unavailable: true,
    unavailableReason: "Not integrated yet",
  };

  // ---- Real trend history for the driving village: score recomputed for each past hour ----
  const trendHistory: TrendPoint[] = [];
  const trendStart = Math.max(0, d.idx - (MODEL_ASSUMPTIONS.trendHours - 1));
  for (let k = trendStart; k <= d.idx; k++) {
    const hourDate = new Date(`${d.loc.hourly.time[k]}:00Z`);
    const ratioAtK = dischargeRatioForDate(
      d.flood?.daily,
      utcDateKey(hourDate),
    );
    const inp = inputsAt(
      d.loc,
      k,
      ratioAtK ? ratioAtK.ratio : null,
      freshnessText,
    );
    if (!inp) continue;
    const sc = calculateTransparentRiskScore(inp);
    trendHistory.push({
      time: formatIST(hourDate),
      rainfallMm: +inp.rain24hMm.toFixed(1), // rolling 24 h cumulative rainfall
      riskScore: sc.totalScore,
      soilSaturationPct: inp.soilMoistureSaturationPct,
      timestampIso: d.loc.hourly.time[k],
    });
  }

  // ---- Headline / description ----
  const tier = driverScore.riskLevel;
  const hazardCopy: Record<RiskLevel, { headline: string; text: string }> = {
    LOW: {
      headline: "Nominal catchment conditions",
      text: "The combined score is low for all villages. Check the indicator cards for any that are elevated.",
    },
    MEDIUM: {
      headline: "Weather advisory: active precipitation",
      text: "Modelled rainfall and topsoil moisture are above normal in part of the catchment.",
    },
    HIGH: {
      headline: "Elevated flood watch",
      text: "Several modelled indicators are above their watch levels. Prepare and monitor closely.",
    },
    SEVERE: {
      headline: "Severe flash flood risk indicated by model data",
      text: "Most modelled indicators are above their watch levels. Follow instructions from the local authorities.",
    },
  };
  const headline = hazardCopy[tier].headline;
  const description = `${hazardCopy[tier].text} Highest score: ${d.cfg.name} (${driverScore.totalScore}/100). Values are model output, not sensor readings.`;

  // ---- Computed alerts (shown on screen only, never dispatched) ----
  const alerts: AlertHistoryItem[] = villages
    .filter(
      (v) => TIER_ORDER.indexOf(v.riskLevel) >= TIER_ORDER.indexOf("HIGH"),
    )
    .map((v) => ({
      id: `live-${v.id}`,
      time: `${formatIST(refDate)} IST`,
      relativeTime: isCached ? `data ${cacheAgeMinutes} min old` : "now",
      level: v.riskLevel,
      title:
        v.riskLevel === "SEVERE"
          ? "Computed flash flood warning"
          : "Computed flood watch",
      area: v.name,
      status: "ACTIVE" as const,
      channels: [],
      leadTime: "Not forecast",
      instructions: `Score ${v.riskScore}/100 from model data. Not dispatched to any channel.`,
    }));

  return {
    villageScores: Object.fromEntries(scored.map((s) => [s.cfg.id, s.score])),
    validAtIso: d.loc.hourly.time[d.idx] + ":00Z",
    metrics: { rainfall, riverLevel, soilMoisture, terrainSatellite },
    trendHistory,
    riskScore: driverScore,
    villages,
    headline,
    description,
    lastUpdatedText: isCached
      ? `Cached (${cacheAgeMinutes} min ago)`
      : `${formatIST(refDate, true)} IST`,
    isCached,
    cacheAgeMinutes,
    drivingVillageName: d.cfg.name,
    alerts,
    fetchedAtIso: bundle.fetchedAtIso,
  };
}

// ---------------------------------------------------------------------------
// Historical replay data
// ---------------------------------------------------------------------------
export async function fetchHistoricalEventArchive(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<{
  times: string[];
  precipitation: Array<number | null>;
  soilMoisture: Array<number | null>;
}> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${daysBefore(startDate, 3)}&end_date=${endDate}&models=era5&hourly=precipitation,soil_moisture_0_to_7cm&timezone=Asia%2FKolkata`;
  const res = await fetchWithTimeout(url, 12000, signal);
  if (!res.ok) throw new Error(`Archive API error: ${res.status}`);
  const data = await res.json();
  return {
    times: data.hourly.time || [],
    precipitation: data.hourly.precipitation || [],
    soilMoisture: data.hourly.soil_moisture_0_to_7cm || [],
  };
}

/**
 * Daily GloFAS discharge for an event window (plus the days before it for the baseline).
 * Returns null when the flood API has nothing for these dates; the replay then excludes the river factor.
 */
export async function fetchHistoricalDischarge(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<{ time: string[]; river_discharge: Array<number | null> } | null> {
  try {
    const start = new Date(`${startDate}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() - 8);
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&start_date=${utcDateKey(start)}&end_date=${endDate}`;
    const res = await fetchWithTimeout(url, 12000, signal);
    if (!res.ok) return null;
    const json = await res.json();
    const daily = json?.daily;
    if (!daily?.time || !daily?.river_discharge) return null;
    if (!daily.river_discharge.some((v: unknown) => typeof v === "number"))
      return null;
    return { time: daily.time, river_discharge: daily.river_discharge };
  } catch (e) {
    signal?.throwIfAborted();
    console.warn("Historical discharge unavailable", e);
    return null;
  }
}
