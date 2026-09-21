import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  MapPin,
  Clock,
  Users,
  Navigation,
  CheckSquare,
  Radio,
  Printer,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { VillageData, RiskLevel } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  overallRisk: RiskLevel;
  headline: string;
  affectedCluster: string;
  leadTime: string;
  selectedVillage?: VillageData | null;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  overallRisk,
  headline,
  affectedCluster,
  leadTime,
  selectedVillage,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold uppercase">
                      {overallRisk} PROTOCOL
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      PROTOTYPE, NOT AN OFFICIAL ALERT
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {headline} — Evacuation Action Directive
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

        {/* Primary Alert Context Banner */}
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Target Catchment Zone
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {affectedCluster}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Est. wave travel time
              </span>
              <span className="font-bold text-red-700 font-mono text-sm">
                {leadTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Siren gateway
              </span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                Not connected (prototype)
              </span>
            </div>
          </div>
        </div>

        {/* Village Specific Safe Route Instructions */}
        {selectedVillage && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-slate-700" />
                Target Village: {selectedVillage.name}
              </span>
              <span className="text-slate-500 font-mono">
                Pop: {selectedVillage.population.toLocaleString()} • Alt: {selectedVillage.elevationM}m
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-slate-800">
                Illustrative evacuation path (not surveyed):
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                {selectedVillage.safeRoute.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg bg-white p-3 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Muster Point & Safe Shelter</span>
                <span className="font-bold text-emerald-700">{selectedVillage.nearestShelter}</span>
              </div>
              <span className="font-mono text-slate-800 font-bold">
                {selectedVillage.shelterDistanceKm} km ({selectedVillage.evacuationTimeMin} mins walk)
              </span>
            </div>
          </div>
        )}

        {/* Tactical Incident Action Checklist */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-slate-800" />
            Standard Operating Checklist for First Responders (SDRF / Police / Gram Pradhans)
          </h4>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-slate-700">
            <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 accent-slate-900 focus:ring-0" />
              <span>Broadcast sirens & megaphones along riverbanks</span>
            </label>

            <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 accent-slate-900 focus:ring-0" />
              <span>Halt road traffic across gorge bridges & culverts</span>
            </label>

            <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 accent-slate-900 focus:ring-0" />
              <span>Mobilize village elderly and children to high ground</span>
            </label>

            <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded border-slate-300 accent-slate-900 focus:ring-0" />
              <span>Confirm the warning has reached the village contact (manual check)</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <Radio className="h-3.5 w-3.5 text-slate-700" />
            <span>Routes and shelters are illustrative, not surveyed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Directive</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
