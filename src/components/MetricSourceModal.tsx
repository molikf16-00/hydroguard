import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Clock, ShieldCheck, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { MetricInspectionData } from '../types';

interface MetricSourceModalProps {
  data: MetricInspectionData | null;
  onClose: () => void;
}

export const MetricSourceModal: React.FC<MetricSourceModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  DATA PROVENANCE & AUDIT LOG
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">{data.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* Value & Status Banner */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  OBSERVED METRIC
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {data.value} <span className="text-xs text-slate-500 font-normal">{data.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  ALERT STATUS
                </span>
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-900 text-white px-2.5 py-1 text-xs font-bold font-mono">
                  {data.status}
                </span>
              </div>
            </div>

            {/* Source Details Grid */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 bg-white">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    AUTHORITATIVE SOURCE
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{data.source}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 bg-white">
                <Clock className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    TIMESTAMP & DATA FRESHNESS
                  </span>
                  <div className="font-mono font-bold text-slate-900">{data.timestamp}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 bg-white">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    OPERATIONAL THRESHOLD
                  </span>
                  <div className="font-semibold text-slate-800">{data.threshold}</div>
                </div>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600 leading-relaxed space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                METHODOLOGY & SCIENTIFIC GROUNDING
              </div>
              <p>{data.methodNote}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close Audit Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
