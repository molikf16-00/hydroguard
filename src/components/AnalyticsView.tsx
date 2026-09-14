import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CloudRain,
  Waves,
  Droplets,
  AlertTriangle,
  History,
  ShieldAlert,
  Percent,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { TrendPoint, RiskLevel, VillageData } from '../types';
import { HISTORICAL_COMPARISONS } from '../data/mockData';

interface AnalyticsViewProps {
  trendHistory: TrendPoint[];
  overallRisk: RiskLevel;
  villages: VillageData[];
  alertsCount: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trendHistory,
  overallRisk,
  villages,
  alertsCount,
}) => {
  const affectedVillagesCount = villages.filter(
    (v) => v.riskLevel === 'SEVERE' || v.riskLevel === 'HIGH'
  ).length;

  const currentPoint = trendHistory[trendHistory.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-800" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase sm:text-2xl">
                Hydrological & Predictive Risk Analytics
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Multi-source time-series fusion, telemetry threshold compliance, and historical flash flood benchmarks
            </p>
          </div>

          <span className="rounded-md bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700 border border-slate-200">
            TELEMETRY REPOSIT: CATCHMENT-CHAMOLI
          </span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
        {/* Risk Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Flood Risk Score</span>
          <div className="mt-1 text-2xl font-extrabold font-mono text-rose-600">
            {currentPoint.riskScore}<span className="text-xs text-slate-400">/100</span>
          </div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
            Level: {overallRisk}
          </span>
        </div>

        {/* 6h Rainfall */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cumulative Rain</span>
          <div className="mt-1 text-2xl font-extrabold font-mono text-slate-900">
            {currentPoint.rainfallMm}<span className="text-xs text-slate-400"> mm</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Rate: 38 mm/hr
          </span>
        </div>

        {/* River Level */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">River Stage</span>
          <div className="mt-1 text-2xl font-extrabold font-mono text-cyan-700">
            {currentPoint.riverLevelM}<span className="text-xs text-slate-400"> m</span>
          </div>
          <span className="text-[11px] text-red-600 mt-1 block font-bold">
            +0.6m above danger
          </span>
        </div>

        {/* Soil Moisture */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Soil Saturation</span>
          <div className="mt-1 text-2xl font-extrabold font-mono text-emerald-700">
            {currentPoint.soilSaturationPct}<span className="text-xs text-slate-400">%</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block font-semibold">
            Runoff limit: 75%
          </span>
        </div>

        {/* Number of Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dispatched Alerts</span>
          <div className="mt-1 text-2xl font-extrabold font-mono text-slate-900">
            {alertsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            4 broadcast channels
          </span>
        </div>

        {/* Affected Villages */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">High-Risk Villages</span>
          <div className="mt-1 text-2xl font-extrabold font-mono text-red-600">
            {affectedVillagesCount} <span className="text-xs text-slate-400">/ {villages.length}</span>
          </div>
          <span className="text-[11px] text-red-600 mt-1 block font-semibold">
            Cluster A & B
          </span>
        </div>
      </div>

      {/* Signal Correlation & Machine Learning Weights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Progression Timeline (Cols 7) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                Chronological Multi-Sensor Progression (06:00 – 11:00)
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing how individual signals compound into escalating risk scores
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {trendHistory.map((point) => (
              <div key={point.time} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{point.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    point.riskScore >= 80
                      ? 'bg-red-100 text-red-700'
                      : point.riskScore >= 50
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    Risk Index: {point.riskScore}/100
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Rainfall: {point.rainfallMm} mm</span>
                      <span>{Math.round((point.rainfallMm / 140) * 100)}% capacity</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{ width: `${Math.min((point.rainfallMm / 140) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>River Level: {point.riverLevelM} m (Danger: 5.2m)</span>
                      <span className={point.riverLevelM >= 5.2 ? 'text-red-600 font-bold' : ''}>
                        {Math.round((point.riverLevelM / 7.0) * 100)}% depth
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${point.riverLevelM >= 5.2 ? 'bg-red-600' : 'bg-cyan-600'}`}
                        style={{ width: `${Math.min((point.riverLevelM / 7.0) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                      <span>Soil Saturation: {point.soilSaturationPct}%</span>
                      <span className={point.soilSaturationPct >= 75 ? 'text-amber-700 font-bold' : ''}>
                        {point.soilSaturationPct >= 75 ? 'SURFACE RUNOFF ACTIVE' : 'Absorptive'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${point.soilSaturationPct >= 75 ? 'bg-amber-600' : 'bg-emerald-600'}`}
                        style={{ width: `${point.soilSaturationPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: ML Model Feature Weights (Cols 5) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                Multi-Source Fusion Weights (Feature Importance)
              </h3>
              <p className="text-xs text-slate-500">
                Hydrological Random Forest & LSTM ensemble weighting model
              </p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">1. Instantaneous Rainfall Intensity</span>
                  <span className="font-bold text-slate-900 font-mono">35% Weight</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  High-altitude convective cloudburst detection from Doppler radar & rain gauges.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">2. River Rate of Rise (dh/dt)</span>
                  <span className="font-bold text-cyan-700 font-mono">30% Weight</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Velocity of stage increase measured via FMCW radar gauges along canyon bottlenecks.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">3. Antecedent Soil Saturation</span>
                  <span className="font-bold text-emerald-700 font-mono">20% Weight</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  TDR pore pressure probes indicating soil moisture deficit before surface runoff occurs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">4. DEM Slope Instability & Drainage</span>
                  <span className="font-bold text-purple-700 font-mono">15% Weight</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Topographic wetness index and slope gradient (&gt;30°) driving rapid catchment concentration.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 mt-4">
            <span className="font-bold text-slate-900">Himalayan Hydrology Rule:</span> Unlike flat plains where floods take days to rise, mountainous valleys experience flash floods in 30–120 minutes due to steep rocky catchments with low storage.
          </div>
        </div>
      </div>

      {/* Historical Event Comparison Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-800" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Historical Himalayan Flash Flood Benchmark Comparison
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Validating HydroGuard Warning Lead Time Improvements
          </span>
        </div>

        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-3 rounded-l-md">Historical Event</th>
                <th className="py-2.5 px-3">Catchment & Type</th>
                <th className="py-2.5 px-3">Rainfall / Trigger</th>
                <th className="py-2.5 px-3">Peak River Level</th>
                <th className="py-2.5 px-3">Actual Historical Lead Time</th>
                <th className="py-2.5 px-3 rounded-r-md">HydroGuard Projected Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {HISTORICAL_COMPARISONS.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {item.event}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <div className="font-medium text-slate-800">{item.location}</div>
                    <div className="text-[10px] text-slate-400">{item.type}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {item.rainfallMm}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-red-600 font-bold">
                    {item.peakRiverLevelM}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {item.leadTimeDelivered}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700 border border-emerald-200">
                      <ArrowUpRight className="h-3 w-3" />
                      {item.hydroGuardProjectedLead}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
