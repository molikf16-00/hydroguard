import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">HydroGuard</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
            Prototype
          </span>
        </div>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          A flash flood decision-support prototype built for Smart India Hackathon. It uses modelled weather and river
          data, is not calibrated against gauge records, and is not connected to any alerting authority. Nothing shown
          here is an official warning. In an emergency, call 112 or 1077 and follow instructions from local authorities.
        </p>
      </div>
    </footer>
  );
};
