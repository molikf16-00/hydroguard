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
  Info,
  Trash2,
  Clock
} from 'lucide-react';
import { ALERT_CHANNELS } from '../data/mockData';
import { ChannelStatus, SimulatedDispatchLogEntry } from '../types';

interface AlertChannelsCardProps {
  onInspectMetric?: (title: string, value: string, source: string, method: string) => void;
}

export const AlertChannelsCard: React.FC<AlertChannelsCardProps> = ({ onInspectMetric }) => {
  const [channels] = useState<ChannelStatus[]>(ALERT_CHANNELS);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [dispatchLogs, setDispatchLogs] = useState<SimulatedDispatchLogEntry[]>([]);

  const handleTestDispatch = (channelId: string, channelName: string) => {
    setTestingChannelId(channelId);

    setTimeout(() => {
      setTestingChannelId(null);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} IST`;

      const newEntry: SimulatedDispatchLogEntry = {
        id: `sim-${Date.now()}`,
        timestamp: timeStr,
        channelName: channelName,
        destination: 'None (simulated)',
        latencyTarget: 'Design target: < 4.0s',
        status: 'ACK RECEIVED (SIMULATED)',
        payloadSnippet: `PING: HANDSHAKE PROBE TO ${channelName.toUpperCase()} [SIMULATED - no message sent]`,
      };

      setDispatchLogs((prev) => [newEntry, ...prev.slice(0, 7)]);
    }, 900);
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-slate-800" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Multi-Channel Emergency Warning Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Planned notification channels for deep valleys. None of them is connected in this prototype.
          </p>
        </div>

        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-600 border border-slate-200">
          CHANNEL DESIGN (SIMULATED)
        </span>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <motion.div
            key={ch.id}
            layout
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-shadow hover:bg-white hover:shadow-sm"
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
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono ${getStatusBadge(
                    ch.status
                  )}`}
                >
                  {ch.status}
                </span>
              </div>

              {/* Unsourced metrics relabeled with "Design target" per GLOBAL RULES */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Coverage:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    Not measured (prototype)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Latency:</span>
                  <span className="font-mono text-slate-900 font-bold">
                    Not measured (prototype)
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 border-t border-slate-200 pt-2 leading-relaxed">
                {ch.notes}
              </p>
            </div>

            {/* Test Channel Ping button */}
            <div className="mt-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => handleTestDispatch(ch.id, ch.name)}
                disabled={testingChannelId === ch.id}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 shadow-2xs cursor-pointer"
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

      {/* TASK 5: ON-SCREEN DISPATCH LOG TABLE */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-tight text-slate-900">
              On-Screen Channel Dispatch Log
            </h4>
            <span className="rounded bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-900">
              SIMULATED - no message sent
            </span>
          </div>

          {dispatchLogs.length > 0 && (
            <button
              onClick={() => setDispatchLogs([])}
              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {dispatchLogs.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-xs font-mono">
            No simulated dispatches logged. Click "Test Channel Ping" on any channel above to test relay latency.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2 px-2">Timestamp</th>
                  <th className="py-2 px-2">Target Channel</th>
                  <th className="py-2 px-2">Destination / Nodes</th>
                  <th className="py-2 px-2">Latency Spec</th>
                  <th className="py-2 px-2">Relay Status</th>
                  <th className="py-2 px-2">Payload (SIMULATED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {dispatchLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white transition-colors">
                    <td className="py-2 px-2 text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2 px-2 font-bold text-slate-900">{log.channelName}</td>
                    <td className="py-2 px-2 text-slate-600">{log.destination}</td>
                    <td className="py-2 px-2 text-slate-500">{log.latencyTarget}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-500 truncate max-w-[200px]">
                      {log.payloadSnippet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dissemination Notice */}
      <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-slate-800 shrink-0" />
        <p>
          <strong>Gateway Dissemination Notice:</strong> Cell broadcast channels interface with national telecom Cell Broadcast Centers (CBC) using 3GPP TS 23.041 standards with local LoRaWAN mesh fallback. All test pings on this prototype are strictly simulated.
        </p>
      </div>
    </div>
  );
};
