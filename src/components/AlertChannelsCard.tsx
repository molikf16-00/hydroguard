import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Wifi,
  Smartphone,
  MessageSquare,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Info
} from 'lucide-react';
import { ALERT_CHANNELS } from '../data/mockData';
import { ChannelStatus } from '../types';

export const AlertChannelsCard: React.FC = () => {
  const [channels, setChannels] = useState<ChannelStatus[]>(ALERT_CHANNELS);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestDispatch = (channelId: string, channelName: string) => {
    setTestingChannelId(channelId);
    setTestResult(null);

    setTimeout(() => {
      setTestingChannelId(null);
      setTestResult(`[SIMULATED RELAY] Ping sent to ${channelName} gateway — Handshake ACK received in 1.4s`);
      setTimeout(() => setTestResult(null), 5000);
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MESH_ACTIVE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STANDBY':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-slate-800" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Multi-Channel Emergency Warning Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decentralized notification dispatch designed for resilient communication in deep valleys
          </p>
        </div>

        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-600 border border-slate-200">
          GATEWAY DISPATCH INTERFACE
        </span>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <motion.div
            key={ch.id}
            layout
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-shadow hover:bg-white hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={ch.name}>
                    {ch.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      {ch.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {ch.technology}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                    ch.status
                  )}`}
                >
                  {ch.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Coverage:</span>
                  <span className="font-mono text-slate-800 font-semibold">{ch.coverage.split(' ')[0]} {ch.coverage.split(' ')[1]}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Latency:</span>
                  <span className="font-mono text-slate-900 font-bold">{ch.latency}</span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 border-t border-slate-200 pt-2 leading-relaxed">
                {ch.notes}
              </p>
            </div>

            {/* Simulated test button */}
            <div className="mt-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => handleTestDispatch(ch.id, ch.name)}
                disabled={testingChannelId === ch.id}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50 shadow-2xs"
              >
                {testingChannelId === ch.id ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin text-slate-700" />
                    <span>Testing Handshake...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 text-slate-700" />
                    <span>Test Channel Ping</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Simulated dispatch test feedback banner */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2 overflow-hidden"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{testResult}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispatch Gateway Specifications */}
      <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-slate-800 shrink-0" />
        <p>
          <strong>Gateway Dissemination Notice:</strong> Cell broadcast channels interface with national telecom Cell Broadcast Centers (CBC) using 3GPP TS 23.041 standards with local LoRaWAN and VHF repeater fallback.
        </p>
      </div>
    </div>
  );
};
