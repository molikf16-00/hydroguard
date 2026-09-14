import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  ShieldAlert,
  Navigation,
  Users,
  Clock,
  ArrowRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Radio,
  Home,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { VillageData, RiskLevel } from '../types';

interface RiskMapProps {
  villages: VillageData[];
  overallRisk: RiskLevel;
  onSelectVillage: (village: VillageData) => void;
  onViewRoute: (village: VillageData) => void;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  villages,
  overallRisk,
  onSelectVillage,
  onViewRoute,
}) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string>(villages[0]?.id || 'v1');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);

  const selectedVillage = villages.find((v) => v.id === selectedVillageId) || villages[0];

  const getPinColor = (level: RiskLevel) => {
    switch (level) {
      case 'SEVERE':
        return { bg: 'bg-red-600', ring: 'ring-red-300', text: 'text-red-700', badge: 'bg-red-600 text-white' };
      case 'HIGH':
        return { bg: 'bg-orange-500', ring: 'ring-orange-300', text: 'text-orange-700', badge: 'bg-orange-500 text-white' };
      case 'MEDIUM':
        return { bg: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-700', badge: 'bg-amber-500 text-slate-900' };
      default:
        return { bg: 'bg-emerald-600', ring: 'ring-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-600 text-white' };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs space-y-4 overflow-hidden">
      {/* Top Map Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-700 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 truncate">
              Interactive Catchment GIS & Inundation Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Rishi Ganga – Alaknanda Confluence Corridor (Tapovan Gorge)
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Layers:</span>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`rounded-md px-2.5 py-1 font-semibold transition border ${
              showZones ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            Risk Zones
          </button>
          <button
            onClick={() => setShowContours(!showContours)}
            className={`rounded-md px-2.5 py-1 font-semibold transition border ${
              showContours ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            Contours
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`rounded-md px-2.5 py-1 font-semibold transition border ${
              showShelters ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            Shelters
          </button>
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`rounded-md px-2.5 py-1 font-semibold transition border ${
              showSensors ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-400 bg-white'
            }`}
          >
            Sensors
          </button>
        </div>
      </div>

      {/* Map + Inspector Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Vector Cartographic Stage (Cols 8) */}
        <div className="lg:col-span-8 relative aspect-16/10 sm:aspect-16/9 rounded-xl border border-slate-200 bg-[#f1f5f9] overflow-hidden shadow-inner select-none">
          {/* Topographic SVG Cartography */}
          <svg
            viewBox="0 0 1000 600"
            className="h-full w-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="valleyShade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>

            {/* Base Mountain Relief Background */}
            <rect width="1000" height="600" fill="#f8fafc" />

            {/* Elevation Contour Bands */}
            {showContours && (
              <g stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.8">
                {/* 3200m ridge */}
                <path d="M0,50 Q250,20 500,80 T1000,40" strokeWidth="1.5" />
                <text x="30" y="45" fill="#94a3b8" className="text-[10px] font-mono">3,200m Ridge</text>
                {/* 2800m contour */}
                <path d="M0,130 Q300,90 600,160 T1000,110" />
                {/* 2400m contour */}
                <path d="M0,220 Q350,180 700,260 T1000,200" />
                <text x="30" y="215" fill="#94a3b8" className="text-[10px] font-mono">2,400m Slope</text>
                {/* 2000m contour */}
                <path d="M0,380 Q400,340 750,420 T1000,360" />
                {/* 1600m valley floor */}
                <path d="M0,500 Q450,470 800,530 T1000,490" />
                <text x="30" y="495" fill="#94a3b8" className="text-[10px] font-mono">1,600m Valley Basin</text>
              </g>
            )}

            {/* Inundation / Risk Zones */}
            {showZones && (
              <g>
                {/* Severe Inundation Corridor */}
                <path
                  d="M120,600 L180,480 L290,360 L450,280 L620,220 L780,180 L920,130 L970,180 L820,240 L650,290 L480,360 L320,440 L220,600 Z"
                  fill="rgba(239, 68, 68, 0.18)"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
                {/* High Inundation Buffer */}
                <path
                  d="M90,600 L150,460 L260,330 L420,250 L590,190 L750,150 L900,100 L1000,100 L1000,240 L840,290 L670,340 L500,410 L340,490 L240,600 Z"
                  fill="rgba(249, 115, 22, 0.10)"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
              </g>
            )}

            {/* National Highway / Access Roads */}
            <path
              d="M50,560 Q260,430 460,330 T860,190 L980,160"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="8,4"
            />
            <text x="700" y="240" fill="#64748b" className="text-[10px] font-mono">
              NH-58 (Joshimath-Badrinath)
            </text>

            {/* Main River Course (Rishi Ganga & Alaknanda) */}
            <path
              d="M150,600 C220,490 320,390 470,300 C620,230 760,190 950,140"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M150,600 C220,490 320,390 470,300 C620,230 760,190 950,140"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="12,12"
            />

            {/* Confluence Tributary (Dhauli Ganga) */}
            <path
              d="M470,300 Q430,160 380,50"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="320" y="100" fill="#0284c7" className="text-[10px] font-bold font-mono">
              ← Rishi Ganga Confluence
            </text>

            {/* River Flow Direction Indicators */}
            <polygon points="490,290 465,300 480,312" fill="#0369a1" />
            <polygon points="260,440 240,455 255,465" fill="#0369a1" />

            {/* Sensor Nodes */}
            {showSensors && (
              <g>
                <circle cx="940" cy="140" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <circle cx="470" cy="300" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <circle cx="160" cy="590" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="830" y="130" fill="#0369a1" className="text-[9px] font-mono font-bold">RADAR-01 (Headwaters)</text>
                <text x="490" y="320" fill="#0369a1" className="text-[9px] font-mono font-bold">RADAR-02 (Tapovan)</text>
              </g>
            )}

            {/* Safe Shelters */}
            {showShelters && (
              <g>
                <rect x="760" y="80" width="16" height="16" rx="4" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                <text x="785" y="93" fill="#166534" className="text-[9px] font-bold font-mono">SHELTER 01 (High Ground 2,100m)</text>

                <rect x="360" y="180" width="16" height="16" rx="4" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                <text x="385" y="193" fill="#166534" className="text-[9px] font-bold font-mono">SHELTER 02 (Helang School)</text>
              </g>
            )}
          </svg>

          {/* Interactive Village Markers (Placed via CSS percentage coordinates) */}
          {villages.map((village) => {
            const isSelected = selectedVillage.id === village.id;
            const colors = getPinColor(village.riskLevel);

            return (
              <div
                key={village.id}
                style={{
                  left: `${village.coordinates.xPercent}%`,
                  top: `${village.coordinates.yPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 z-20"
                onClick={() => {
                  setSelectedVillageId(village.id);
                  onSelectVillage(village);
                }}
              >
                {/* Pin Circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-all ${
                    colors.bg
                  } ${isSelected ? 'ring-4 ring-slate-900 scale-110' : 'ring-2 ring-white'}`}
                >
                  <MapPin className="h-4 w-4" />
                </div>

                {/* Village Label Pill */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200">
                  {village.name}
                </div>
              </div>
            );
          })}

          {/* Map Legend Floating Box */}
          <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 p-2.5 shadow-sm border border-slate-200 text-[10px] space-y-1 backdrop-blur-xs">
            <span className="font-bold text-slate-800 uppercase block">Map Legend</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span className="text-slate-600">Severe Inundation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-slate-600">High Risk Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm bg-emerald-600" />
              <span className="text-slate-600">Designated Shelter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-6 bg-cyan-600 rounded" />
              <span className="text-slate-600">River Gorge (Surging)</span>
            </div>
          </div>
        </div>

        {/* Selected Village Inspector Panel (Cols 4) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedVillage.cluster}
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedVillage.name}
                </h4>
              </div>

              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  getPinColor(selectedVillage.riskLevel).badge
                }`}
              >
                {selectedVillage.riskLevel}
              </span>
            </div>

            {/* Village Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Population Exposed
                </span>
                <span className="text-base font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                  <Users className="h-3.5 w-3.5 text-slate-700" />
                  {selectedVillage.population.toLocaleString()}
                </span>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Impact Arrival
                </span>
                <span className="text-base font-bold text-red-600 font-mono flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-red-500" />
                  {selectedVillage.estimatedImpactTime}
                </span>
              </div>

              <div className="col-span-2 rounded-lg bg-white p-2.5 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Nearest Safe Shelter
                </span>
                <div className="font-bold text-emerald-700 mt-0.5 flex items-center justify-between">
                  <span>{selectedVillage.nearestShelter}</span>
                  <span className="font-mono text-slate-600 text-xs">
                    {selectedVillage.shelterDistanceKm} km ({selectedVillage.evacuationTimeMin} min)
                  </span>
                </div>
              </div>
            </div>

            {/* Directive */}
            <div className="mt-3 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-800">
              <span className="font-bold block">Action Directive:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                {selectedVillage.recommendedAction}
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={() => onViewRoute(selectedVillage)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>VIEW SAFE ROUTE GUIDANCE</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
