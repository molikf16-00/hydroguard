import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  MapPin,
  Activity,
  Globe,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { SimulationScenario, AppMode } from '../types';
import { CATCHMENTS } from '../data/mockData';

interface DemoScenarioBarProps {
  scenario: SimulationScenario;
  onScenarioChange: (scenario: SimulationScenario) => void;
  selectedCatchmentId: string;
  onCatchmentChange: (id: string) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  appMode: AppMode;
  onModeToggle: (mode: AppMode) => void;
  onRefreshLive?: () => void;
  isRefreshingLive?: boolean;
  liveStatusText?: string;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  scenario,
  onScenarioChange,
  selectedCatchmentId,
  onCatchmentChange,
  isAutoPlaying,
  onToggleAutoPlay,
  appMode,
  onModeToggle,
  onRefreshLive,
  isRefreshingLive = false,
  liveStatusText = 'Open-Meteo Weather & GloFAS River Ingested',
}) => {
  if (appMode === 'LIVE') {
    return (
      <aside aria-label="Live Open-Meteo telemetry stream status" className="border-b border-emerald-100 bg-emerald-50/70 backdrop-blur-xs">
        <div className="mx-auto flex flex-col gap-2.5 py-2 px-3 sm:px-6 lg:px-8 max-w-7xl sm:flex-row sm:items-center sm:justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs font-mono">
              <Globe className="h-3.5 w-3.5" />
              <span>LIVE MODE ACTIVE</span>
            </span>

            <div className="text-[11px] text-emerald-950 font-medium truncate">
              Chamoli / Rishi Ganga catchment, one model grid cell per village • <span className="font-semibold text-emerald-800">{liveStatusText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRefreshLive && (
              <button
                onClick={onRefreshLive}
                disabled={isRefreshingLive}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100/50 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshingLive ? 'animate-spin' : ''}`} />
                <span>Refresh Ingest</span>
              </button>
            )}

            <button
              onClick={() => onModeToggle('DEMO')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-purple-300" />
              <span>Switch to Demo Simulator</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Catchment incident simulation and drill controls" className="border-b border-slate-200/90 bg-white/95 backdrop-blur-xs shadow-2xs overflow-hidden">
      <div className="mx-auto flex flex-col gap-2.5 py-2.5 px-3 sm:py-2.5 sm:px-6 lg:px-8 max-w-7xl md:flex-row md:items-center md:justify-between">
        {/* Left: Purpose and Catchment Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-700 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold text-white shadow-2xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-purple-200 shrink-0" />
              <span>DEMO SIMULATOR</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Stress-test model against synthetic floods
            </span>
          </div>

          {/* Catchment Sector Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-700 w-full sm:w-auto max-w-full min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="text-slate-500 font-medium shrink-0">Sector:</span>
            <select
              value={selectedCatchmentId}
              onChange={(e) => onCatchmentChange(e.target.value)}
              className="w-full min-w-0 truncate bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
            >
              {CATCHMENTS.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: 3 Clear Scenario Buttons + Auto-Play Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="grid grid-cols-3 sm:flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto relative">
            {/* Normal */}
            <button
              onClick={() => onScenarioChange('NORMAL')}
              className={`relative flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                scenario === 'NORMAL' ? 'text-emerald-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {scenario === 'NORMAL' && (
                <motion.div
                  layoutId="scenarioIndicator"
                  className="absolute inset-0 rounded-md bg-white shadow-xs ring-1 ring-emerald-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="relative z-10 truncate">Nominal</span>
            </button>

            {/* Rising Risk */}
            <button
              onClick={() => onScenarioChange('RISING')}
              className={`relative flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                scenario === 'RISING' ? 'text-amber-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {scenario === 'RISING' && (
                <motion.div
                  layoutId="scenarioIndicator"
                  className="absolute inset-0 rounded-md bg-white shadow-xs ring-1 ring-amber-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <span className="relative z-10 truncate">Rising Watch</span>
            </button>

            {/* Critical Flash Flood */}
            <button
              onClick={() => onScenarioChange('SEVERE')}
              className={`relative flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                scenario === 'SEVERE' ? 'text-red-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {scenario === 'SEVERE' && (
                <motion.div
                  layoutId="scenarioIndicator"
                  className="absolute inset-0 rounded-md bg-white shadow-xs ring-1 ring-red-500/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 h-2 w-2 shrink-0 rounded-full bg-red-600" />
              <span className="relative z-10 truncate">Severe Surge</span>
            </button>
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition shadow-2xs cursor-pointer ${
              isAutoPlaying
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Auto-cycle through escalation cycle"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-emerald-400" />
                <span className="whitespace-nowrap">Pause Cycle</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-slate-500" />
                <span className="whitespace-nowrap">Auto Cycle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
