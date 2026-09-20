import { RiskLevel, TransparentRiskScore, RiskFactorItem, SignalAgreement } from '../types';

/**
 * TRANSPARENT HYDROLOGICAL RISK SCORING ENGINE
 *
 * Implements an explainable, weighted 0–100 score compliant with IMD (India
 * Meteorological Department) standard rainfall intensity brackets and GloFAS
 * hydrological runoff anomaly ratios.
 *
 * Factors & Weight Distribution:
 * 1. Rainfall Intensity (1h / 3h / 24h vs IMD Brackets) : 35% (max 35 pts)
 * 2. 72-Hour Antecedent Rainfall (Soil Reservoir Load) : 20% (max 20 pts)
 * 3. Soil Moisture Volumetric Saturation (0–7 cm depth): 25% (max 25 pts)
 * 4. River Discharge Spike Relative to Recent Baseline  : 20% (max 20 pts)
 */

export interface RiskCalculationInputs {
  rain1hMm: number;
  rain3hMm: number;
  rain24hMm: number;
  rain72hAntecedentMm: number;
  soilMoistureSaturationPct: number; // 0 – 100 %
  riverDischargeRatio: number; // current / baseline (e.g. 1.0 = baseline, 2.5 = 250% of baseline)
  freshnessText?: string;
}

