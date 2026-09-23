import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  RotateCcw,
  Radio,
  Home,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Compass,
  Mountain,
} from "lucide-react";
import { VillageData, RiskLevel } from "../types";
import { AnimatedNumber } from "./AnimatedNumber";

interface MapVillage extends VillageData {
  coordinates: { xPercent: number; yPercent: number };
}
interface RiskMapProps {
  villages: MapVillage[];
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
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    villages[0]?.id || "v1",
  );
  const [showZones, setShowZones] = useState<boolean>(false);
  const [showContours, setShowContours] = useState<boolean>(false);
  const [showShelters, setShowShelters] = useState<boolean>(false);
  const [showSensors, setShowSensors] = useState<boolean>(false);
  const [showRoutes, setShowRoutes] = useState<boolean>(false);

  const selectedVillage =
    villages.find((v) => v.id === selectedVillageId) || villages[0];

  const getPinColor = (level: RiskLevel) => {
    switch (level) {
      case "SEVERE":
        return {
          bg: "bg-red-600",
          ring: "ring-red-300",
          text: "text-red-700",
          badge: "bg-red-50 text-red-700 border border-red-200",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500",
          ring: "ring-orange-300",
          text: "text-orange-700",
          badge: "bg-orange-50 text-orange-700 border border-orange-200",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500",
          ring: "ring-amber-300",
          text: "text-amber-700",
          badge: "bg-amber-50 text-amber-800 border border-amber-200",
        };
      default:
        return {
          bg: "bg-emerald-600",
          ring: "ring-emerald-300",
          text: "text-emerald-700",
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        };
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
              Catchment Risk Map
            </h3>
            <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Schematic, not to scale
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Rishi Ganga – Alaknanda confluence reach • schematic layout, no
            elevation model
          </p>
        </div>

        <span className="text-[10px] text-slate-500">
          Live scores • schematic geography
        </span>
      </div>

      {/* Map + Inspector Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Vector Cartographic Stage (Cols 8) */}
        <div className="lg:col-span-8 relative aspect-16/10 sm:aspect-16/9 rounded-xl border border-slate-300/80 bg-slate-900 overflow-hidden shadow-inner select-none">
          {/* Topographic SVG Cartography */}
          <svg
            viewBox="0 0 1000 600"
            className="h-full w-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="riverGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              <pattern
                id="gridPattern"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeOpacity="0.4"
                />
              </pattern>

              <linearGradient id="surgePulse" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Dark Tactical Cartographic Canvas */}
            <rect width="1000" height="600" fill="#0f172a" />
            <rect width="1000" height="600" fill="url(#gridPattern)" />

            {/* Elevation Contour Bands */}
            {showContours && (
              <g stroke="#334155" strokeWidth="1" fill="none" opacity="0.6">
                {/* 3200m ridge */}
                <path
                  d="M0,50 Q250,20 500,80 T1000,40"
                  strokeWidth="1.5"
                  stroke="#475569"
                />
                <text
                  x="30"
                  y="45"
                  fill="#64748b"
                  className="text-[10px] font-mono"
                >
                  3,200m Ridge Crest
                </text>
                {/* 2800m contour */}
                <path d="M0,130 Q300,90 600,160 T1000,110" />
                {/* 2400m contour */}
                <path d="M0,220 Q350,180 700,260 T1000,200" />
                <text
                  x="30"
                  y="215"
                  fill="#64748b"
                  className="text-[10px] font-mono"
                >
                  2,400m Talus Slope
                </text>
                {/* 2000m contour */}
                <path d="M0,380 Q400,340 750,420 T1000,360" />
                {/* 1600m valley floor */}
                <path
                  d="M0,500 Q450,470 800,530 T1000,490"
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                <text
                  x="30"
                  y="495"
                  fill="#64748b"
                  className="text-[10px] font-mono"
                >
                  1,600m Active Gorge Floor
                </text>
              </g>
            )}

            {/* Inundation / Risk Zones */}
            {showZones && (
              <g>
                {/* High Inundation Buffer */}
                <path
                  d="M90,600 L150,460 L260,330 L420,250 L590,190 L750,150 L900,100 L1000,100 L1000,240 L840,290 L670,340 L500,410 L340,490 L240,600 Z"
                  fill="rgba(249, 115, 22, 0.18)"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="5,4"
                />

                {/* Severe Inundation Corridor */}
                <path
                  d="M120,600 L180,480 L290,360 L450,280 L620,220 L780,180 L920,130 L970,180 L820,240 L650,290 L480,360 L320,440 L220,600 Z"
                  fill="rgba(239, 68, 68, 0.28)"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
              </g>
            )}

            {/* Highway NH-58 Transport Lifeline */}
            <path
              d="M50,560 Q260,430 460,330 T860,190 L980,160"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeDasharray="8,4"
            />
            <text
              x="690"
              y="235"
              fill="#94a3b8"
              className="text-[10px] font-mono font-semibold"
            >
              NH-58 (Joshimath-Badrinath Corridor)
            </text>

            {/* Main River Course (Rishi Ganga & Alaknanda) */}
            <path
              d="M150,600 C220,490 320,390 470,300 C620,230 760,190 950,140"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M150,600 C220,490 320,390 470,300 C620,230 760,190 950,140"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="14,14"
              className="animate-river-flow"
            />

            {/* Confluence Tributary (Dhauli Ganga) */}
            <path
              d="M470,300 Q430,160 380,50"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M470,300 Q430,160 380,50"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="10,10"
              className="animate-river-flow"
            />
            <text
              x="320"
              y="90"
              fill="#38bdf8"
              className="text-[10px] font-bold font-mono"
            >
              ← Rishi Ganga Confluence Reach
            </text>

            {/* Evacuation Trajectory Vectors */}
            {showRoutes && (
              <g
                stroke="#10b981"
                strokeWidth="2.2"
                strokeDasharray="6,4"
                fill="none"
                className="animate-evac-march"
              >
                {/* Route Raini -> Shelter 01 */}
                <path d="M780,240 Q770,160 760,96" />
                {/* Route Tapovan -> Shelter 02 */}
                <path d="M600,290 Q480,230 376,196" />
                {/* Route Helang -> Shelter 02 */}
                <path d="M350,420 L365,200" />
              </g>
            )}

            {/* River Flow Direction Indicators */}
            <polygon points="490,290 465,300 480,312" fill="#38bdf8" />
            <polygon points="260,440 240,455 255,465" fill="#38bdf8" />

            {/* Real-Time Sensor Nodes with Radar Wave Pulse */}
            {showSensors && (
              <g>
                <circle
                  cx="940"
                  cy="140"
                  r="7"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx="940"
                  cy="140"
                  r="14"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="animate-radar-ring"
                />
                <text
                  x="810"
                  y="130"
                  fill="#38bdf8"
                  className="text-[9px] font-mono font-bold"
                >
                  Planned sensor site 1 (headwaters)
                </text>

                <circle
                  cx="470"
                  cy="300"
                  r="7"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx="470"
                  cy="300"
                  r="14"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="animate-radar-ring"
                />
                <text
                  x="490"
                  y="325"
                  fill="#38bdf8"
                  className="text-[9px] font-mono font-bold"
                >
                  Planned sensor site 2 (Tapovan)
                </text>

                <circle
                  cx="160"
                  cy="590"
                  r="7"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="180"
                  y="585"
                  fill="#38bdf8"
                  className="text-[9px] font-mono font-bold"
                >
                  Planned sensor site 3 (Joshimath)
                </text>
              </g>
            )}

            {/* High-Ground Emergency Safe Shelters */}
            {showShelters && (
              <g>
                <rect
                  x="750"
                  y="75"
                  width="20"
                  height="20"
                  rx="4"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="780"
                  y="89"
                  fill="#34d399"
                  className="text-[10px] font-bold font-mono"
                >
                  SHELTER 01 (illustrative)
                </text>
                <text
                  x="780"
                  y="103"
                  fill="#94a3b8"
                  className="text-[9px] font-mono"
                >
                  Capacity and supplies: not surveyed
                </text>

                <rect
                  x="350"
                  y="175"
                  width="20"
                  height="20"
                  rx="4"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="380"
                  y="189"
                  fill="#34d399"
                  className="text-[10px] font-bold font-mono"
                >
                  SHELTER 02 (illustrative)
                </text>
                <text
                  x="380"
                  y="203"
                  fill="#94a3b8"
                  className="text-[9px] font-mono"
                >
                  Capacity and supplies: not surveyed
                </text>
              </g>
            )}
          </svg>

          {/* Tactical HUD Overlay Elements */}
          {/* North Arrow Compass Rose */}
          <div className="absolute top-3 right-3 rounded-lg bg-slate-950/80 border border-slate-700/60 p-2 text-white flex flex-col items-center backdrop-blur-xs shadow-md">
            <Compass className="h-5 w-5 text-emerald-400" />
            <span className="text-[9px] font-bold font-mono mt-0.5 text-slate-300">
              GRID N
            </span>
          </div>

          {/* Interactive Village Markers (Placed via CSS percentage coordinates) */}
          {villages.map((village) => {
            const isSelected = selectedVillage.id === village.id;
            const colors = getPinColor(village.riskLevel);

            return (
              <div
                key={village.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${village.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedVillageId(village.id);
                    onSelectVillage(village);
                  }
                }}
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
                {/* Pin Circle with Ripple when Selected */}
                <div className="relative">
                  {isSelected && (
                    <span className="animate-ping absolute -inset-1 rounded-full bg-emerald-400 opacity-60" />
                  )}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg transition-all ${
                      colors.bg
                    } ${isSelected ? "ring-3 ring-emerald-400 scale-110" : "ring-2 ring-white/90"}`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>

                {/* Village Label Pill */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded-md bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md border border-slate-700">
                  {village.name}
                </div>
              </div>
            );
          })}

          {/* Map Legend Floating Box */}
          <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/85 p-2.5 shadow-lg border border-slate-800 text-[10px] space-y-1 backdrop-blur-xs text-white">
            <span className="font-bold text-slate-300 uppercase tracking-wider block font-mono">
              Risk tiers
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-slate-300">Severe model score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
              <span className="text-slate-300">High model score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm bg-emerald-500 shrink-0" />
              <span className="text-slate-300">Low model score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-4 bg-emerald-400 rounded shrink-0 border-b border-dashed" />
              <span className="text-slate-300">Schematic, not a route</span>
            </div>
          </div>
        </div>

        {/* Selected Village Inspector Panel (Cols 4) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col justify-between space-y-4 shadow-2xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVillage.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Rishi Ganga catchment
                  </span>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5">
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
                <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Current risk score
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-slate-700" />
                    <AnimatedNumber
                      value={selectedVillage.riskScore}
                      duration={400}
                    />
                  </span>
                </div>

                <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Coordinates
                  </span>
                  <span className="text-base font-extrabold text-red-600 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-red-500" />
                    {selectedVillage.lat.toFixed(3)}° N
                  </span>
                </div>

                <div className="col-span-2 rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Data interpretation
                  </span>
                  <div className="font-bold text-emerald-700 mt-0.5 flex items-center justify-between">
                    <span className="truncate">Model grid, not a sensor</span>
                    <span className="font-mono text-slate-600 text-xs shrink-0"></span>
                  </div>
                </div>
              </div>

              {/* Monitoring guidance Callout */}
              <div className="mt-3 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-900">
                <span className="font-bold block uppercase text-[10px] tracking-wider text-red-700">
                  Monitoring guidance
                </span>
                <p className="mt-0.5 text-[11px] leading-relaxed font-medium">
                  Follow official district advisories. This score is not an
                  evacuation instruction.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Trigger */}
          <button
            onClick={() => onViewRoute(selectedVillage)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>EXPLAIN VILLAGE SCORE</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
