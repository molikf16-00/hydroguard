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
  Sparkles,
  Database
} from 'lucide-react';
import { SourceMetric, RiskLevel, MetricInspectionData } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

interface MultiSourceCardsProps {
  rainfall: SourceMetric;
  riverLevel: SourceMetric;
  soilMoisture: SourceMetric;
  terrainSatellite: SourceMetric;
  /** Live mode shows model grid cells; Demo mode shows simulated nodes. Neither is a real sensor. */
  isLive?: boolean;
  onInspectMetric?: (data: MetricInspectionData) => void;
}

export const MultiSourceCards: React.FC<MultiSourceCardsProps> = ({
  rainfall,
  riverLevel,
  soilMoisture,
  terrainSatellite,
  isLive = false,
  onInspectMetric,
}) => {
  const [showPlainLanguage, setShowPlainLanguage] = useState(true);

  const cards = [
    {
      metric: rainfall,
      icon: '🌧️',
      label: 'Telemetry Source 01',
      stationId: 'SIM-RAIN',
      hardware: '',
      accuracy: '',
      gradId: 'gradRain',
      plainText:
        rainfall.statusLevel === 'SEVERE'
          ? 'Very heavy rainfall: rain is accumulating faster than mountain streams can drain.'
          : rainfall.statusLevel === 'HIGH'
          ? 'Heavy continuous rainfall. Mountain gullies and side torrents are filling rapidly.'
          : 'Normal mountain weather: Light showers within safe seasonal limits.',
    },
    {
      metric: riverLevel,
      icon: '🌊',
      label: 'Telemetry Source 02',
      stationId: 'SIM-RIVER',
      hardware: '',
      accuracy: '',
      gradId: 'gradRiver',
      plainText:
        riverLevel.statusLevel === 'SEVERE'
          ? 'River flow is far above its recent level. Low bridges and riverside footpaths may be at risk.'
          : riverLevel.statusLevel === 'HIGH'
          ? 'River flow is rising above its recent level. Narrow gorge sections may fill first.'
          : 'River flow is tranquil and well within its natural embankments.',
    },
    {
      metric: soilMoisture,
      icon: '💧',
      label: 'Telemetry Source 03',
      stationId: 'SIM-SOIL',
      hardware: '',
      accuracy: '',
      gradId: 'gradSoil',
      plainText:
        soilMoisture.statusLevel === 'SEVERE'
          ? 'The soil is heavily soaked like a saturated sponge. Slopes can liquefy into mudslides and rockfalls.'
          : soilMoisture.statusLevel === 'HIGH'
          ? 'Hillside soil is heavily damp. Watch for falling stones near mountain roads.'
          : 'Ground moisture is normal. Forest soil is absorbing rain naturally.',
    },
    {
      metric: terrainSatellite,
      icon: '🛰️',
      label: 'Telemetry Source 04',
      stationId: 'SIM-TERRAIN',
      hardware: '',
      accuracy: '',
      gradId: 'gradSat',
      plainText:
        terrainSatellite.statusLevel === 'SEVERE'
          ? 'Simulated: slope data would flag a possible upstream blockage here.'
          : terrainSatellite.statusLevel === 'HIGH'
          ? 'Simulated: slope data would show movement and heavy runoff upstream.'
          : 'Simulated: no slope movement or blockage flagged.',
    },
  ];

  const displayCards = cards.map((c) =>
    isLive
      ? {
          ...c,
          stationId: c.metric.stationLabel ?? 'Model grid cell',
          label: c.metric.sourceKindLabel ?? 'Model data',
          hardware: c.metric.hardwareLabel ?? 'Model grid cell (not a sensor)',
          accuracy: c.metric.accuracyLabel ?? 'Model output',
          plainText: c.metric.unavailable ? `No data: ${c.metric.unavailableReason ?? 'unavailable'}.` : c.plainText,
        }
      : {
          ...c,
          label: 'Simulated node',
          hardware: 'Simulated input (demo, no real hardware)',
          accuracy: 'Synthetic data',
        }
  );

  const getStatusBadge = (statusLevel: RiskLevel) => {
    switch (statusLevel) {
      case 'SEVERE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getSparklineColors = (statusLevel: RiskLevel) => {
    switch (statusLevel) {
      case 'SEVERE':
        return { stroke: '#dc2626', fill: 'rgba(239, 68, 68, 0.15)' };
      case 'HIGH':
        return { stroke: '#ea580c', fill: 'rgba(249, 115, 22, 0.15)' };
      case 'MEDIUM':
        return { stroke: '#d97706', fill: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { stroke: '#059669', fill: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const handleCardClick = (item: (typeof displayCards)[0]) => {
    onInspectMetric?.({
      title: item.metric.title,
      value: item.metric.value,
      unit: item.metric.unit,
      status: item.metric.status,
      statusLevel: item.metric.statusLevel,
      source: item.metric.sourceName || (item.metric.iconType === 'rain' ? 'Open-Meteo Weather Forecast API' : item.metric.iconType === 'river' ? 'Copernicus GloFAS / River Inundation API' : 'Open-Meteo Land Surface Hydro Model'),
      timestamp: item.metric.sourceTimestamp || `${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`,
      methodNote: item.metric.sourceMethod || item.metric.details,
      threshold: `${item.metric.thresholdLabel}: ${item.metric.thresholdValue}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Plain Language Toggle */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Multi-Source Telemetry Matrix
            </h3>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
              TAP TO AUDIT SOURCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Atmospheric, river stage, soil saturation, and slope kinematics
          </p>
        </div>

        {/* Toggle between Plain English and Technical Hardware Specs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setShowPlainLanguage(true)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              showPlainLanguage
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Plain English</span>
          </button>

          <button
            onClick={() => setShowPlainLanguage(false)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              !showPlainLanguage
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-slate-600" />
            <span>Data Source</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayCards.map((item, idx) => {
          const { metric, icon, label, stationId, hardware, accuracy, gradId, plainText } = item;
          const colors = getSparklineColors(metric.statusLevel);

          const hasSpark = !!metric.sparkline && metric.sparkline.length >= 2;
          const spark = hasSpark ? metric.sparkline : [0, 0];
          const minVal = Math.min(...spark);
          const maxVal = Math.max(...spark);
          const range = maxVal - minVal || 1;
          const width = 140;
          const height = 40;

          const points = spark
            .map((val, i) => {
              const x = (i / (spark.length - 1)) * width;
              const y = height - ((val - minVal) / range) * (height - 8) - 4;
              return `${x},${y}`;
            })
            .join(' ');

          const areaPoints = `0,${height} ${points} ${width},${height}`;

          return (
            <motion.div
              key={idx}
              layout
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => handleCardClick(item)}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-md cursor-pointer"
              title="Click to view full data provenance, timestamp, and audit record"
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
                      {metric.unavailable ? (
                        <span className="text-lg sm:text-xl text-slate-500">{metric.value}</span>
                      ) : (
                        <AnimatedNumber
                          value={metric.numericValue}
                          decimals={metric.unit === 'm' || metric.unit === 'mm' ? 1 : 0}
                          duration={500}
                        />
                      )}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 font-mono shrink-0">
                      {metric.unavailable ? '' : metric.unit}
                    </span>
                  </div>

                  {/* Trend Badge */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 shrink-0">
                    {metric.unavailable ? null : metric.trend === 'Increasing' ? (
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
                      Trend History
                    </span>
                    <span>{hasSpark ? `Min: ${minVal.toFixed(1)} • Max: ${maxVal.toFixed(1)}` : 'No history'}</span>
                  </div>
                  <div className="h-12 w-full rounded-lg bg-slate-50/80 p-1 border border-slate-100 flex items-center overflow-hidden">
                    {hasSpark && (
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

                      <polygon
                        fill={`url(#${gradId})`}
                        points={areaPoints}
                      />

                      <polyline
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </svg>
                    )}
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
