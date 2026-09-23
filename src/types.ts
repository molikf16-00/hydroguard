export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "SEVERE";

export type SimulationScenario = "NORMAL" | "RISING" | "SEVERE";

export type AppMode = "LIVE" | "DEMO";

export interface CatchmentOption {
  id: string;
  name: string;
  state: string;
  basin: string;
  elevationRange: string;
  sensorNodesCount: number;
}

export interface VillageData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  riskLevel: RiskLevel;
  riskScore: number;
}

export interface SourceMetric {
  title: string;
  iconType: "rain" | "river" | "soil" | "satellite";
  value: string;
  numericValue: number;
  unit: string;
  trend: "Increasing" | "Decreasing" | "Stable" | "Elevated";
  status:
    | "Normal"
    | "Moderate"
    | "High"
    | "Critical"
    | "Highly saturated"
    | "Unavailable"
    | "Not integrated";
  statusLevel: RiskLevel;
  thresholdLabel: string;
  thresholdValue: string;
  sparkline: number[];
  details: string;
  sourceName?: string;
  sourceTimestamp?: string;
  sourceMethod?: string;
  /** Overrides for the card header (Live mode uses these to say "model grid cell", never a sensor). */
  stationLabel?: string;
  sourceKindLabel?: string;
  hardwareLabel?: string;
  accuracyLabel?: string;
  /** True when no value could be fetched or the input is not integrated yet. */
  unavailable?: boolean;
  unavailableReason?: string;
}

export interface TrendPoint {
  time: string;
  rainfallMm: number;
  /** Simulated river stage. Only present in Demo Simulator data; Live mode has no river-stage measurement. */
  riverLevelM?: number;
  riskScore: number; // 0 to 100
  soilSaturationPct: number;
  timestampIso?: string;
}

export interface AlertHistoryItem {
  id: string;
  time: string;
  relativeTime: string;
  level: RiskLevel;
  title: string;
  area: string;
  status: "ACTIVE" | "DISPATCHED" | "STANDBY" | "RESOLVED";
  channels: string[];
  leadTime: string;
  instructions: string;
  recommendedAction?: string;
  capXml?: string;
}

export interface ChannelStatus {
  id: string;
  name: string;
  icon: string;
  technology: string;
  status: "OPERATIONAL" | "STANDBY" | "READY" | "MESH_ACTIVE" | "PLANNED";
  coverage: string;
  latency: string;
  notes: string;
}

export interface RiskFactorItem {
  id: string;
  name: string;
  weightPercent: number; // e.g. 35
  rawValue: string;
  numericValue: number;
  unit: string;
  contributionPoints: number; // e.g. 28 / 35
  maxPoints: number; // e.g. 35
  thresholdText: string;
  isWatchExceeded: boolean;
  statusColor: "emerald" | "amber" | "orange" | "red";
  description: string;
  /** True when the input could not be fetched; the factor is excluded and weights renormalized. */
  unavailable?: boolean;
}

export interface SignalAgreement {
  activeSignals: number; // e.g. 3
  totalSignals: number; // 4
  percent: number; // 75
  freshness: string; // e.g. "Live sync: 42s ago" or "Cached: 4m ago"
  statusText: string;
}

export interface TransparentRiskScore {
  totalScore: number; // 0 - 100
  riskLevel: RiskLevel;
  factors: RiskFactorItem[];
  signalAgreement: SignalAgreement;
  methodologyNote: string;
}

export interface SimulatedDispatchLogEntry {
  id: string;
  timestamp: string;
  channelName: string;
  destination: string;
  latencyTarget: string;
  status: string;
  payloadSnippet: string;
}

export interface MetricInspectionData {
  title: string;
  value: string;
  unit: string;
  status: string;
  statusLevel: RiskLevel;
  source: string;
  timestamp: string;
  methodNote: string;
  threshold: string;
}
