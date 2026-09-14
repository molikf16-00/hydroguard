import React from 'react';
import {
  Play,
  Pause,
  MapPin,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { SimulationScenario } from '../types';
import { CATCHMENTS } from '../data/mockData';

interface DemoScenarioBarProps {
  scenario: SimulationScenario;
  onScenarioChange: (scenario: SimulationScenario) => void;
  selectedCatchmentId: string;
  onCatchmentChange: (id: string) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  scenario,
  onScenarioChange,
  selectedCatchmentId,
  onCatchmentChange,
  isAutoPlaying,
  onToggleAutoPlay,
}) => {
  return (
    <aside aria-label="Catchment incident simulation and drill controls" className="border-b border-slate-200/90 bg-white/95 backdrop-blur-xs shadow-2xs overflow-hidden">
      <div className="mx-auto flex flex-col gap-2.5 py-2.5 px-3 sm:py-2.5 sm:px-6 lg:px-8 max-w-7xl md:flex-row md:items-center md:justify-between">
        {/* Left: Purpose and Catchment Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold text-white shadow-2xs">
              <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>INCIDENT DRILL</span>
            </span>
            <span className="text-[11px] text-slate-500 sm:hidden font-medium">
              Stress-test model
            </span>
            <span className="hidden text-xs text-slate-500 lg:inline">
              Stress-test sensor fusion & evacuation directives:
            </span>
          </div>

          {/* Catchment Sector Selector - fully responsive, will never overflow or ruin mobile view */}
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
          <div className="grid grid-cols-3 sm:flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto">
            {/* Normal */}
            <button
              onClick={() => onScenarioChange('NORMAL')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition ${
                scenario === 'NORMAL'
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">Nominal</span>
            </button>

            {/* Rising Risk */}
            <button
              onClick={() => onScenarioChange('RISING')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition ${
                scenario === 'RISING'
                  ? 'bg-white text-amber-800 shadow-xs ring-1 ring-amber-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <span className="truncate">Surge Watch</span>
            </button>

            {/* Severe Flood */}
            <button
              onClick={() => onScenarioChange('SEVERE')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition ${
                scenario === 'SEVERE'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${scenario === 'SEVERE' ? 'bg-white animate-ping' : 'bg-red-500'}`} />
              <span className="truncate">Inundation</span>
            </button>
          </div>

          {/* Auto-Play Toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition shadow-xs w-full sm:w-auto ${
              isAutoPlaying
                ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Auto-cycle through hydrological stages every 9 seconds"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-white shrink-0" />
                <span className="truncate">Cycle Active (9s)</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                <span className="truncate">Auto-Cycle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
