import React from 'react';
import {
  CloudRain,
  Waves,
  Droplets,
  Satellite,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Info
} from 'lucide-react';
import { SourceMetric, RiskLevel } from '../types';

interface MultiSourceCardsProps {
  rainfall: SourceMetric;
  riverLevel: SourceMetric;
  soilMoisture: SourceMetric;
  terrainSatellite: SourceMetric;
}

export const MultiSourceCards: React.FC<MultiSourceCardsProps> = ({
  rainfall,
  riverLevel,
  soilMoisture,
  terrainSatellite,
}) => {
  const cards = [
    { metric: rainfall, icon: '🌧️', label: 'Telemetry Source 01' },
    { metric: riverLevel, icon: '🌊', label: 'Telemetry Source 02' },
    { metric: soilMoisture, icon: '💧', label: 'Telemetry Source 03' },
    { metric: terrainSatellite, icon: '🛰️', label: 'Telemetry Source 04' },
  ];

  const getStatusBadge = (statusLevel: RiskLevel) => {
    switch (statusLevel) {
      case 'SEVERE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getSparklineColor = (statusLevel: RiskLevel) => {
    switch (statusLevel) {
      case 'SEVERE':
        return '#dc2626'; // red-600
      case 'HIGH':
        return '#ea580c'; // orange-600
      case 'MEDIUM':
        return '#d97706'; // amber-600
      default:
        return '#16a34a'; // emerald-600
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
            Multi-Source Environmental Telemetry Inputs
          </h3>
          <p className="text-xs text-slate-500">
            Real-time multi-sensor inputs feeding the HydroGuard early warning prediction engine
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Updated: Every 2 Minutes
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ metric, icon, label }) => {
          const sparkColor = getSparklineColor(metric.statusLevel);
          const minVal = Math.min(...metric.sparkline);
          const maxVal = Math.max(...metric.sparkline);
          const range = maxVal - minVal || 1;

          // Compute SVG sparkline path
          const width = 200;
          const height = 48;
          const points = metric.sparkline
            .map((val, idx) => {
              const x = (idx / (metric.sparkline.length - 1)) * width;
              const y = height - ((val - minVal) / range) * (height - 10) - 5;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <div
              key={metric.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-slate-300"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={metric.title}>
                      {icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {metric.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {label}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(
                      metric.statusLevel
                    )}`}
                  >
                    {metric.status}
                  </span>
                </div>

                {/* Main Metric Readout */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                      {metric.value}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 font-mono">
                      {metric.unit}
                    </span>
                  </div>

                  {/* Trend Badge */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    {metric.trend === 'Increasing' ? (
                      <>
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-600">Surging</span>
                      </>
                    ) : metric.trend === 'Elevated' ? (
                      <>
                        <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-orange-600">Elevated</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-500">Stable</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Threshold Reference */}
                <div className="mt-2 text-xs flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-100">
                  <span>{metric.thresholdLabel}:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {metric.thresholdValue}
                  </span>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="mt-3 pt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span>6-hr trend</span>
                    <span>Recent</span>
                  </div>
                  <div className="h-12 w-full rounded-lg bg-slate-50 p-1 border border-slate-100 flex items-center">
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      className="h-full w-full overflow-visible"
                    >
                      <polyline
                        fill="none"
                        stroke={sparkColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Specific Field Notes */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
                {metric.details}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
