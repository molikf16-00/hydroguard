import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  CloudRain,
  Waves,
  ShieldAlert,
  Info,
  Sliders,
  Check,
  Zap,
  Activity
} from 'lucide-react';
import { TrendPoint, RiskLevel } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

interface RiskTrendChartProps {
  trendHistory: TrendPoint[];
  overallRisk: RiskLevel;
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({
  trendHistory,
  overallRisk,
}) => {
  const [hoveredIdxRaw, setHoveredIdx] = useState<number | null>(trendHistory.length - 1);
  // Clamp so switching between datasets of different length (Live 24 pts vs Demo 7 pts) never reads past the end.
  const hoveredIdx: number | null =
    hoveredIdxRaw !== null && hoveredIdxRaw >= 0 && hoveredIdxRaw < trendHistory.length ? hoveredIdxRaw : trendHistory.length - 1;
  const [showRainfall, setShowRainfall] = useState(true);
  const [showRiver, setShowRiver] = useState(true);
  // River stage exists only in the Demo Simulator. Live mode has no river-stage measurement.
  const hasRiver = trendHistory.length > 0 && trendHistory.every((pt) => typeof pt.riverLevelM === 'number');
  const riverVisible = hasRiver && showRiver;
  const [showRiskScore, setShowRiskScore] = useState(true);

  const activePoint = trendHistory[hoveredIdx as number] ?? trendHistory[trendHistory.length - 1];

  if (trendHistory.length === 0 || !activePoint) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs text-sm text-slate-600">
        No trend data available yet.
      </div>
    );
  }

  // SVG plotting math
  const svgWidth = 800;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 24;
  const padBottom = 32;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Scales
  const maxRain = Math.max(140, ...trendHistory.map((pt) => pt.rainfallMm)); // mm
  const maxRiver = 7.0; // meters
  const dangerRiver = 5.2; // meters
  const maxRisk = 100; // score

  const getX = (index: number) => {
    return padLeft + (index / Math.max(1, trendHistory.length - 1)) * chartW;
  };

  const getRainY = (mm: number) => {
    return padTop + chartH - (mm / maxRain) * chartH;
  };

  const getRiverY = (m: number) => {
    return padTop + chartH - (m / maxRiver) * chartH;
  };

  const getRiskY = (score: number) => {
    return padTop + chartH - (score / maxRisk) * chartH;
  };

  const rainPoints = trendHistory.map((pt, i) => `${getX(i)},${getRainY(pt.rainfallMm)}`).join(' ');
  const riverPoints = hasRiver
    ? trendHistory.map((pt, i) => `${getX(i)},${getRiverY(pt.riverLevelM as number)}`).join(' ')
    : '';
  const riskPoints = trendHistory.map((pt, i) => `${getX(i)},${getRiskY(pt.riskScore)}`).join(' ');

  const riskArea = `${padLeft},${padTop + chartH} ${riskPoints} ${svgWidth - padRight},${padTop + chartH}`;
  const dangerY = getRiverY(dangerRiver);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-800" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Catchment Hydrological Trend (Past {Math.max(1, trendHistory.length - 1)} Hours)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasRiver
              ? 'Simulated comparison of cumulative rainfall, river stage rise, and composite flood risk'
              : 'Rolling 24 h rainfall, topsoil moisture and the composite risk score recomputed for each past hour (model data)'}
          </p>
        </div>

        {/* Legend toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowRainfall(!showRainfall)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition border ${
              showRainfall
                ? 'border-slate-300 bg-slate-100 text-slate-800'
                : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-800" />
            <span>Rainfall (mm)</span>
          </button>

          {hasRiver && (
          <button
            onClick={() => setShowRiver(!showRiver)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition border ${
              showRiver
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-cyan-600" />
            <span>River Stage (m)</span>
          </button>
          )}

          <button
            onClick={() => setShowRiskScore(!showRiskScore)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition border ${
              showRiskScore
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            <span>Risk Index (0-100)</span>
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padTop + chartH * ratio;
            return (
              <line
                key={idx}
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1.2"
              />
            );
          })}

          {hasRiver && (
            <>
          {/* Critical River Danger Level Line (5.2m) */}
          <line
            x1={padLeft}
            y1={dangerY}
            x2={svgWidth - padRight}
            y2={dangerY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="5,4"
          />
          <text
            x={svgWidth - padRight - 5}
            y={dangerY - 6}
            textAnchor="end"
            fill="#dc2626"
            className="text-[10px] font-bold font-mono uppercase tracking-wider"
          >
            CRITICAL DANGER THRESHOLD: 5.2m
          </text>
            </>
          )}

          {/* Risk Area Under Curve */}
          {showRiskScore && (
            <polygon
              fill="url(#riskAreaGrad)"
              points={riskArea}
            />
          )}

          {/* Series Lines */}
          {showRainfall && (
            <polyline
              fill="none"
              stroke="#475569"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={rainPoints}
            />
          )}

          {riverVisible && (
            <polyline
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={riverPoints}
            />
          )}

          {showRiskScore && (
            <polyline
              fill="none"
              stroke="#e11d48"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={riskPoints}
            />
          )}

          {/* Interactive vertical hover indicator */}
          {hoveredIdx !== null && (
            <>
              <line
                x1={getX(hoveredIdx)}
                y1={padTop}
                x2={getX(hoveredIdx)}
                y2={padTop + chartH}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              {/* Rain dot */}
              {showRainfall && (
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getRainY(trendHistory[hoveredIdx].rainfallMm)}
                  r="4.5"
                  fill="#475569"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {/* River dot */}
              {riverVisible && (
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getRiverY(trendHistory[hoveredIdx].riverLevelM as number)}
                  r="4.5"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {/* Risk dot */}
              {showRiskScore && (
                <circle
                  cx={getX(hoveredIdx)}
                  cy={getRiskY(trendHistory[hoveredIdx].riskScore)}
                  r="5"
                  fill="#e11d48"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </>
          )}

          {/* Time ticks on X axis */}
          {trendHistory.map((pt, i) => (
            <g
              key={pt.time}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
            >
              <rect
                x={getX(i) - 25}
                y={padTop}
                width={50}
                height={chartH + padBottom}
                fill="transparent"
              />
              <text
                x={getX(i)}
                y={padTop + chartH + 18}
                textAnchor="middle"
                fill={hoveredIdx === i ? '#0f172a' : '#64748b'}
                className="text-[11px] font-mono font-semibold"
              >
                {pt.time}
              </text>
            </g>
          ))}

          {/* Left Y Axis Labels (Risk / Rain) */}
          <text x={padLeft - 8} y={padTop + 4} textAnchor="end" fill="#64748b" className="text-[9px] font-mono">
            100
          </text>
          <text x={padLeft - 8} y={padTop + chartH / 2} textAnchor="end" fill="#64748b" className="text-[9px] font-mono">
            50
          </text>
          <text x={padLeft - 8} y={padTop + chartH} textAnchor="end" fill="#64748b" className="text-[9px] font-mono">
            0
          </text>

          {hasRiver && (
            <>
          {/* Right Y Axis Labels (River Meters) */}
          <text x={svgWidth - padRight + 8} y={padTop + 4} textAnchor="start" fill="#64748b" className="text-[9px] font-mono">
            7.0m
          </text>
          <text x={svgWidth - padRight + 8} y={padTop + chartH / 2} textAnchor="start" fill="#64748b" className="text-[9px] font-mono">
            3.5m
          </text>
          <text x={svgWidth - padRight + 8} y={padTop + chartH} textAnchor="start" fill="#64748b" className="text-[9px] font-mono">
            0m
          </text>
                    </>
          )}
        </svg>
      </div>

      {/* Hovered Timeframe Metrics Inspector Bar */}
      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
            TIMESTAMP: {activePoint.time}
          </span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">Hover horizontally across timeline to scrub data</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="text-slate-500">Rainfall:</span>
            <span className="font-mono font-bold text-slate-900">
              <AnimatedNumber value={activePoint.rainfallMm} duration={250} decimals={0} /> mm
            </span>
          </div>

          {hasRiver && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-600" />
            <span className="text-slate-500">Stage:</span>
            <span className={`font-mono font-bold ${(activePoint.riverLevelM ?? 0) >= 5.2 ? 'text-red-600' : 'text-slate-900'}`}>
              <AnimatedNumber value={activePoint.riverLevelM ?? 0} duration={250} decimals={1} /> m
            </span>
          </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            <span className="text-slate-500">Risk Index:</span>
            <span className="font-mono font-bold text-rose-600">
              <AnimatedNumber value={activePoint.riskScore} duration={250} decimals={0} /> / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
