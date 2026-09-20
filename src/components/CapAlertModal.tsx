import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Download,
  CheckCircle2,
  Code,
  Flame,
  Radio,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { VillageData, RiskLevel } from '../types';
import { generateCapXml, downloadCapXmlFile } from '../utils/capGenerator';

interface CapAlertModalProps {
  village: VillageData | null;
  overallRisk: RiskLevel;
  isOpen: boolean;
  onClose: () => void;
}

export const CapAlertModal: React.FC<CapAlertModalProps> = ({
  village,
  overallRisk,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetVillageName = village?.name || 'Raini (Upper & Lower Gorge)';
  const targetCluster = village?.cluster || 'Cluster A (Upper Gorge Confluence)';
  const targetLat = village?.lat || 30.4884;
  const targetLon = village?.lon || 79.6972;
  const leadTimeStr = village?.leadTimeRangeDisplay || '16m – 40m (Estimated)';

  const capXml = generateCapXml({
    headline: `IMMEDIATE FLASH FLOOD WARNING: ${targetVillageName.toUpperCase()}`,
    description: `Critical hydrological surge detected in Rishi Ganga upper headwaters. Peak flood wave expected within estimated lead horizon. High-ground evacuation ordered immediately.`,
    instruction: `All residents in low-lying riparian areas must immediately evacuate uphill via designated escape trails to ${village?.nearestShelter || 'High Ground Safe Refuge'}. Do not attempt bridge crossings. Carry emergency rations and battery-powered radios.`,
    villageName: targetVillageName,
    cluster: targetCluster,
    lat: targetLat,
    lon: targetLon,
    leadTimeDisplay: leadTimeStr,
    urgency: 'Immediate',
    severity: 'Extreme',
    certainty: 'Observed',
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(capXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleDownload = () => {
    downloadCapXmlFile(capXml, `hydroguard-cap-alert-${village?.id || 'rishi-ganga'}.xml`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-red-100 bg-red-50/80 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 font-mono">
                    OASIS CAP v1.2 PROTOCOL INTERFACE
                  </span>
                  <span className="rounded bg-red-600 text-white px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono">
                    Level-1 Red Alert
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Common Alerting Protocol (CAP 1.2) XML Output
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                  TARGET AREA & ESTIMATED LEAD TIME
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {targetVillageName} — {targetCluster}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Lead Time: <strong className="font-mono text-red-700">{leadTimeStr}</strong> (kinematic range)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-mono">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-600" />
                      <span>Copy CAP XML</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .xml</span>
                </button>
              </div>
            </div>

            {/* XML Code Viewer */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
              <pre className="whitespace-pre">{capXml}</pre>
            </div>

            {/* Explanatory Standard Note */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800 text-[10px] font-mono">
                <Info className="h-3.5 w-3.5 text-slate-600" />
                <span>Interoperability Compliance with National Telecom & NDMA Sachet</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This machine-readable payload adheres to OASIS Standard CAP-V1.2. In emergency operation, it is ingested directly by national telecom Cell Broadcast Centers (CBC) to trigger geotargeted cell-broadcast vibration tones and siren RTUs without requiring smartphone internet connectivity.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close Alert Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
