import { VillageData } from '../types';

/**
 * EDITABLE CATCHMENT & VILLAGE CONFIGURATION OBJECT
 *
 * Central configuration for the Chamoli / Rishi Ganga Catchment, Uttarakhand.
 * All village coordinates, elevations, populations, and distances from the
 * upstream trigger point are defined here and used dynamically across the system.
 */

export interface VillageConfigItem {
  id: string;
  name: string;
  cluster: string;
  lat: number;
  lon: number;
  population: number;
  elevationM: number;
  nearestShelter: string;
  walkingDistanceKm: number;
  distanceFromTriggerKm: number;
  coordinates: { xPercent: number; yPercent: number };
  safeRoute: string[];
  hazardFactors: string[];
  /** ILLUSTRATIVE: not surveyed. Replace with field data before any real use. */
  distanceFromRiverM?: number;
  /** ILLUSTRATIVE: not surveyed. Replace with field data before any real use. */
  shelterCapacity?: number;
}

/**
 * MODEL ASSUMPTIONS (uncalibrated). Every value here is an assumption, not a measurement.
 * They are shown in the UI as "Assumption" and must be calibrated with USDMA / CWC / IMD data.
 */
export const MODEL_ASSUMPTIONS = {
  /** Assumption: volumetric water content treated as 100% "field capacity" for the soil-saturation factor (m3/m3). */
  soilFieldCapacityM3M3: 0.42,
  /** Assumption: flood-wave speed range used for travel-time estimates (m/s). Not calibrated for any real event. */
  waveSpeedRangeMs: [2.0, 5.0] as [number, number],
  /** Assumption: uphill walking pace used for evacuation-time estimates (minutes per km). */
  walkingMinPerKm: 18,
  /** Hours of history shown on the live trend chart. */
  trendHours: 24,
};

export interface CatchmentSettings {
  id: string;
  name: string;
  state: string;
  basin: string;
  upstreamTriggerPoint: {
    name: string;
    lat: number;
    lon: number;
    elevationM: number;
    description: string;
  };
  assumedWaveSpeedRangeMs: [number, number]; // [minSpeed (2 m/s), maxSpeed (5 m/s)]
  villages: VillageConfigItem[];
}

