import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Layers,
  Cpu,
  Database,
  Radio,
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { PIPELINE_STAGES, TECH_STACK } from '../data/mockData';

export const AboutView: React.FC = () => {
  const riskLevels = [
    {
      level: 'LOW',
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      scoreRange: '0 – 29 Index',
      title: 'Nominal Baseline',
      action: 'Routine monitoring. Normal community and agrarian activities permitted. Telemetry verified every 15 minutes.',
    },
    {
      level: 'MEDIUM',
      color: 'bg-amber-500 text-slate-900',
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      scoreRange: '30 – 59 Index',
      title: 'Hydrological Advisory',
      action: 'Advisory dispatched to Gram Pradhans & local disaster cells. Continuous watch over drainage channels and feeder torrents.',
    },
    {
      level: 'HIGH',
      color: 'bg-orange-500 text-white',
      border: 'border-orange-200',
      bg: 'bg-orange-50/50',
      scoreRange: '60 – 79 Index',
      title: 'Imminent Flood Watch',
      action: 'Evacuation logistics staged. Pre-position emergency vehicles. Sirens tested and mobile alerts broadcasted.',
    },
    {
      level: 'SEVERE',
      color: 'bg-red-600 text-white',
      border: 'border-red-200',
      bg: 'bg-red-50/50',
      scoreRange: '80 – 100 Index',
      title: 'Level-1 Emergency Evacuation',
      action: 'Immediate physical relocation to designated high-ground shelters. Autonomous 130dB siren triggering. LoRa mesh active.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <ShieldAlert className="h-4 w-4" />
            <span>HIMALAYAN FLASH FLOOD DECISION-SUPPORT PROTOTYPE</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            HydroGuard: Flash Flood Decision-Support Prototype
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            HydroGuard is a rule-based decision-support prototype. It takes <strong>modelled rainfall</strong>, <strong>topsoil moisture</strong> and <strong>modelled river discharge</strong> for each village, turns them into an explainable 0-100 risk score, and shows the result with evacuation guidance and a CAP 1.2 exercise export. It does not use field sensors yet, is not calibrated against gauge records, and is not connected to any alerting authority.</p>

          <div className="pt-2 text-xs text-slate-600 flex flex-wrap gap-4 font-mono">
            <div><strong className="text-slate-900">Purpose:</strong> Decision support for disaster-management staff</div>
            <div><strong className="text-slate-900">Prototype scope:</strong> Chamoli / Rishi Ganga catchment, Uttarakhand</div>
            <div><strong className="text-slate-900">Alert format:</strong> CAP 1.2 export built (exercise only); LoRaWAN and satellite failover are planned</div>
          </div>
        </div>
      </div>

      {/* Built / Simulated / Planned */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">What is real, simulated and planned</h3>
          <p className="text-xs text-slate-500 mt-0.5">Stated plainly so nothing here is mistaken for a deployed system.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
            <h4 className="text-sm font-bold text-emerald-800">Built</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Live Open-Meteo forecast-model rainfall and soil moisture, fetched per village</li>
              <li>GloFAS modelled river discharge (daily), when available</li>
              <li>Explainable per-village scoring with a "Why this score" breakdown</li>
              <li>ERA5 event replay with computed peak and threshold-crossing times</li>
              <li>CAP 1.2 export, marked as an exercise</li>
              <li>Web app: React, TypeScript, Vite, Tailwind</li>
            </ul>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-2">
            <h4 className="text-sm font-bold text-purple-800">Simulated or illustrative</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Demo Simulator scenarios (synthetic inputs)</li>
              <li>Channel test pings (nothing is sent)</li>
              <li>Village populations, shelters, routes and river distances (not surveyed)</li>
              <li>Wave-speed assumption of 2-5 m/s and the 0.42 m³/m³ soil capacity</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <h4 className="text-sm font-bold text-slate-800">Planned</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Field rain gauges, river radar and soil probes</li>
              <li>Calibration against USDMA, CWC and IMD gauge records</li>
              <li>DEM and Sentinel-1 terrain analysis; cryospheric trigger detection</li>
              <li>Real SMS, cell broadcast, siren and LoRa integration with the authorities</li>
              <li>Evaluation of ML models once calibration data exists</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conceptual Pipeline (Section 12 requirement) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900">
            Target Pipeline: What Is Built and What Is Planned
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each stage below is tagged Built, Partial, Simulated or Planned.
          </p>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PIPELINE_STAGES.map((stage, idx) => (
            <div
              key={stage.stage}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    STAGE {stage.stage}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold font-mono border ${
                      stage.status === 'BUILT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : stage.status === 'PARTIAL'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : stage.status === 'SIMULATED'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {stage.status}
                  </span>
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <span className="hidden xl:block text-slate-400 text-xs font-bold">
                      →
                    </span>
                  )}
                </div>

                <h4 className="mt-2 text-sm font-bold text-slate-900">
                  {stage.title}
                </h4>
                <div className="text-[11px] font-semibold text-slate-500">
                  {stage.subtitle}
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
                {stage.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Risk Levels (Low → Medium → High → Severe) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900">
            Standardized Civil Defense 4-Tier Risk Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Low (Green) → Medium (Yellow) → High (Orange) → Severe (Red)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {riskLevels.map((risk) => (
            <div
              key={risk.level}
              className={`rounded-xl border p-4.5 flex flex-col justify-between ${risk.border} ${risk.bg}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${risk.color}`}>
                    {risk.level}
                  </span>
                  <span className="text-xs font-mono text-slate-600 font-semibold">
                    {risk.scoreRange}
                  </span>
                </div>

                <h4 className="mt-2.5 text-sm font-bold text-slate-900">
                  {risk.title}
                </h4>

                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {risk.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Section (Section 13 requirement) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900">
              Planned Technology Stack
            </h3>
            <p className="text-xs text-slate-500">
              Modular architecture planned for scalable field deployment across hilly disaster zones
            </p>
          </div>

          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-600 border border-slate-200">
            PROPOSED SYSTEM ARCHITECTURE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  {tech.name}
                </h4>
                <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                  {tech.category}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* Engineering Standards Notice */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
          <Info className="h-4 w-4 text-slate-800 shrink-0" />
          <span>
            <strong>Standards note:</strong> the design is informed by the WMO multi-hazard early warning framework and NDMA guidance. It has not been reviewed or certified by either body.
          </span>
        </div>
      </div>
    </div>
  );
};
