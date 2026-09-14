export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';

export type SimulationScenario = 'NORMAL' | 'RISING' | 'SEVERE';

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
  cluster: string;
  riskLevel: RiskLevel;
  population: number;
  estimatedImpactTime: string;
  nearestShelter: string;
  shelterDistanceKm: number;
  evacuationTimeMin: number;
  recommendedAction: string;
  elevationM: number;
  coordinates: { xPercent: number; yPercent: number };
  safeRoute: string[];
  hazardFactors: string[];
}

export interface SourceMetric {
  title: string;
  iconType: 'rain' | 'river' | 'soil' | 'satellite';
  value: string;
  numericValue: number;
  unit: string;
  trend: 'Increasing' | 'Decreasing' | 'Stable' | 'Elevated';
  status: 'Normal' | 'Moderate' | 'High' | 'Critical' | 'Highly saturated';
  statusLevel: RiskLevel;
  thresholdLabel: string;
  thresholdValue: string;
  sparkline: number[];
  details: string;
}

export interface TrendPoint {
  time: string;
  rainfallMm: number;
  riverLevelM: number;
  riskScore: number; // 0 to 100
  soilSaturationPct: number;
}

export interface AlertHistoryItem {
  id: string;
  time: string;
  relativeTime: string;
  level: RiskLevel;
  title: string;
  area: string;
  status: 'ACTIVE' | 'DISPATCHED' | 'STANDBY' | 'RESOLVED';
  channels: string[];
  leadTime: string;
  instructions: string;
  recommendedAction?: string;
}

export interface ChannelStatus {
  id: string;
  name: string;
  icon: string;
  technology: string;
  status: 'OPERATIONAL' | 'STANDBY' | 'READY' | 'MESH_ACTIVE';
  coverage: string;
  latency: string;
  notes: string;
}
