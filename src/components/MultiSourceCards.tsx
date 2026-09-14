import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Info,
  Sparkles
} from 'lucide-react';
import { SourceMetric, RiskLevel } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

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
  const [showPlainLanguage, setShowPlainLanguage] = useState(true);

  const cards = [
    {
      metric: rainfall,
      icon: '🌧️',
      label: 'Telemetry Source 01',
      stationId: 'CHAM-RN-01',
      hardware: 'Campbell Scientific TB4-L (SDI-12)',
      accuracy: '±0.1 mm/pulse',
      gradId: 'gradRain',
      plainText:
        rainfall.statusLevel === 'SEVERE'
          ? 'Cloudburst in the peaks: 94mm/hr rainfall. Water is accumulating too quickly for mountain streams to drain.'
          : rainfall.statusLevel === 'HIGH'
          ? 'Heavy continuous rainfall: 42mm/hr. Mountain gullies are filling rapidly.'
          : 'Normal mountain weather: Light showers within safe seasonal limits.',
    },
    {
      metric: riverLevel,
      icon: '🌊',
      label: 'Telemetry Source 02',
      stationId: 'CHAM-RG-04',
      hardware: 'Vega VEGAPULS C21 (80 GHz Radar)',
      accuracy: '±2.0 mm / 15m range',
      gradId: 'gradRiver',
      plainText:
        riverLevel.statusLevel === 'SEVERE'
          ? 'River is 5.8m high (surpassing danger mark). Low bridges and riverside footpaths are underwater.'
          : riverLevel.statusLevel === 'HIGH'
          ? 'River stage rising steadily. Water is touching the warning mark at narrow gorges.'
          : 'River flow is tranquil and well within its natural embankments.',
    },
    {
      metric: soilMoisture,
      icon: '💧',
      label: 'Telemetry Source 03',
      stationId: 'CHAM-SL-09',
      hardware: 'Stevens HydraProbe SDI-12 (TDR)',
      accuracy: '±1.5% Volumetric Water Content',
      gradId: 'gradSoil',
      plainText:
        soilMoisture.statusLevel === 'SEVERE'
          ? 'The soil is 92% soaked like a saturated sponge. Slopes can liquefy into mudslides and rockfalls.'
          : soilMoisture.statusLevel === 'HIGH'
          ? 'Hillside soil is heavily damp. Watch for falling stones near mountain roads.'
          : 'Ground moisture is normal. Forest soil is absorbing rain naturally.',
    },
    {
      metric: terrainSatellite,
      icon: '🛰️',
      label: 'Telemetry Source 04',
      stationId: 'ESA-S1-ORB',
      hardware: 'Copernicus Sentinel-1 SAR + ALOS DEM',
      accuracy: '12.5m InSAR Coherence Matrix',
      gradId: 'gradSat',
      plainText:
        terrainSatellite.statusLevel === 'SEVERE'
          ? 'Upstream gorge bottleneck detected. If temporary debris dams release, a surge wave will hit within 45 mins.'
          : terrainSatellite.statusLevel === 'HIGH'
          ? 'Satellite radar shows slope movement and heavy mud runoff upstream.'
          : 'Valley slopes and upstream glaciers are stable with no blockages detected.',
    },
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
        return { stroke: '#dc2626', fill: 'rgba(220, 38, 38, 0.15)' };
      case 'HIGH':
        return { stroke: '#ea580c', fill: 'rgba(234, 88, 12, 0.15)' };
      case 'MEDIUM':
        return { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.15)' };
      default:
        return { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.15)' };
    }
  };

  return (
    <div className="space-y-3 w-full min-w-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 truncate">
              Multi-Source Environmental Telemetry Ingest
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time calibrated hydrometeorological sensor matrix powering the HydroGuard predictive engine
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-sans">
            <button
              onClick={() => setShowPlainLanguage(true)}
              className={`rounded-md px-2.5 py-1 font-bold transition cursor-pointer flex items-center gap-1 ${
                showPlainLanguage
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Plain English</span>
            </button>
            <button
              onClick={() => setShowPlainLanguage(false)}
              className={`rounded-md px-2.5 py-1 font-bold transition cursor-pointer ${
                !showPlainLanguage
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Technical Specs</span>
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            SYNC: 120s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {cards.map(({ metric, icon, label, stationId, hardware, accuracy, gradId, plainText }) => {
          const colors = getSparklineColor(metric.statusLevel);
          const minVal = Math.min(...metric.sparkline);
          const maxVal = Math.max(...metric.sparkline);
          const range = maxVal - minVal || 1;

          // Compute SVG sparkline path
          const width = 200;
          const height = 48;
          const points = metric.sparkline
            .map((val, idx) => {
              const x = (idx / (metric.sparkline.length - 1)) * width;
              const y = height - ((val - minVal) / range) * (height - 12) - 6;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          const firstPoint = `0,${height}`;
          const lastPoint = `${width},${height}`;
          const areaPoints = `${firstPoint} ${points} ${lastPoint}`;

          return (
            <motion.div
              key={metric.title}
              layout
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-md hover:border-slate-300 w-full min-w-0 relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-500 ${
                  metric.statusLevel === 'SEVERE'
                    ? 'bg-red-500'
                    : metric.statusLevel === 'HIGH'
                    ? 'bg-orange-500'
                    : metric.statusLevel === 'MEDIUM'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="min-w-0 pt-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl shrink-0 select-none" role="img" aria-label={metric.title}>
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                          {metric.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <span className="font-semibold text-slate-600">{stationId}</span>
                        <span>•</span>
                        <span className="truncate">{label}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-2xs transition-colors duration-300 ${getStatusBadge(
                      metric.statusLevel
                    )}`}
                  >
                    {metric.status}
                  </span>
                </div>

                {/* Main Metric Readout */}
                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight truncate tabular-nums">
                      <AnimatedNumber
                        value={metric.numericValue}
                        decimals={metric.unit === 'm' || metric.unit === 'mm' ? 1 : 0}
                        duration={500}
                      />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 font-mono shrink-0">
                      {metric.unit}
                    </span>
                  </div>

                  {/* Trend Badge */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 shrink-0">
                    {metric.trend === 'Increasing' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-100 animate-pulse">
                        <ArrowUpRight className="h-3 w-3 text-red-600 shrink-0" />
                        <span className="whitespace-nowrap">SURGE</span>
                      </span>
                    ) : metric.trend === 'Elevated' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-bold text-orange-700 border border-orange-100">
                        <ArrowUpRight className="h-3 w-3 text-orange-600 shrink-0" />
                        <span className="whitespace-nowrap">RISING</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                        <Minus className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="whitespace-nowrap">STEADY</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Threshold Reference */}
                <div className="mt-2 text-xs flex items-center justify-between gap-2 text-slate-500 pt-1.5 border-t border-slate-100 font-mono text-[11px]">
                  <span className="text-slate-500 truncate">{metric.thresholdLabel}:</span>
                  <span className="font-bold text-slate-800 shrink-0">
                    {metric.thresholdValue}
                  </span>
                </div>

                {/* Mini Sparkline Chart with Gradient Area Fill */}
                <div className="mt-3 pt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      6-Hr Trend
                    </span>
                    <span>Min: {minVal} • Max: {maxVal}</span>
                  </div>
                  <div className="h-12 w-full rounded-lg bg-slate-50/80 p-1 border border-slate-100 flex items-center overflow-hidden">
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      preserveAspectRatio="none"
                      className="h-full w-full"
                    >
                      <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <polygon
                        fill={`url(#${gradId})`}
                        points={areaPoints}
                      />

                      {/* Line Stroke */}
                      <polyline
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Plain Language or Hardware Spec */}
              {showPlainLanguage ? (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="rounded-lg bg-emerald-50/60 p-2 text-xs border border-emerald-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>In Plain Words:</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-800 leading-snug">
                      {plainText}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono truncate">
                    <span className="truncate">{hardware}</span>
                    <span className="shrink-0 font-semibold text-slate-500">{accuracy}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug break-words">
                    {metric.details}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
