import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle2,
  Flame,
  Activity
} from 'lucide-react';
import { RiskLevel } from '../types';

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
          bannerBg: 'bg-red-600 text-white',
          cardBorder: 'border-red-200 ring-1 ring-red-500/20',
          badgeBg: 'bg-red-700 text-white',
          statusText: 'text-red-700',
          scoreBg: 'bg-red-50 text-red-700 border-red-200',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
          pulseColor: 'bg-red-500',
          icon: <Flame className="h-6 w-6 text-white" />,
        };
      case 'HIGH':
        return {
          bannerBg: 'bg-orange-500 text-white',
          cardBorder: 'border-orange-200 ring-1 ring-orange-500/20',
          badgeBg: 'bg-orange-600 text-white',
          statusText: 'text-orange-700',
          scoreBg: 'bg-orange-50 text-orange-700 border-orange-200',
          buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white shadow-md',
          pulseColor: 'bg-orange-500',
          icon: <AlertTriangle className="h-6 w-6 text-white" />,
        };
      case 'MEDIUM':
        return {
          bannerBg: 'bg-amber-500 text-slate-900',
          cardBorder: 'border-amber-200 ring-1 ring-amber-500/20',
          badgeBg: 'bg-amber-600 text-white',
          statusText: 'text-amber-700',
          scoreBg: 'bg-amber-50 text-amber-800 border-amber-200',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md',
          pulseColor: 'bg-amber-500',
          icon: <AlertTriangle className="h-6 w-6 text-slate-900" />,
        };
      default:
        return {
          bannerBg: 'bg-emerald-600 text-white',
          cardBorder: 'border-emerald-200 ring-1 ring-emerald-500/20',
          badgeBg: 'bg-emerald-700 text-white',
          statusText: 'text-emerald-700',
          scoreBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md',
          pulseColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="h-6 w-6 text-white" />,
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-sm border ${theme.cardBorder}`}>
      {/* Top Threat Banner */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 ${theme.bannerBg}`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/15 backdrop-blur-xs">
            {theme.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded shrink-0">
                CURRENT STATUS
              </span>
              <span className="text-xs font-medium opacity-90 truncate max-w-[200px] sm:max-w-none">
                {catchmentName}
              </span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl mt-0.5 break-words">
              {headline}
            </h2>
          </div>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-80">
              Estimated Lead Time
            </span>
            <span className="text-xl font-black font-mono tracking-tight">
              {leadTime}
            </span>
          </div>
          <button
            onClick={onViewEmergencyDetails}
            className={`hidden md:inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              overallRisk === 'SEVERE'
                ? 'bg-white text-red-700 hover:bg-red-50'
                : 'bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>View Action Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left Context Narrative (Cols 8) */}
          <div className="lg:col-span-8 space-y-4">
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              "{description}"
            </p>

            {/* Clean 4-Point Operational Assessment Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Location Sector
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                  Cluster A (Gorge)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Raini & Tapovan
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Warning Lead Time
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">
                  {leadTime}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Before peak wave
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Population Exposed
                </span>
                <span className="font-bold text-amber-700 text-sm mt-0.5 block font-mono">
                  1,960 Residents
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Low-lying floodplain
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Standard Action
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                  {overallRisk === 'SEVERE' ? 'Immediate Evac' : overallRisk === 'HIGH' ? 'Prepare Relocation' : 'Routine Watch'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                  To High-Ground Shelters
                </span>
              </div>
            </div>
          </div>

          {/* Right Risk Index Card (Cols 4) */}
          <div className="lg:col-span-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Composite Flood Index
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-900">
                    {riskScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Model Confidence
                </span>
                <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs font-mono">
                  <Activity className="h-3.5 w-3.5 text-slate-700" />
                  <span>{confidence}% Confidence</span>
                </div>
              </div>
            </div>

            {/* Visual Risk Gauge Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>0 (Low)</span>
                <span>30 (Med)</span>
                <span>60 (High)</span>
                <span>80+ (Severe)</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    riskScore >= 80 ? 'bg-red-600' : riskScore >= 60 ? 'bg-orange-500' : riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(riskScore, 100)}%` }}
                />
              </div>
            </div>

            {/* Mobile Action Button */}
            <button
              onClick={onViewEmergencyDetails}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider md:hidden transition ${theme.buttonClass}`}
            >
              <span>View Emergency Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200">
              <span>Sync: {lastUpdated}</span>
              <span>Dataset: DEMO_CHAMOLI_2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
