import {
  RiskLevel,
  TransparentRiskScore,
  RiskFactorItem,
  SignalAgreement,
} from "../types";

/**
 * TRANSPARENT HYDROLOGICAL RISK SCORING ENGINE (rule-based, UNCALIBRATED)
 *
 * An explainable, weighted 0-100 score. What is and is not standard:
 *  - The 24-hour rainfall cut-offs follow IMD's rainfall categories
 *    (Heavy 64.5-115.5 mm, Very Heavy 115.6-204.4 mm, Extremely Heavy >= 204.5 mm).
 *  - The 1 h / 3 h triggers, the 72 h antecedent cut-offs, the soil cut-offs and the
 *    discharge-ratio cut-offs are HydroGuard heuristics. They are NOT IMD categories and
 *    have not been calibrated against gauge records.
 *  - The four indicators are all rain-driven, so they are correlated, not independent.
 *
 * Base weights: rainfall 35, antecedent rainfall 20, soil moisture 25, river discharge 20.
 * If river discharge is unavailable, that factor is excluded and the remaining weights are
 * renormalized to 100 (44 / 25 / 31) instead of guessing a discharge value.
 */

export interface RiskCalculationInputs {
  rain1hMm: number;
  rain3hMm: number;
  rain24hMm: number;
  rain72hAntecedentMm: number;
  /** Topsoil moisture as % of the ASSUMED field capacity (see MODEL_ASSUMPTIONS). */
  soilMoistureSaturationPct: number;
  /** today's discharge / median of previous days. null = discharge unavailable. */
  riverDischargeRatio: number | null;
  freshnessText?: string;
}

export const BASE_WEIGHTS = { rain: 35, antecedent: 20, soil: 25, river: 20 };
export const WEIGHTS_WITHOUT_RIVER = {
  rain: 44,
  antecedent: 25,
  soil: 31,
  river: 0,
};

