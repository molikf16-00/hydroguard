import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Activity,
  Layers
} from 'lucide-react';
import { TransparentRiskScore, RiskFactorItem } from '../types';

interface WhyThisScoreModalProps {
  scoreData: TransparentRiskScore;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyThisScoreModal: React.FC<WhyThisScoreModalProps> = ({
  scoreData,
  isOpen,
  onClose,
}) => {
  const [showMethodNote, setShowMethodNote] = useState(false);

  if (!isOpen) return null;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'SEVERE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getBarColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'orange':
        return 'bg-orange-500';
      case 'amber':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-8"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Scale className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  TRANSPARENT DECISION SUPPORT MODEL
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Why This Risk Score? (Factor Attribution)
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

          <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
            {/* Score & Tier Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    COMPUTED RISK SCORE
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${getTierBadge(
                      scoreData.riskLevel
                    )}`}
                  >
                    {scoreData.riskLevel} TIER
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono tracking-tight text-slate-900">
                    {scoreData.totalScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ 100 max</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  Calculated from 4 weighted hydrological factors calibrated against IMD thresholds.
                </div>
              </div>

              {/* Signal Agreement */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    SIGNAL AGREEMENT
                  </span>
                  <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800 font-mono">
                    {scoreData.signalAgreement.percent}% Consensus
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono tracking-tight text-slate-900">
                    {scoreData.signalAgreement.activeSignals} / {scoreData.signalAgreement.totalSignals}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Signals Exceeded Watch</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                  <Activity className="h-3.5 w-3.5" />
                  <span>{scoreData.signalAgreement.freshness}</span>
                </div>
              </div>
            </div>

            {/* Factor Weight Attribution Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-slate-900 text-xs">
                  <Sliders className="h-4 w-4 text-slate-700" />
                  <span>Weighted Factor Breakdown (0–100 Scale)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Points Contributed / Max Points
                </span>
              </div>

              <div className="space-y-4">
                {scoreData.factors.map((factor) => {
                  const percentOfFactor = Math.round((factor.contributionPoints / factor.maxPoints) * 100);

                  return (
                    <div
                      key={factor.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs">{factor.name}</h4>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
                              Weight: {factor.weightPercent}%
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            Observed: <strong className="font-mono text-slate-800">{factor.rawValue}</strong>
                          </span>
                        </div>

                        <div className="text-left sm:text-right font-mono">
                          <span className="text-base font-black text-slate-900">
                            +{factor.contributionPoints}
                          </span>
                          <span className="text-slate-400 font-medium"> / {factor.maxPoints} pts</span>
                        </div>
                      </div>

                      {/* Contribution Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentOfFactor}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`h-full rounded-full ${getBarColor(factor.statusColor)}`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Threshold: <strong className="text-slate-700">{factor.thresholdText}</strong></span>
                          <span>
                            {factor.isWatchExceeded ? (
                              <span className="text-red-600 font-bold font-mono">▲ Exceeded Watch</span>
                            ) : (
                              <span className="text-emerald-600 font-semibold font-mono">● Within Nominal</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                        {factor.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collapsed Method and Calibration Note */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
              <button
                onClick={() => setShowMethodNote(!showMethodNote)}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-600" />
                  <span>Methodology and Calibration Disclosure</span>
                </div>
                {showMethodNote ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              <AnimatePresence>
                {showMethodNote && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3 space-y-2"
                  >
                    <p>
                      <strong>Rule-Based Hydrological Engine:</strong> This is a deterministic rule-based decision support system designed for high-gradient Himalayan headwaters. It evaluates 1h/3h/24h precipitation against India Meteorological Department (IMD) standard rainfall brackets:
                    </p>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-slate-700 pl-1">
                      <li>Moderate: 15.6 – 64.4 mm / 24h</li>
                      <li>Heavy: 64.5 – 115.5 mm / 24h (Advisory Trigger)</li>
                      <li>Very Heavy: 115.6 – 204.4 mm / 24h (High Warning)</li>
                      <li>Extremely Heavy: ≥ 204.5 mm / 24h (Severe Flash Flood Alert)</li>
                    </ul>
                    <p>
                      <strong>Calibration Requirement:</strong> Thresholds and sub-weights are pre-configured from standard meteorological guidelines and GloFAS hydrological discharge distributions. In an operational civil deployment, parameters must be calibrated against historical hydrograph data from the Uttarakhand State Disaster Management Authority (USDMA) and Central Water Commission (CWC).
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