export const DEFAULT_CATCHMENT_CONFIG: CatchmentSettings = {
  id: 'chamoli-rishi-ganga',
  name: 'Chamoli (Rishi Ganga Catchment)',
  state: 'Uttarakhand',
  basin: 'Alaknanda & Rishi Ganga River Basin',
  upstreamTriggerPoint: {
    name: 'Rishi Ganga / Nanda Devi Glacial Confluence',
    lat: 30.4600,
    lon: 79.7400,
    elevationM: 3700,
    description: 'Narrow gorge headwaters prone to glacial lake breach, rock-ice avalanches, and intense orographic cloudbursts.',
  },
  assumedWaveSpeedRangeMs: MODEL_ASSUMPTIONS.waveSpeedRangeMs, // ASSUMPTION (uncalibrated)
  villages: [
    {
      id: 'v-raini',
      name: 'Raini (Upper & Lower)',
      cluster: 'Cluster A (Upper Gorge Confluence)',
      lat: 30.4884,
      lon: 79.6972,
      population: 1240,
      elevationM: 1980,
      nearestShelter: 'Community Hall — Higher Ridge Point',
      walkingDistanceKm: 2.4,
      distanceFromTriggerKm: 4.8,
      coordinates: { xPercent: 34, yPercent: 44 },
      safeRoute: [
        'Evacuate riverbank dwellings via East Trail #2 uphill',
        'Avoid the bridge crossing across Rishi Ganga (active surge zone)',
        'Ascend to Government Senior Secondary School terrace',
        'Muster at Community Hall — High Ground Safe Refuge (2,120m)',
      ],
      hazardFactors: ['Low riverbed elevation', 'Narrow bottleneck canyon', 'Steep debris fan'],
      distanceFromRiverM: 120, // ILLUSTRATIVE (not surveyed)
      shelterCapacity: 500, // ILLUSTRATIVE (not surveyed)
    },
    {
      id: 'v-tapovan',
      name: 'Tapovan Outskirts',
      cluster: 'Cluster A (Upper Gorge Confluence)',
      lat: 30.4932,
      lon: 79.6275,
      population: 980,
      elevationM: 1820,
      nearestShelter: 'District Administrative High School',
      walkingDistanceKm: 3.1,
      distanceFromTriggerKm: 11.2,
      coordinates: { xPercent: 48, yPercent: 52 },
      safeRoute: [
        'Ascend north-western terraced orchards toward Hill Road 7',
        'Do not use low-lying bypass road B-14',
        'Gather at High School Emergency Refuge compound',
      ],
      hazardFactors: ['Sub-catchment confluence', 'Hydropower barrage proximity'],
      distanceFromRiverM: 150, // ILLUSTRATIVE (not surveyed)
      shelterCapacity: 400, // ILLUSTRATIVE (not surveyed)
    },
    {
      id: 'v-joshimath',
      name: 'Joshimath (North Slope)',
      cluster: 'Cluster B (Terrace & Hill Slopes)',
      lat: 30.5562,
      lon: 79.5661,
      population: 3200,
      elevationM: 2150,
      nearestShelter: 'Town Hall Sports Complex',
      walkingDistanceKm: 1.2,
      distanceFromTriggerKm: 17.8,
      coordinates: { xPercent: 78, yPercent: 32 },
      safeRoute: [
        'Direct road access to Town Hall Complex via Main Market artery',
        'Keep clear of natural drainage ravines (nalas)',
      ],
      hazardFactors: ['High elevation terrace but vulnerable to slope seepage and subsidence'],
      distanceFromRiverM: 400, // ILLUSTRATIVE (not surveyed)
      shelterCapacity: 1200, // ILLUSTRATIVE (not surveyed)
    },
    {
      id: 'v-helang',
      name: 'Helang Terrace',
      cluster: 'Cluster B (Terrace & Hill Slopes)',
      lat: 30.5283,
      lon: 79.5135,
      population: 1450,
      elevationM: 1520,
      nearestShelter: 'Helang Panchayat Bhawan',
      walkingDistanceKm: 1.8,
      distanceFromTriggerKm: 23.5,
      coordinates: { xPercent: 62, yPercent: 60 },
      safeRoute: [
        'Move upwards along ridge trail to Panchayat Bhawan',
        'Maintain clear line of sight from slope drainage gully',
      ],
      hazardFactors: ['Debris flow feeder stream', 'Highway embankment erosion'],
      distanceFromRiverM: 200, // ILLUSTRATIVE (not surveyed)
      shelterCapacity: 600, // ILLUSTRATIVE (not surveyed)
    },
    {
      id: 'v-pipalkoti',
      name: 'Pipalkoti Plateau',
      cluster: 'Cluster C (Lower Valley Buffer)',
      lat: 30.4300,
      lon: 79.4300,
      population: 2100,
      elevationM: 1340,
      nearestShelter: 'Regional Relief Storage Hub',
      walkingDistanceKm: 0.9,
      distanceFromTriggerKm: 38.0,
      coordinates: { xPercent: 88, yPercent: 78 },
      safeRoute: [
        'Primary highway route open; zero low-water obstruction',
        'Assemble at Central Relief Storage Hub terrace',
      ],
      hazardFactors: ['Downstream buffer plateau with wider channel capacity'],
      distanceFromRiverM: 250, // ILLUSTRATIVE (not surveyed)
      shelterCapacity: 800, // ILLUSTRATIVE (not surveyed)
    },
  ],
};

/**
 * ESTIMATED WAVE TRAVEL TIME (not a forecast lead time)
 * Travel time from the upstream trigger point to a village =
 *   distance / assumed wave speed (2-5 m/s, uncalibrated).
 * It says how long a wave would take to arrive AFTER a trigger, not how early rainfall data warns you.
 */
export function computeLeadTimeRange(
  distanceKm: number,
  waveSpeedRangeMs: [number, number] = [2.0, 5.0]
): {
  minSeconds: number;
  maxSeconds: number;
  minMinutes: number;
  maxMinutes: number;
  displayRange: string;
  formula: string;
} {
  const distanceMeters = distanceKm * 1000;
  const [minSpeed, maxSpeed] = waveSpeedRangeMs;

  // Fastest wave (max speed 5 m/s) arrives in shortest time
  const minSeconds = Math.round(distanceMeters / maxSpeed);
  // Slowest wave (min speed 2 m/s) arrives in longest time
  const maxSeconds = Math.round(distanceMeters / minSpeed);

  const minMinutes = Math.round(minSeconds / 60);
  const maxMinutes = Math.round(maxSeconds / 60);

  const formatMins = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const displayRange = `${formatMins(minMinutes)} – ${formatMins(maxMinutes)}`;
  const formula = `${distanceKm} km ÷ [${minSpeed}–${maxSpeed} m/s]`;

  return {
    minSeconds,
    maxSeconds,
    minMinutes,
    maxMinutes,
    displayRange,
    formula,
  };
}

export type CatchmentConfig = CatchmentSettings;