export function calculateTransparentRiskScore(inputs: RiskCalculationInputs): TransparentRiskScore {
  const {
    rain1hMm,
    rain3hMm,
    rain24hMm,
    rain72hAntecedentMm,
    soilMoistureSaturationPct,
    riverDischargeRatio,
    freshnessText = 'Live sync active',
  } = inputs;

  // -------------------------------------------------------------
  // FACTOR 1: Rainfall Intensity vs IMD Standards (Weight: 35%)
  // IMD Brackets for 24h:
  // - Light: < 15.6 mm
  // - Moderate: 15.6 - 64.4 mm
  // - Heavy: 64.5 - 115.5 mm (IMD Yellow/Orange threshold)
  // - Very Heavy: 115.6 - 204.4 mm (IMD Orange/Red threshold)
  // - Extremely Heavy: >= 204.5 mm (IMD Red disaster threshold)
  // 1h cloudburst precursor: > 15 mm/h (Heavy), > 35 mm/h (Severe), > 50 mm/h (Cloudburst)
  // -------------------------------------------------------------
  let rainFactorRatio = 0; // 0 to 1
  let rainThresholdText = '';
  let rainWatchExceeded = false;

  if (rain24hMm >= 204.5 || rain1hMm >= 50 || rain3hMm >= 90) {
    rainFactorRatio = 1.0;
    rainThresholdText = 'IMD Extremely Heavy (≥204.5mm/24h or ≥50mm/1h)';
    rainWatchExceeded = true;
  } else if (rain24hMm >= 115.6 || rain1hMm >= 30 || rain3hMm >= 60) {
    const fraction = (rain24hMm - 115.6) / (204.5 - 115.6);
    rainFactorRatio = 0.75 + Math.min(0.24, Math.max(0, fraction) * 0.24);
    rainThresholdText = 'IMD Very Heavy (115.6 – 204.4mm/24h)';
    rainWatchExceeded = true;
  } else if (rain24hMm >= 64.5 || rain1hMm >= 15 || rain3hMm >= 35) {
    const fraction = (rain24hMm - 64.5) / (115.6 - 64.5);
    rainFactorRatio = 0.50 + Math.min(0.24, Math.max(0, fraction) * 0.24);
    rainThresholdText = 'IMD Heavy Rainfall Warning (64.5 – 115.5mm/24h)';
    rainWatchExceeded = true;
  } else if (rain24hMm >= 15.6 || rain1hMm >= 5 || rain3hMm >= 12) {
    const fraction = (rain24hMm - 15.6) / (64.5 - 15.6);
    rainFactorRatio = 0.20 + Math.min(0.29, Math.max(0, fraction) * 0.29);
    rainThresholdText = 'IMD Moderate Rainfall (15.6 – 64.4mm/24h)';
    rainWatchExceeded = false;
  } else {
    rainFactorRatio = Math.min(0.18, (rain24hMm / 15.6) * 0.18);
    rainThresholdText = 'IMD Light or Nil Rainfall (<15.6mm/24h)';
    rainWatchExceeded = false;
  }

  const rainPoints = Math.round(rainFactorRatio * 35);

  // -------------------------------------------------------------
  // FACTOR 2: 72h Antecedent Rainfall (Weight: 20%)
  // Antecedent precipitation primes mountain catchment runoff
  // > 160 mm = Critical saturated catchment
  // 80 - 160 mm = High antecedent charge
  // 35 - 80 mm = Moderate charge
  // < 35 mm = Dry or low antecedent
  // -------------------------------------------------------------
  let antRatio = 0;
  let antThresholdText = '';
  let antWatchExceeded = false;

  if (rain72hAntecedentMm >= 160) {
    antRatio = 1.0;
    antThresholdText = 'Critical Antecedent Load (≥160mm in 72h)';
    antWatchExceeded = true;
  } else if (rain72hAntecedentMm >= 80) {
    antRatio = 0.65 + ((rain72hAntecedentMm - 80) / 80) * 0.34;
    antThresholdText = 'Elevated Catchment Saturation (80 – 160mm in 72h)';
    antWatchExceeded = true;
  } else if (rain72hAntecedentMm >= 35) {
    antRatio = 0.30 + ((rain72hAntecedentMm - 35) / 45) * 0.34;
    antThresholdText = 'Moderate Antecedent Moisture (35 – 80mm in 72h)';
    antWatchExceeded = false;
  } else {
    antRatio = Math.min(0.28, (rain72hAntecedentMm / 35) * 0.28);
    antThresholdText = 'Low Antecedent Infiltration (<35mm in 72h)';
    antWatchExceeded = false;
  }

  const antPoints = Math.round(antRatio * 20);

  // -------------------------------------------------------------
  // FACTOR 3: Soil Moisture Saturation (Weight: 25%)
  // Volumetric water content compared to field capacity
  // > 85% = Flash runoff immediate (zero infiltration)
  // 70 - 85% = High saturation
  // 50 - 70% = Moderate retention
  // < 50% = Dry soil with high buffering
  // -------------------------------------------------------------
  let soilRatio = 0;
  let soilThresholdText = '';
  let soilWatchExceeded = false;

  if (soilMoistureSaturationPct >= 85) {
    soilRatio = 0.85 + Math.min(0.15, ((soilMoistureSaturationPct - 85) / 15) * 0.15);
    soilThresholdText = 'Severe Topsoil Saturation (≥85% VWC)';
    soilWatchExceeded = true;
  } else if (soilMoistureSaturationPct >= 70) {
    soilRatio = 0.60 + ((soilMoistureSaturationPct - 70) / 15) * 0.24;
    soilThresholdText = 'High Saturation Zone (70 – 85% VWC)';
    soilWatchExceeded = true;
  } else if (soilMoistureSaturationPct >= 50) {
    soilRatio = 0.30 + ((soilMoistureSaturationPct - 50) / 20) * 0.29;
    soilThresholdText = 'Moderate Field Capacity (50 – 70% VWC)';
    soilWatchExceeded = false;
  } else {
    soilRatio = Math.min(0.28, (soilMoistureSaturationPct / 50) * 0.28);
    soilThresholdText = 'Safe Hydrological Infiltration Buffer (<50% VWC)';
    soilWatchExceeded = false;
  }

  const soilPoints = Math.round(soilRatio * 25);

  // -------------------------------------------------------------
  // FACTOR 4: River Discharge Relative to Recent Baseline (Weight: 20%)
  // Ratio of current discharge Q vs 5-day baseline mean Q_mean
  // > 2.8x = Severe surge / debris pulse
  // 1.8x - 2.8x = High stage
  // 1.3x - 1.8x = Moderate stage rise
  // < 1.3x = Nominal stream flow
  // -------------------------------------------------------------
  let riverRatio = 0;
  let riverThresholdText = '';
  let riverWatchExceeded = false;

  if (riverDischargeRatio >= 2.8) {
    riverRatio = 1.0;
    riverThresholdText = 'Surge Anomaly (≥2.8× baseline discharge)';
    riverWatchExceeded = true;
  } else if (riverDischargeRatio >= 1.8) {
    riverRatio = 0.65 + ((riverDischargeRatio - 1.8) / 1.0) * 0.34;
    riverThresholdText = 'Elevated River Swell (1.8× – 2.8× baseline)';
    riverWatchExceeded = true;
  } else if (riverDischargeRatio >= 1.3) {
    riverRatio = 0.30 + ((riverDischargeRatio - 1.3) / 0.5) * 0.34;
    riverThresholdText = 'Moderate Stage Fluctuation (1.3× – 1.8× baseline)';
    riverWatchExceeded = false;
  } else {
    riverRatio = Math.min(0.28, Math.max(0, (riverDischargeRatio / 1.3) * 0.28));
    riverThresholdText = 'Nominal Baseflow (<1.3× baseline)';
    riverWatchExceeded = false;
  }

  const riverPoints = Math.round(riverRatio * 20);

  // Sum total score (0 to 100)
  const rawTotal = rainPoints + antPoints + soilPoints + riverPoints;
  const totalScore = Math.min(100, Math.max(0, rawTotal));

  // Map to 4 official tiers
  let riskLevel: RiskLevel = 'LOW';
  if (totalScore >= 80) {
    riskLevel = 'SEVERE';
  } else if (totalScore >= 60) {
    riskLevel = 'HIGH';
  } else if (totalScore >= 30) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Signal Agreement: count independent watch signals exceeded
  const signals = [rainWatchExceeded, antWatchExceeded, soilWatchExceeded, riverWatchExceeded];
  const activeSignals = signals.filter(Boolean).length;
  const totalSignals = 4;
  const agreementPercent = Math.round((activeSignals / totalSignals) * 100);

  let agreementStatusText = 'Nominal Baseline';
  if (activeSignals >= 3) {
    agreementStatusText = 'High Multi-Signal Consensus';
  } else if (activeSignals === 2) {
    agreementStatusText = 'Elevated Signal Agreement';
  } else if (activeSignals === 1) {
    agreementStatusText = 'Isolated Signal Alert';
  }

  const signalAgreement: SignalAgreement = {
    activeSignals,
    totalSignals,
    percent: agreementPercent,
    freshness: freshnessText,
    statusText: agreementStatusText,
  };

  const getStatusColor = (pts: number, max: number): 'emerald' | 'amber' | 'orange' | 'red' => {
    const p = pts / max;
    if (p >= 0.8) return 'red';
    if (p >= 0.6) return 'orange';
    if (p >= 0.3) return 'amber';
    return 'emerald';
  };

  const factors: RiskFactorItem[] = [
    {
      id: 'rainfall-intensity',
      name: '1h/3h/24h Rain Intensity (IMD Categories)',
      weightPercent: 35,
      rawValue: `${rain24hMm.toFixed(1)} mm/24h (${rain1hMm.toFixed(1)} mm/1h)`,
      numericValue: rain24hMm,
      unit: 'mm',
      contributionPoints: rainPoints,
      maxPoints: 35,
      thresholdText: rainThresholdText,
      isWatchExceeded: rainWatchExceeded,
      statusColor: getStatusColor(rainPoints, 35),
      description: 'Evaluated against official IMD categories: Heavy (64.5-115.5mm), Very Heavy (115.6-204.4mm), Extremely Heavy (≥204.5mm).',
    },
    {
      id: 'antecedent-rainfall',
      name: '72h Antecedent Catchment Rainfall',
      weightPercent: 20,
      rawValue: `${rain72hAntecedentMm.toFixed(1)} mm`,
      numericValue: rain72hAntecedentMm,
      unit: 'mm/72h',
      contributionPoints: antPoints,
      maxPoints: 20,
      thresholdText: antThresholdText,
      isWatchExceeded: antWatchExceeded,
      statusColor: getStatusColor(antPoints, 20),
      description: 'Cumulative 3-day rainfall primes the mountain valley hydrology, rapidly exhausting subsurface infiltration capacity.',
    },
    {
      id: 'soil-moisture',
      name: 'Soil Moisture Saturation (0–7 cm depth)',
      weightPercent: 25,
      rawValue: `${soilMoistureSaturationPct.toFixed(0)}% VWC`,
      numericValue: soilMoistureSaturationPct,
      unit: '% VWC',
      contributionPoints: soilPoints,
      maxPoints: 25,
      thresholdText: soilThresholdText,
      isWatchExceeded: soilWatchExceeded,
      statusColor: getStatusColor(soilPoints, 25),
      description: 'Topsoil saturation ratio relative to field capacity. Saturation ≥85% leads to immediate surface overland flow.',
    },
    {
      id: 'river-discharge',
      name: 'River Discharge Surge vs Recent Baseline',
      weightPercent: 20,
      rawValue: `${riverDischargeRatio.toFixed(2)}× baseline`,
      numericValue: riverDischargeRatio,
      unit: 'ratio',
      contributionPoints: riverPoints,
      maxPoints: 20,
      thresholdText: riverThresholdText,
      isWatchExceeded: riverWatchExceeded,
      statusColor: getStatusColor(riverPoints, 20),
      description: 'Ratio of current river discharge to the 5-day rolling mean baseline (from GloFAS / river gauges).',
    },
  ];

  return {
    totalScore,
    riskLevel,
    factors,
    signalAgreement,
    methodologyNote:
      'Methodology & Calibration Note: HydroGuard uses a rule-based hydrological decision support engine combining IMD rainfall intensity brackets, antecedent storage exhaustion, soil saturation, and GloFAS river discharge anomalies. For field deployment, weights and threshold cutoffs must be empirically calibrated with Uttarakhand State Disaster Management Authority (USDMA) and Central Water Commission (CWC) gauging records.',
  };
}
