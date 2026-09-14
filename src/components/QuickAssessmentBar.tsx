import React from 'react';
import {
  AlertOctagon,
  Clock,
  MapPin,
  HelpCircle,
  Activity,
  Users,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { RiskLevel } from '../types';

interface QuickAssessmentBarProps {
  overallRisk: RiskLevel;
  leadTime: string;
  affectedCluster: string;
  villagesCount: number;
  evacuationAction: string;
  keyDrivers: string;
}

export const QuickAssessmentBar: React.FC<QuickAssessmentBarProps> = ({
  overallRisk,
  leadTime,
  affectedCluster,
  villagesCount,
  evacuationAction,
  keyDrivers,
}) => {
  const getRiskBadge = () => {
    switch (overallRisk) {
      case 'SEVERE':
        return {
          answer: 'YES — ACTIVE THREAT',
          severity: 'SEVERE (Critical Emergency)',
          color: 'text-red-400',
          bg: 'border-red-900/50 bg-red-950/20',
          icon: <Flame className="h-4 w-4 text-red-500" />,
        };
      case 'HIGH':
        return {
          answer: 'YES — RISING WATCH',
          severity: 'HIGH (Elevated Threat)',
          color: 'text-orange-400',
          bg: 'border-orange-900/50 bg-orange-950/20',
          icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
        };
      case 'MEDIUM':
        return {
          answer: 'POTENTIAL WATCH',
          severity: 'MEDIUM (Pre-cautionary)',
          color: 'text-amber-400',
          bg: 'border-amber-900/50 bg-amber-950/20',
          icon: <Activity className="h-4 w-4 text-amber-500" />,
        };
      default:
        return {
          answer: 'NO ACTIVE THREAT',
          severity: 'LOW (Nominal Baseline)',
          color: 'text-emerald-400',
          bg: 'border-emerald-900/50 bg-emerald-950/20',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        };
    }
  };

  const badge = getRiskBadge();

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Emergency Operations Assessment (7-Point Flash Protocol)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Standardized Civil Defense Briefing
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7 text-xs">
        {/* Q1 & Q2 */}
        <div className={`rounded-lg border p-2.5 ${badge.bg}`}>
          <div className="text-[10px] font-semibold uppercase text-slate-400">1. Flood Risk?</div>
          <div className={`mt-1 font-bold ${badge.color} flex items-center gap-1`}>
            {badge.icon}
            <span className="truncate">{badge.answer}</span>
          </div>
        </div>

        <div className={`rounded-lg border p-2.5 ${badge.bg}`}>
          <div className="text-[10px] font-semibold uppercase text-slate-400">2. Severity Level?</div>
          <div className={`mt-1 font-bold ${badge.color} truncate`}>
            {badge.severity}
          </div>
        </div>

        {/* Q3 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">3. Where is Risk?</div>
          <div className="mt-1 font-bold text-slate-200 truncate flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{affectedCluster}</span>
          </div>
        </div>

        {/* Q4 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">4. Impact ETA?</div>
          <div className="mt-1 font-bold text-cyan-300 flex items-center gap-1 truncate">
            <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>{leadTime}</span>
          </div>
        </div>

        {/* Q5 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">5. Primary Signal?</div>
          <div className="mt-1 font-medium text-slate-300 truncate" title={keyDrivers}>
            {keyDrivers}
          </div>
        </div>

        {/* Q6 */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">6. Villages at Risk?</div>
          <div className="mt-1 font-bold text-amber-300 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>{villagesCount} {villagesCount === 1 ? 'Village' : 'Villages'}</span>
          </div>
        </div>

        {/* Q7 */}
        <div className={`rounded-lg border p-2.5 col-span-2 sm:col-span-1 lg:col-span-1 ${
          overallRisk === 'SEVERE'
            ? 'border-red-600/60 bg-red-900/30'
            : 'border-slate-800 bg-slate-950/40'
        }`}>
          <div className="text-[10px] font-semibold uppercase text-slate-400">7. Directive</div>
          <div className={`mt-1 font-bold truncate ${overallRisk === 'SEVERE' ? 'text-red-300' : 'text-slate-200'}`}>
            {evacuationAction}
          </div>
        </div>
      </div>
    </div>
  );
};