export function calculateTransparentRiskScore(
  inputs: RiskCalculationInputs,
): TransparentRiskScore {
  for (const [key, value] of Object.entries(inputs)) {
    if (
      key === "freshnessText" ||
      (key === "riverDischargeRatio" && value === null)
    )
      continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
      throw new Error(`Invalid risk input: ${key}`);
  }
  const {
    rain1hMm,
    rain3hMm,
    rain24hMm,
    rain72hAntecedentMm,
    soilMoistureSaturationPct,
    riverDischargeRatio,
    freshnessText = "Live sync active",
  } = inputs;

  const riverAvailable =
    riverDischargeRatio !== null && Number.isFinite(riverDischargeRatio);
  const W = riverAvailable ? BASE_WEIGHTS : WEIGHTS_WITHOUT_RIVER;

  // -------------------------------------------------------------
  // FACTOR 1: Rainfall intensity
  //   24 h totals: IMD categories.  1 h / 3 h: HydroGuard heuristics (uncalibrated).
  //   level 0 light, 1 moderate, 2 heavy, 3 very heavy, 4 extremely heavy
  // -------------------------------------------------------------
  const level24 =
    rain24hMm >= 204.5
      ? 4
      : rain24hMm >= 115.6
        ? 3
        : rain24hMm >= 64.5
          ? 2
          : rain24hMm >= 15.6
            ? 1
            : 0;
  const level1h =
    rain1hMm >= 50
      ? 4
      : rain1hMm >= 30
        ? 3
        : rain1hMm >= 15
          ? 2
          : rain1hMm >= 5
            ? 1
            : 0;
  const level3h =
    rain3hMm >= 90
      ? 4
      : rain3hMm >= 60
        ? 3
        : rain3hMm >= 35
          ? 2
          : rain3hMm >= 12
            ? 1
            : 0;
  const rainLevel = Math.max(level24, level1h, level3h);

  const frac = (v: number, lo: number, hi: number) =>
    Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  let rainFactorRatio = 0;
  if (rainLevel === 4) rainFactorRatio = 1.0;
  else if (rainLevel === 3)
    rainFactorRatio = 0.75 + frac(rain24hMm, 115.6, 204.5) * 0.24;
  else if (rainLevel === 2)
    rainFactorRatio = 0.5 + frac(rain24hMm, 64.5, 115.6) * 0.24;
  else if (rainLevel === 1)
    rainFactorRatio = 0.2 + frac(rain24hMm, 15.6, 64.5) * 0.29;
  else rainFactorRatio = Math.min(0.18, (rain24hMm / 15.6) * 0.18);

  const imdNames = [
    "Light or nil",
    "Moderate",
    "Heavy",
    "Very Heavy",
    "Extremely Heavy",
  ];
  const imdRanges = [
    "< 15.6 mm",
    "15.6 - 64.4 mm",
    "64.5 - 115.5 mm",
    "115.6 - 204.4 mm",
    ">= 204.5 mm",
  ];
  let rainThresholdText = `IMD 24 h category: ${imdNames[level24]} (${imdRanges[level24]}/24 h)`;
  if (Math.max(level1h, level3h) > level24) {
    rainThresholdText += ` | raised by HydroGuard 1 h/3 h heuristic (uncalibrated): ${rain1hMm.toFixed(1)} mm/1 h, ${rain3hMm.toFixed(1)} mm/3 h`;
  }
  const rainWatchExceeded = rainLevel >= 2;
  const rainPoints = Math.round(rainFactorRatio * W.rain);

  // -------------------------------------------------------------
  // FACTOR 2: 72 h antecedent rainfall (HydroGuard heuristic cut-offs)
  // -------------------------------------------------------------
  let antRatio = 0;
  let antThresholdText = "";
  let antWatchExceeded = false;
  if (rain72hAntecedentMm >= 160) {
    antRatio = 1.0;
    antThresholdText =
      "Heuristic: critical antecedent load (>= 160 mm in 72 h)";
    antWatchExceeded = true;
  } else if (rain72hAntecedentMm >= 80) {
    antRatio = 0.65 + ((rain72hAntecedentMm - 80) / 80) * 0.34;
    antThresholdText =
      "Heuristic: elevated antecedent load (80 - 160 mm in 72 h)";
    antWatchExceeded = true;
  } else if (rain72hAntecedentMm >= 35) {
    antRatio = 0.3 + ((rain72hAntecedentMm - 35) / 45) * 0.34;
    antThresholdText =
      "Heuristic: moderate antecedent moisture (35 - 80 mm in 72 h)";
  } else {
    antRatio = Math.min(0.28, (rain72hAntecedentMm / 35) * 0.28);
    antThresholdText = "Heuristic: low antecedent load (< 35 mm in 72 h)";
  }
  const antPoints = Math.round(antRatio * W.antecedent);

  // -------------------------------------------------------------
  // FACTOR 3: Topsoil moisture as % of an ASSUMED field capacity (heuristic cut-offs)
  // -------------------------------------------------------------
  let soilRatio = 0;
  let soilThresholdText = "";
  let soilWatchExceeded = false;
  if (soilMoistureSaturationPct >= 85) {
    soilRatio =
      0.85 + Math.min(0.15, ((soilMoistureSaturationPct - 85) / 15) * 0.15);
    soilThresholdText =
      "Heuristic: near saturation (>= 85% of assumed field capacity)";
    soilWatchExceeded = true;
  } else if (soilMoistureSaturationPct >= 70) {
    soilRatio = 0.6 + ((soilMoistureSaturationPct - 70) / 15) * 0.24;
    soilThresholdText =
      "Heuristic: high saturation (70 - 85% of assumed field capacity)";
    soilWatchExceeded = true;
  } else if (soilMoistureSaturationPct >= 50) {
    soilRatio = 0.3 + ((soilMoistureSaturationPct - 50) / 20) * 0.29;
    soilThresholdText =
      "Heuristic: moderate (50 - 70% of assumed field capacity)";
  } else {
    soilRatio = Math.min(0.28, (soilMoistureSaturationPct / 50) * 0.28);
    soilThresholdText =
      "Heuristic: infiltration buffer available (< 50% of assumed field capacity)";
  }
  const soilPoints = Math.round(soilRatio * W.soil);

  // -------------------------------------------------------------
  // FACTOR 4: River discharge vs the median of the previous days (only if available)
  // -------------------------------------------------------------
  let riverRatio = 0;
  let riverThresholdText = "";
  let riverWatchExceeded = false;
  if (riverAvailable) {
    const r = riverDischargeRatio as number;
    if (r >= 2.8) {
      riverRatio = 1.0;
      riverThresholdText = "Heuristic: surge (>= 2.8x recent median)";
      riverWatchExceeded = true;
    } else if (r >= 1.8) {
      riverRatio = 0.65 + ((r - 1.8) / 1.0) * 0.34;
      riverThresholdText = "Heuristic: elevated (1.8x - 2.8x recent median)";
      riverWatchExceeded = true;
    } else if (r >= 1.3) {
      riverRatio = 0.3 + ((r - 1.3) / 0.5) * 0.34;
      riverThresholdText =
        "Heuristic: moderate rise (1.3x - 1.8x recent median)";
    } else {
      riverRatio = Math.min(0.28, Math.max(0, (r / 1.3) * 0.28));
      riverThresholdText = "Heuristic: nominal flow (< 1.3x recent median)";
    }
  } else {
    riverThresholdText =
      "Excluded: river discharge unavailable, weights renormalized";
  }
  const riverPoints = riverAvailable ? Math.round(riverRatio * W.river) : 0;

  const totalScore = Math.min(
    100,
    Math.max(0, rainPoints + antPoints + soilPoints + riverPoints),
  );

  let riskLevel: RiskLevel = "LOW";
  if (totalScore >= 80) riskLevel = "SEVERE";
  else if (totalScore >= 60) riskLevel = "HIGH";
  else if (totalScore >= 30) riskLevel = "MEDIUM";

  // Indicator agreement: how many available indicators are above their watch level.
  // These indicators are correlated (all rain-driven), so this is agreement, not independent confirmation.
  const signals = [
    rainWatchExceeded,
    antWatchExceeded,
    soilWatchExceeded,
    ...(riverAvailable ? [riverWatchExceeded] : []),
  ];
  const totalSignals = signals.length;
  const activeSignals = signals.filter(Boolean).length;
  const agreementPercent = Math.round((activeSignals / totalSignals) * 100);

  let agreementStatusText = "Nominal baseline";
  const share = activeSignals / totalSignals;
  if (share >= 0.75) agreementStatusText = "High indicator agreement";
  else if (share >= 0.5) agreementStatusText = "Elevated indicator agreement";
  else if (activeSignals >= 1) agreementStatusText = "Isolated indicator alert";

  const signalAgreement: SignalAgreement = {
    activeSignals,
    totalSignals,
    percent: agreementPercent,
    freshness: freshnessText,
    statusText: agreementStatusText,
  };

  const getStatusColor = (
    pts: number,
    max: number,
  ): "emerald" | "amber" | "orange" | "red" => {
    if (max <= 0) return "emerald";
    const p = pts / max;
    if (p >= 0.8) return "red";
    if (p >= 0.6) return "orange";
    if (p >= 0.3) return "amber";
    return "emerald";
  };

  const factors: RiskFactorItem[] = [
    {
      id: "rainfall-intensity",
      name: "Rainfall intensity (1 h / 3 h / 24 h)",
      weightPercent: W.rain,
      rawValue: `${rain24hMm.toFixed(1)} mm/24 h (${rain1hMm.toFixed(1)} mm/1 h)`,
      numericValue: rain24hMm,
      unit: "mm",
      contributionPoints: rainPoints,
      maxPoints: W.rain,
      thresholdText: rainThresholdText,
      isWatchExceeded: rainWatchExceeded,
      statusColor: getStatusColor(rainPoints, W.rain),
      description:
        "Only the 24 h cut-offs are IMD categories (Heavy 64.5-115.5, Very Heavy 115.6-204.4, Extremely Heavy >= 204.5 mm). The 1 h and 3 h triggers are HydroGuard heuristics and are uncalibrated.",
    },
    {
      id: "antecedent-rainfall",
      name: "72 h antecedent rainfall",
      weightPercent: W.antecedent,
      rawValue: `${rain72hAntecedentMm.toFixed(1)} mm`,
      numericValue: rain72hAntecedentMm,
      unit: "mm/72h",
      contributionPoints: antPoints,
      maxPoints: W.antecedent,
      thresholdText: antThresholdText,
      isWatchExceeded: antWatchExceeded,
      statusColor: getStatusColor(antPoints, W.antecedent),
      description:
        "Three-day rainfall total as a proxy for how wet the catchment already is. Cut-offs are heuristic and uncalibrated.",
    },
    {
      id: "soil-moisture",
      name: "Topsoil moisture (0-7 cm, model)",
      weightPercent: W.soil,
      rawValue: `${soilMoistureSaturationPct.toFixed(0)}% of assumed field capacity`,
      numericValue: soilMoistureSaturationPct,
      unit: "% of assumed field cap.",
      contributionPoints: soilPoints,
      maxPoints: W.soil,
      thresholdText: soilThresholdText,
      isWatchExceeded: soilWatchExceeded,
      statusColor: getStatusColor(soilPoints, W.soil),
      description:
        "Model topsoil moisture divided by an assumed field capacity of 0.42 m3/m3 (Assumption, see config). Real capacity varies with soil type.",
    },
    {
      id: "river-discharge",
      name: "River discharge vs recent median (model)",
      weightPercent: W.river,
      rawValue: riverAvailable
        ? `${(riverDischargeRatio as number).toFixed(2)}x recent median`
        : "Unavailable",
      numericValue: riverAvailable ? (riverDischargeRatio as number) : 0,
      unit: "ratio",
      contributionPoints: riverPoints,
      maxPoints: riverAvailable ? W.river : 0,
      thresholdText: riverThresholdText,
      isWatchExceeded: riverWatchExceeded,
      statusColor: getStatusColor(riverPoints, riverAvailable ? W.river : 0),
      description:
        "Today's GloFAS modelled river discharge relative to the median of the previous days. It is model output on a ~5 km grid, not a river gauge.",
      unavailable: !riverAvailable,
    },
  ];

  return {
    totalScore,
    riskLevel,
    factors,
    signalAgreement,
    methodologyNote:
      "Rule-based decision-support scoring, not a validated forecast model. Only the 24-hour rainfall cut-offs follow IMD categories; every other threshold is a HydroGuard heuristic and the soil field capacity is an assumption. The four indicators are all rain-driven and therefore correlated. Before field use, weights and cut-offs must be calibrated against USDMA, CWC and IMD gauge records.",
  };
}
