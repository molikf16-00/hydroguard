import React from 'react';
import { ShieldAlert, Radio, Server, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Hydro<span className="text-slate-900 font-black">Guard</span>
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200">
                HF-DSS v2.4
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Himalayan Flash Flood Decision Support & Early Warning System
            </p>
          </div>

          {/* Institutional / Operational Standards Card */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 text-left sm:text-right space-y-0.5">
            <div className="flex items-center gap-1.5 sm:justify-end text-[11px] font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>CAP v1.2 Protocol Compliant</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              ITU-T X.1303 • WMO EW4All Architecture
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Central Himalayan Hydromet Ingest Network
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-5 text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span>© 2026 HydroGuard Systems. Built for high-stakes mountain hydrology and public safety.</span>
          </div>
          <div className="flex items-center gap-3 font-medium text-slate-600">
            <span className="flex items-center gap-1"><Server className="h-3 w-3 text-slate-400" /> Multi-Source Fusion Engine</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Radio className="h-3 w-3 text-slate-400" /> LoRa Mesh Relays</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> 99.98% Telemetry Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
