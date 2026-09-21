import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Clock,
  MapPin,
  CheckSquare,
  Square,
  PhoneCall,
  Flame,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Footprints,
  Package,
  Volume2,
  ChevronDown,
  ChevronUp,
  Radio
} from 'lucide-react';
import { RiskLevel, VillageData } from '../types';

interface CitizenActionGuideProps {
  overallRisk: RiskLevel;
  leadTime: string;
  affectedCluster: string;
  nearestShelter: string;
  recommendedAction: string;
  villages: VillageData[];
  onOpenRoute: (village: VillageData) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  subtext: string;
  critical: boolean;
}

export const CitizenActionGuide: React.FC<CitizenActionGuideProps> = ({
  overallRisk,
  leadTime,
  affectedCluster,
  nearestShelter,
  recommendedAction,
  villages,
  onOpenRoute,
}) => {
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    c1: true,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
  });
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems: ChecklistItem[] = [
    {
      id: 'c1',
      text: 'Move towards high ground immediately',
      subtext: `Walk away from the river bank up towards ${nearestShelter}. Do NOT cross bridges.`,
      critical: true,
    },
    {
      id: 'c2',
      text: 'Grab the 3-minute emergency essentials',
      subtext: 'Torch/flashlight, mobile phone, drinking water, ID cards, and family medicines in a plastic bag.',
      critical: true,
    },
    {
      id: 'c3',
      text: 'Untie livestock & cattle',
      subtext: 'Do not leave animals tied up in sheds; allow them to move uphill.',
      critical: false,
    },
    {
      id: 'c4',
      text: 'Turn off household electric mains & gas',
      subtext: 'Prevents electrical shorts and fires as water enters dwellings.',
      critical: false,
    },
    {
      id: 'c5',
      text: 'Assist children, pregnant women, and elderly',
      subtext: 'Alert your immediate neighbors who may not have heard the warning siren.',
      critical: true,
    },
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const getActionContent = () => {
    switch (overallRisk) {
      case 'SEVERE':
        return {
          bannerBg: 'bg-red-50 border-red-200 text-red-900',
          badgeBg: 'bg-red-600 text-white',
          statusTitle: 'IMMEDIATE LIFE SAFETY EVACUATION',
          plainSummary: `Modelled indicators are at a severe level. If a flash flood wave starts upstream, it could reach the valley in about ${leadTime}. Follow instructions from local authorities and move to designated high ground.`,
          urgentDirective: 'DO NOT wait to see the water rise. Run to high ground now.',
          actionButton: 'FIND NEAREST HIGH-GROUND ESCAPE ROUTE',
          icon: <Flame className="h-5 w-5 text-red-600" />,
        };
      case 'HIGH':
        return {
          bannerBg: 'bg-orange-50 border-orange-200 text-orange-900',
          badgeBg: 'bg-orange-600 text-white',
          statusTitle: 'HIGH ALERT: PREPARE TO EVACUATE',
          plainSummary: `Modelled rainfall and river indicators are elevated. If a wave starts upstream, it could reach your area in about ${leadTime}.`,
          urgentDirective: 'Pack essentials, gather family members, and stay tuned to sirens and mobile alerts.',
          actionButton: 'VIEW PREPAREDNESS ROUTE & SHELTER',
          icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
        };
      case 'MEDIUM':
        return {
          bannerBg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-600 text-white',
          statusTitle: 'WEATHER ADVISORY: STAY VIGILANT',
          plainSummary: 'Heavy mountain rain detected upstream. River water levels are rising but still below danger mark.',
          urgentDirective: 'Avoid bathing, fishing, or driving near the riverbed. Keep mobile phones charged.',
          actionButton: 'CHECK SAFE HAVEN LOCATIONS',
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        };
      default:
        return {
          bannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-600 text-white',
          statusTitle: 'NORMAL CONDITIONS: ALL CLEAR',
          plainSummary: 'All upstream rain gauges and radar water level sensors show normal baseline flow.',
          urgentDirective: 'No evacuation required. River flows are within safe seasonal capacity.',
          actionButton: 'EXPLORE CATCHMENT REFUGE MAP',
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        };
    }
  };

  const action = getActionContent();
  const primaryVillage = villages[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* Top Banner: What everyday people need to know in 3 seconds */}
      <div className={`rounded-xl border p-4 sm:p-5 ${action.bannerBg} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className={`rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider ${action.badgeBg}`}>
              CITIZEN GUIDE
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              PLAIN-LANGUAGE ACTION PROTOCOL
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <Clock className="h-4 w-4 shrink-0 text-slate-700" />
            <span>Est. wave travel time: <strong className="font-mono text-sm">{leadTime}</strong></span>
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            {action.statusTitle}
          </h3>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800">
            {action.plainSummary}
          </p>
        </div>

        {/* 3 Bold Action Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-lg bg-white/90 p-3 border border-black/10 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900">
              <Footprints className="h-4 w-4 text-emerald-700" />
              <span>1. Where to Go</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900">
              {nearestShelter}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              High ground safe zone ({affectedCluster})
            </p>
          </div>

          <div className="rounded-lg bg-white/90 p-3 border border-black/10 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900">
              <Package className="h-4 w-4 text-amber-700" />
              <span>2. What to Take</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900">
              Only Light Essentials
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Torch, drinking water, ID & medications
            </p>
          </div>

          <div className="rounded-lg bg-white/90 p-3 border border-black/10 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900">
              <PhoneCall className="h-4 w-4 text-blue-700" />
              <span>3. Emergency Call</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900 font-mono">
              Dial 112 or 1077
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Toll-free Disaster Response Control
            </p>
          </div>
        </div>

        {/* Quick Route Guidance Trigger */}
        {primaryVillage && (
          <div className="pt-2">
            <button
              onClick={() => onOpenRoute(primaryVillage)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{action.actionButton}</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive 3-Minute Evacuation Checklist */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <div
          onClick={() => setIsChecklistOpen(!isChecklistOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-slate-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Interactive 3-Minute Evacuation Action Checklist
            </h4>
            <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
              {checkedCount}/{checklistItems.length} COMPLETED
            </span>
          </div>

          <button className="text-slate-500 hover:text-slate-900 transition">
            {isChecklistOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {isChecklistOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-1 overflow-hidden"
            >
              {checklistItems.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                      isChecked
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-slate-700 focus:outline-hidden"
                      aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isChecked ? 'line-through text-emerald-900 opacity-80' : 'text-slate-900'}`}>
                          {item.text}
                        </span>
                        {item.critical && !isChecked && (
                          <span className="rounded bg-red-100 text-red-700 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                            Crucial
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isChecked ? 'text-emerald-700/80' : 'text-slate-500'}`}>
                        {item.subtext}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "Why This Saves Lives" Plain English Explainer Toggle */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs space-y-2">
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-slate-700" />
            <span>How early warning is meant to help (plain language)</span>
          </div>
          <span className="text-slate-400 text-xs">{showHowItWorks ? 'Hide' : 'Explain'}</span>
        </button>

        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-slate-100 text-slate-600 space-y-2 leading-relaxed text-[12px] overflow-hidden"
            >
              <p>
                In steep Himalayan valleys, flood water can arrive with very little notice. The goal of early warning is to give people enough time to reach high ground.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <strong className="text-slate-900 block">🌧️ Watching the rain:</strong>
                  This prototype reads weather-model rainfall and soil moisture for each village. Field rain gauges in the upper catchment are planned, not built.
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <strong className="text-slate-900 block">📡 Reaching people:</strong>
                  Warnings are meant to reach phones and sirens without relying on internet cables. In this prototype the channels are simulated and nothing is sent.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
