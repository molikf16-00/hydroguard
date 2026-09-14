import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  MapPin,
  Users,
  History,
  Radio,
  ExternalLink,
  Flame,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AlertHistoryItem, RiskLevel } from '../types';

interface EmergencyAlertPanelProps {
  overallRisk: RiskLevel;
  headline: string;
  description: string;
  affectedCluster: string;
  leadTime: string;
  recommendedAction: string;
  activeAlerts: AlertHistoryItem[];
  onViewEvacuationPlan: () => void;
  onViewAffectedVillages: () => void;
}

export const EmergencyAlertPanel: React.FC<EmergencyAlertPanelProps> = ({
  overallRisk,
  headline,
  description,
  affectedCluster,
  leadTime,
  recommendedAction,
  activeAlerts,
  onViewEvacuationPlan,
  onViewAffectedVillages,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredAlerts = filterLevel === 'ALL'
    ? activeAlerts
    : activeAlerts.filter((a) => a.level === filterLevel);

  const getAlertBadge = (level: RiskLevel) => {
    switch (level) {
      case 'SEVERE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Broadcast Log Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-slate-800" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Emergency Broadcast Dispatches & Alert History
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Filter:</span>
            {['ALL', 'SEVERE', 'HIGH', 'MEDIUM'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition border ${
                  filterLevel === lvl
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Log Feed */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-3 rounded-l-md">Timestamp</th>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Advisory Title & Catchment Area</th>
                <th className="py-2.5 px-3">Dispatched Channels</th>
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3 rounded-r-md">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-600">
                    <div className="font-semibold text-slate-900">{alert.time}</div>
                    <div className="text-[10px] text-slate-400">{alert.relativeTime}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${getAlertBadge(
                        alert.level
                      )}`}
                    >
                      {alert.level}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{alert.title}</div>
                    <div className="text-[11px] text-slate-500">{alert.area}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {alert.channels.map((ch, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 border border-slate-200"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {alert.leadTime}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        alert.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${alert.status === 'ACTIVE' ? 'bg-red-600 animate-ping' : 'bg-slate-400'}`} />
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
