import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  MapPin,
  Timer,
  Users,
  AlertCircle
} from 'lucide-react';
import { RiskLevel } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

interface MainRiskCardProps {
  overallRisk: RiskLevel;
  riskScore: number;
  confidence: number;
  leadTime: string;
  lastUpdated: string;
  headline: string;
  description: string;
  catchmentName: string;
  onViewEmergencyDetails: () => void;
}

export const MainRiskCard: React.FC<MainRiskCardProps> = ({
  overallRisk,
  riskScore,
  confidence,
  leadTime,
  lastUpdated,
  headline,
  description,
  catchmentName,
  onViewEmergencyDetails,
}) => {
  const getTheme = () => {
    switch (overallRisk) {
      case 'SEVERE':
        return {
          bannerBg: 'bg-red-700 text-white',
          cardBorder: 'border-red-300 ring-2 ring-red-500/20',
          badgeBg: 'bg-red-950/50 text-white border border-red-400/30',
          statusText: 'text-red-700',
          scoreBg: 'bg-red-50 text-red-700 border-red-200',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
          pulseColor: 'bg-red-500',
          icon: <Flame className="h-6 w-6 text-white" />,
          code: 'EMERGENCY WARNING #04',
        };
      case 'HIGH':
        return {
          bannerBg: 'bg-orange-600 text-white',
          cardBorder: 'border-orange-300 ring-2 ring-orange-500/20',
          badgeBg: 'bg-orange-950/50 text-white border border-orange-400/30',
          statusText: 'text-orange-700',
          scoreBg: 'bg-orange-50 text-orange-700 border-orange-200',
          buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white shadow-md',
          pulseColor: 'bg-orange-500',
          icon: <AlertTriangle className="h-6 w-6 text-white" />,
          code: 'HYDROLOGICAL WATCH #02',
        };
      case 'MEDIUM':
        return {
          bannerBg: 'bg-amber-600 text-white',
          cardBorder: 'border-amber-300 ring-1 ring-amber-500/20',
          badgeBg: 'bg-amber-950/50 text-white border border-amber-400/30',
          statusText: 'text-amber-700',
          scoreBg: 'bg-amber-50 text-amber-800 border-amber-200',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md',
          pulseColor: 'bg-amber-500',
          icon: <AlertTriangle className="h-6 w-6 text-white" />,
          code: 'WEATHER ADVISORY #01',
        };
      default:
        return {
          bannerBg: 'bg-slate-900 text-white',
          cardBorder: 'border-slate-200/80 shadow-xs',
          badgeBg: 'bg-slate-800 text-emerald-400 border border-slate-700',
          statusText: 'text-emerald-700',
          scoreBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md',
          pulseColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />,
          code: 'SYSTEM NORMAL / NOMINAL',
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`overflow-hidden rounded-2xl bg-white shadow-sm border ${theme.cardBorder}`}
    >
      {/* Top Threat Banner with smooth color & pulse animation */}
      <motion.div
        layout
        transition={{ duration: 0.4 }}
        className={`relative flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 ${theme.bannerBg} overflow-hidden`}
      >
        {overallRisk === 'SEVERE' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-red-500 pointer-events-none"
          />
        )}

        <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
          <motion.div
            key={overallRisk}
            initial={{ scale: 0.85, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20 backdrop-blur-xs border border-white/10 shadow-inner"
          >
            {theme.icon}
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded shrink-0 ${theme.badgeBg}`}>
                {theme.code}
              </span>
              <span className="text-xs font-semibold opacity-90 truncate max-w-[220px] sm:max-w-none">
                Basin: {catchmentName}
              </span>
            </div>
            <motion.h2
              key={headline}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-extrabold tracking-tight sm:text-2xl mt-0.5 break-words"
            >
              {headline}
            </motion.h2>
          </div>
        </div>

        <div className="relative z-10 mt-3 sm:mt-0 flex items-center gap-3 shrink-0">
          <div className="text-left sm:text-right bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80 font-mono">
              ESTIMATED LEAD TIME
            </span>
            <span className="text-lg sm:text-xl font-black font-mono tracking-tight tabular-nums flex items-center gap-1.5 sm:justify-end">
              <Clock className="h-4 w-4 opacity-75" />
              {leadTime}
            </span>
          </div>
          <button
            onClick={onViewEmergencyDetails}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition bg-white text-slate-900 hover:bg-slate-100 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Action Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Main Body */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left Context Narrative (Cols 8) */}
          <div className="lg:col-span-8 space-y-4">
            <motion.p
              key={description}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed"
            >
              "{description}"
            </motion.p>

            {/* Clean 4-Point Operational Assessment Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              <div className="rounded-xl bg-slate-50/90 p-3 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>Sector</span>
                </div>
                <span className="font-bold text-slate-900 text-sm mt-1 block truncate">
                  Cluster A (Gorge)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                  Raini & Tapovan
                </span>
              </div>

              <div className="rounded-xl bg-slate-50/90 p-3 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Timer className="h-3 w-3 text-slate-400" />
                  <span>Lead Horizon</span>
                </div>
                <span className="font-bold text-slate-900 text-sm mt-1 block font-mono tabular-nums">
                  {leadTime}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                  To peak stage
                </span>
              </div>

              <div className="rounded-xl bg-slate-50/90 p-3 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span>Exposed Population</span>
                </div>
                <span className="font-bold text-slate-900 text-sm mt-1 block font-mono tabular-nums">
                  1,960 Residents
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                  Low-lying floodplain
                </span>
              </div>

              <div className="rounded-xl bg-slate-50/90 p-3 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <AlertCircle className="h-3 w-3 text-slate-400" />
                  <span>Tactical Directive</span>
                </div>
                <span className="font-bold text-slate-900 text-sm mt-1 block truncate">
                  {overallRisk === 'SEVERE' ? 'Evacuate Now' : overallRisk === 'HIGH' ? 'Prepare Relocation' : 'Routine Watch'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                  To High-Ground Safe Haven
                </span>
              </div>
            </div>
          </div>

          {/* Right Risk Index Card (Cols 4) */}
          <div className="lg:col-span-4 rounded-xl bg-slate-50/90 p-4 border border-slate-200/90 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Composite Flood Risk Index
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                    <AnimatedNumber value={riskScore} duration={500} />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
                  MODEL CONFIDENCE
                </span>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs font-mono">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  <AnimatedNumber value={confidence} duration={500} suffix="%" />
                </div>
              </div>
            </div>

            {/* Segmented Risk Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500">
                <span className={riskScore < 30 ? 'text-emerald-700 font-black' : ''}>LOW 0-29</span>
                <span className={riskScore >= 30 && riskScore < 60 ? 'text-amber-700 font-black' : ''}>MED 30-59</span>
                <span className={riskScore >= 60 && riskScore < 80 ? 'text-orange-700 font-black' : ''}>HIGH 60-79</span>
                <span className={riskScore >= 80 ? 'text-red-700 font-black' : ''}>CRIT 80+</span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-2.5">
                <div className={`rounded-l-full transition-colors duration-500 ${riskScore >= 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <div className={`transition-colors duration-500 ${riskScore >= 30 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <div className={`transition-colors duration-500 ${riskScore >= 60 ? 'bg-orange-500' : 'bg-slate-200'}`} />
                <div className={`rounded-r-full transition-colors duration-500 ${riskScore >= 80 ? 'bg-red-600' : 'bg-slate-200'}`} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span>Weighting: 35% I + 30% R + 20% S + 15% T</span>
              </div>
            </div>

            {/* Mobile Action Button */}
            <button
              onClick={onViewEmergencyDetails}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-wider md:hidden transition ${theme.buttonClass} cursor-pointer`}
            >
              <span>View Emergency Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/70">
              <span className="truncate">Synced: {lastUpdated}</span>
              <span className="shrink-0">CHAMOLI_2026_REALTIME</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
