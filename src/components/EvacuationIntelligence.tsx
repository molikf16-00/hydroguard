import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Users,
  Clock,
  MapPin,
  Navigation,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Settings,
  Code,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { VillageData, RiskLevel, MetricInspectionData } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

interface EvacuationIntelligenceProps {
  villages: VillageData[];
  overallRisk: RiskLevel;
  onViewRouteModal: (village: VillageData) => void;
  onOpenCapAlertModal?: (village: VillageData) => void;
  onOpenConfigModal?: () => void;
  onInspectMetric?: (data: MetricInspectionData) => void;
}

export const EvacuationIntelligence: React.FC<EvacuationIntelligenceProps> = ({
  villages,
  overallRisk,
  onViewRouteModal,
  onOpenCapAlertModal,
  onOpenConfigModal,
  onInspectMetric,
}) => {
  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'SEVERE':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200',
          border: 'border-red-200',
          bg: 'bg-white',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          icon: <Flame className="h-3.5 w-3.5 text-red-600" />,
        };
      case 'HIGH':
        return {
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          border: 'border-orange-200',
          bg: 'bg-white',
          button: 'bg-orange-600 hover:bg-orange-700 text-white',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />,
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          border: 'border-amber-200',
          bg: 'bg-white',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
        };
      default:
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          border: 'border-slate-200',
          bg: 'bg-white',
          button: 'bg-slate-900 hover:bg-slate-800 text-white',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
        };
    }
  };

  const totalExposedPop = villages
    .filter((v) => v.riskLevel === 'SEVERE' || v.riskLevel === 'HIGH')
    .reduce((sum, v) => sum + v.population, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-800" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Downstream Settlement Evacuation Intelligence
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic kinematic flood-wave arrival horizons, high-ground muster refuges, and CAP 1.2 dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <Settings className="h-3.5 w-3.5 text-slate-600" />
              <span>Catchment Config</span>
            </button>
          )}

          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs">
            <span className="text-amber-800 font-medium">Exposed Population: </span>
            <span className="font-bold text-amber-900 font-mono">
              <AnimatedNumber value={totalExposedPop} duration={500} /> residents
            </span>
          </div>
        </div>
      </div>

      {/* Villages List Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {villages.map((village) => {
          const style = getRiskStyle(village.riskLevel);
          const isSevere = village.riskLevel === 'SEVERE';

          return (
            <motion.div
              key={village.id}
              layout
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-shadow hover:shadow-md ${style.border} ${style.bg}`}
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {village.cluster}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {village.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Dist from Upstream: <strong>{village.distanceFromTriggerKm} km</strong> • Alt: {village.elevationM}m
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${style.badge}`}
                  >
                    {style.icon}
                    <span>{village.riskLevel}</span>
                  </span>
                </div>

                {/* TASK 4: DYNAMIC LEAD TIME RANGE (ESTIMATED) */}
                <div
                  onClick={() =>
                    onInspectMetric?.({
                      title: `${village.name} wave travel time`,
                      value: village.leadTimeRangeDisplay || village.estimatedImpactTime,
                      unit: 'estimated range',
                      status: village.riskLevel,
                      statusLevel: village.riskLevel,
                      source: `Distance ÷ assumed wave speed: ${village.distanceFromTriggerKm ?? 'n/a'} km ÷ [2.0 - 5.0 m/s] (uncalibrated)`,
                      timestamp: 'Computed from configured distance',
                      methodNote:
                        'Travel time range = distance from the trigger point ÷ an assumed flood-wave speed of 2.0 to 5.0 m/s. This is how long a wave might take to arrive after a trigger, not how early data gives a warning. Real arrival depends on channel roughness, canyon narrowing and debris load, and the speed range is not calibrated.',
                      threshold: `Distance: ${village.distanceFromTriggerKm ?? 'n/a'} km (configured)`,
                    })
                  }
                  className="rounded-xl bg-slate-900 text-white p-3 text-xs border border-slate-800 cursor-pointer hover:bg-slate-800 transition shadow-inner"
                  title="Click to view kinematic calculation formula"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Clock className="h-3 w-3" />
                      Wave travel time (estimate)
                    </span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                      Formula: D ÷ [2-5 m/s]
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono tracking-tight text-white mt-1">
                    {village.leadTimeRangeDisplay || village.estimatedImpactTime}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Walking escape time: ~{village.evacuationTimeMin} min ({village.walkingDistanceKm || 0.8} km path)
                  </div>
                </div>

                {/* Nearest Safe Shelter */}
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Designated Safe Refuge
                  </div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{village.nearestShelter}</span>
                  </div>
                  {typeof village.distanceFromRiverM === 'number' && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      Distance from river: ~{village.distanceFromRiverM} m (illustrative, not surveyed)
                    </div>
                  )}
                </div>

                {/* Recommended Action */}
                <div className="text-xs text-slate-600 leading-relaxed border-l-2 border-slate-300 pl-2.5">
                  <span className="font-bold text-slate-800">Action: </span>
                  {village.recommendedAction}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onViewRouteModal(village)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${style.button}`}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>View Route</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {/* TASK 5: CAP 1.2 XML output trigger */}
                {onOpenCapAlertModal && (
                  <button
                    onClick={() => onOpenCapAlertModal(village)}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                      isSevere
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Generate OASIS CAP 1.2 XML Alert"
                  >
                    <Code className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">CAP 1.2</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* TASK 4: MANDATORY KINEMATIC APPROXIMATION VISIBLE NOTE */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-600 flex items-center gap-2.5 shadow-2xs">
        <Info className="h-4 w-4 text-slate-700 shrink-0" />
        <p className="leading-relaxed">
          <strong>Modeling note:</strong> a simple travel-time estimate with an uncalibrated wave speed. True arrival depends on channel roughness, canyon geometry and debris load. Computed as <code className="font-mono font-semibold text-slate-800">Travel time = Distance from trigger ÷ [2.0 – 5.0 m/s]</code>. It is not a forecast of warning lead time.
        </p>
      </div>
    </div>
  );
};
