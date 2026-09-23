import { completeSum, contiguousHours, isReading } from "../utils/dataQuality";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Play,
  RotateCcw,
  CloudRain,
  Mountain,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  Calendar,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Activity,
  ShieldAlert,
} from "lucide-react";
import {
  fetchHistoricalEventArchive,
  fetchHistoricalDischarge,
  dischargeRatioForDate,
} from "../utils/openMeteo";
import { MODEL_ASSUMPTIONS } from "../config/catchmentConfig";
import { calculateTransparentRiskScore } from "../utils/riskScoring";
import { RiskLevel } from "../types";

interface HistoricalEventPreset {
  id: string;
  name: string;
  dateRange: string;
  location: string;
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
  peakEventIso: string;
  peakEventLabel: string;
  type: "rainfall" | "cryospheric";
  summary: string;
  /** Neutral background only. Results are computed from data and shown separately. */
  context: string;
}

const PRESETS: HistoricalEventPreset[] = [
  {
    id: "kedarnath-2013",
    name: "Kedarnath flood (June 2013)",
    dateRange: "14 June - 18 June 2013",
    location: "Mandakini Valley / Kedarnath (30.735° N, 79.067° E)",
    lat: 30.7346,
    lon: 79.0669,
    startDate: "2013-06-14",
    endDate: "2013-06-18",
    peakEventIso: "2013-06-17T07:00",
    peakEventLabel:
      "Approx. Chorabari Lake outburst, 17 June morning (verify against NDMA/WIHG reports)",
    type: "rainfall",
    summary:
      "Extreme multi-day rainfall in the Mandakini catchment, followed by flooding and a moraine-lake outburst.",
    context:
      "A rainfall-driven event, so it is within the scope of this prototype. The result below is computed from ERA5 reanalysis data at roughly 25 km resolution, which can understate local cloudburst intensity.",
  },
  {
    id: "chamoli-2021",
    name: "Chamoli disaster (7 Feb 2021): out-of-scope example",
    dateRange: "05 Feb - 09 Feb 2021",
    location: "Rishi Ganga / Tapovan Gorge (30.488° N, 79.697° E)",
    lat: 30.4884,
    lon: 79.6972,
    startDate: "2021-02-05",
    endDate: "2021-02-09",
    peakEventIso: "2021-02-07T10:21",
    peakEventLabel:
      "7 Feb, about 10:21 IST: rock-and-ice avalanche near Ronti Peak",
    type: "cryospheric",
    summary:
      "A mass of rock and glacier ice detached and travelled down the gorge. It is widely attributed to a rock-ice avalanche, not heavy rainfall.",
    context:
      "Not a rainfall-driven event. It is included to show what a rainfall-based score can and cannot see. Detecting this kind of trigger would need satellite or seismic sensing, which is planned and not built.",
  },
];

interface TimelinePoint {
  timeIso: string;
  displayTime: string;
  rain1h: number;
  rain24h: number;
  rain72h: number;
  soilPct: number;
  riskScore: number;
  riskLevel: RiskLevel;
  isPeak: boolean;
}

export const EventReplayView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<HistoricalEventPreset>(
    PRESETS[0],
  );
  const [loading, setLoading] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [riverIncluded, setRiverIncluded] = useState<boolean>(false);

  // Fetch and compute timeline when preset changes
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    async function loadReplay() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [raw, discharge] = await Promise.all([
          fetchHistoricalEventArchive(
            selectedPreset.lat,
            selectedPreset.lon,
            selectedPreset.startDate,
            selectedPreset.endDate,
            controller.signal,
          ),
          fetchHistoricalDischarge(
            selectedPreset.lat,
            selectedPreset.lon,
            selectedPreset.startDate,
            selectedPreset.endDate,
            controller.signal,
          ),
        ]);

        if (isCancelled) return;

        const times = raw.times;
        const precip = raw.precipitation;
        const soil = raw.soilMoisture;
        const points: TimelinePoint[] = [];
        let anyRatio = false;

        for (let i = 0; i < times.length; i++) {
          const tIso = times[i];
          if (tIso.slice(0, 10) < selectedPreset.startDate) continue;
          const r72 = completeSum(precip, i, 72);
          const rawSm = soil[i];
          if (
            r72 === null ||
            !contiguousHours(times, i, 72) ||
            !isReading(rawSm) ||
            rawSm > 1
          )
            continue;
          const r1 = precip[i] as number;
          const r3 = completeSum(precip, i, 3)!;
          const r24 = completeSum(precip, i, 24)!;
          const soilPct = Math.min(
            100,
            Math.round((rawSm / MODEL_ASSUMPTIONS.soilFieldCapacityM3M3) * 100),
          );

          // Historical GloFAS discharge only; never estimated from rainfall. Times are IST, discharge dates are GMT.
          const utcDate = new Date(`${tIso}:00+05:30`)
            .toISOString()
            .slice(0, 10);
          const ratio = discharge
            ? dischargeRatioForDate(discharge, utcDate)
            : null;
          if (ratio) anyRatio = true;

          const scoreObj = calculateTransparentRiskScore({
            rain1hMm: r1,
            rain3hMm: r3,
            rain24hMm: r24,
            rain72hAntecedentMm: r72,
            soilMoistureSaturationPct: soilPct,
            riverDischargeRatio: ratio ? ratio.ratio : null,
            freshnessText: `Historical reanalysis: ${tIso.replace("T", " ")} IST`,
          });

          points.push({
            timeIso: tIso,
            displayTime: `${tIso.slice(5, 10)} ${tIso.slice(11, 16)}`,
            rain1h: +r1.toFixed(1),
            rain24h: +r24.toFixed(1),
            rain72h: +r72.toFixed(1),
            soilPct,
            riskScore: scoreObj.totalScore,
            riskLevel: scoreObj.riskLevel,
            isPeak: tIso.startsWith(selectedPreset.peakEventIso.slice(0, 13)),
          });
        }

        if (!points.length) throw new Error("Insufficient archive coverage");
        setRiverIncluded(anyRatio);
        setTimelineData(points);
        const peakIdx = points.findIndex((p) => p.isPeak);
        setSelectedPointIndex(peakIdx !== -1 ? peakIdx : points.length - 1);
      } catch (err: unknown) {
        if (isCancelled) return;
        console.error("Replay fetch failed", err);
        setTimelineData([]);
        setErrorMsg(
          "Archive unavailable or incomplete. A complete 72-hour rainfall history and soil reading are required. Switch events to retry.",
        );
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadReplay();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [selectedPreset]);

  // Computed result: everything below comes from the timeline, nothing is pre-written.
  const replaySummary = React.useMemo(() => {
    if (timelineData.length === 0) return null;
    const toMs = (t: string) => new Date(`${t}:00+05:30`).getTime();
    const eventMs = toMs(selectedPreset.peakEventIso);
    const peak = timelineData.reduce(
      (best, p) => (p.riskScore > best.riskScore ? p : best),
      timelineData[0],
    );
    const crossing = (label: string, threshold: number) => {
      const pt = timelineData.find((p) => p.riskScore >= threshold);
      if (!pt)
        return {
          label,
          threshold,
          time: null as string | null,
          hours: null as number | null,
        };
      return {
        label,
        threshold,
        time: pt.displayTime,
        hours: Math.round((eventMs - toMs(pt.timeIso)) / 3600000),
      };
    };
    return {
      peak,
      crossings: [
        crossing("MEDIUM", 30),
        crossing("HIGH", 60),
        crossing("SEVERE", 80),
      ],
    };
  }, [timelineData, selectedPreset]);

  const activePoint =
    selectedPointIndex !== null && timelineData[selectedPointIndex]
      ? timelineData[selectedPointIndex]
      : timelineData[timelineData.length - 1];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50 border-red-200";
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    if (score >= 30) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-800" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase sm:text-2xl">
                Historical Event Replay
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Run HydroGuard transparent risk scoring on historical Open-Meteo
              ERA5 atmospheric archives
            </p>
          </div>

          <span className="rounded-md bg-slate-100 px-3 py-1 font-mono text-xs text-slate-700 border border-slate-200">
            ERA5 REANALYSIS ENGINE (OPEN-METEO)
          </span>
        </div>
      </div>

      {/* Preset Selector Tabs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className={`text-left rounded-2xl border p-4 transition cursor-pointer shadow-xs ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900/20"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-800 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded ${
                    isSelected
                      ? "bg-slate-800 text-emerald-400"
                      : preset.type === "rainfall"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  {preset.type === "rainfall"
                    ? "Rainfall-Driven Flood"
                    : "Cryospheric Hazard (Out-of-Scope)"}
                </span>
                <span
                  className={`text-[11px] font-mono ${isSelected ? "text-slate-300" : "text-slate-500"}`}
                >
                  {preset.dateRange}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-bold">{preset.name}</h3>
              <p
                className={`mt-1 text-xs line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-600"}`}
              >
                {preset.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Replay Details Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              REPLAY CASE
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              {selectedPreset.name}
            </h3>
            <span className="text-xs text-slate-500 block mt-0.5">
              Location: {selectedPreset.location}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-mono font-bold text-amber-900">
            <Clock className="h-3.5 w-3.5 text-amber-700" />
            <span>Marked event: {selectedPreset.peakEventLabel}</span>
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200 leading-relaxed">
          <strong className="text-slate-900">Context: </strong>
          {selectedPreset.context}
        </div>

        <div className="rounded-xl bg-white p-3 text-xs text-slate-700 border border-slate-300 leading-relaxed space-y-1.5">
          <strong className="text-slate-900">
            Computed result (from ERA5 data, not pre-written)
          </strong>
          {loading && <p className="text-slate-500">Computing...</p>}
          {!loading && !replaySummary && (
            <p className="text-slate-500">
              No result: the archive could not be loaded.
            </p>
          )}
          {!loading && replaySummary && (
            <>
              <p>
                Peak score in the window:{" "}
                <strong>
                  {replaySummary.peak.riskScore}/100 (
                  {replaySummary.peak.riskLevel})
                </strong>{" "}
                at {replaySummary.peak.displayTime} IST.
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
                {replaySummary.crossings.map((c) => (
                  <li key={c.label}>
                    First reached {c.label} ({c.threshold}+):{" "}
                    {c.time === null || c.hours === null
                      ? "never in this window"
                      : c.hours > 0
                        ? `${c.time} IST, ${c.hours} h before the marked event time`
                        : c.hours < 0
                          ? `${c.time} IST, ${Math.abs(c.hours)} h after the marked event time`
                          : `${c.time} IST, at the marked event time`}
                  </li>
                ))}
              </ul>
              <p className="text-slate-500">
                River factor:{" "}
                {riverIncluded
                  ? "included (historical GloFAS discharge)"
                  : "excluded (no historical discharge available; weights renormalized)"}
                . Missing hours are excluded. Retrospective daily discharge
                includes information unavailable earlier that day; these
                crossings are not forecast lead-time validation.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Timeline Chart Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-tight">
              HydroGuard Risk Score & Precipitation Timeline
            </h4>
            <span className="text-[11px] text-slate-500">
              Interactive timeline with disaster moment marker. Click or hover
              any bar to inspect.
            </span>
          </div>

          {activePoint && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">
                Inspecting:
              </span>
              <span className="font-mono font-bold text-xs text-slate-900">
                {activePoint.displayTime}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getScoreColor(activePoint.riskScore)}`}
              >
                Score: {activePoint.riskScore}/100 ({activePoint.riskLevel})
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-800" />
            <span className="text-xs font-mono">
              Fetching ERA5 reanalysis archive from Open-Meteo...
            </span>
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-center text-xs text-red-600 bg-red-50 rounded-xl border border-red-200">
            {errorMsg}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Bar Chart */}
            <div className="relative pt-6 pb-2">
              {/* Reference Risk Lines */}
              <div className="absolute inset-x-0 top-6 bottom-8 pointer-events-none flex flex-col justify-between text-[9px] font-mono text-slate-400">
                <div className="border-b border-dashed border-red-200 flex justify-between pr-1">
                  <span className="text-red-600 font-bold bg-white/80 px-1">
                    Severe (80)
                  </span>
                </div>
                <div className="border-b border-dashed border-orange-200 flex justify-between pr-1">
                  <span className="text-orange-600 font-bold bg-white/80 px-1">
                    High (60)
                  </span>
                </div>
                <div className="border-b border-dashed border-amber-200 flex justify-between pr-1">
                  <span className="text-amber-600 font-bold bg-white/80 px-1">
                    Medium (30)
                  </span>
                </div>
                <div className="border-b border-slate-200 flex justify-between pr-1">
                  <span className="text-slate-400 bg-white/80 px-1">
                    Baseline (0)
                  </span>
                </div>
              </div>

              {/* Bar Columns Grid */}
              <div className="relative z-10 flex items-end gap-1 sm:gap-1.5 h-48 overflow-x-auto px-2 pt-2">
                {timelineData.map((pt, idx) => {
                  const heightPercent = Math.max(4, pt.riskScore);
                  const isSelected = selectedPointIndex === idx;

                  return (
                    <button
                      key={pt.timeIso}
                      aria-label={`${pt.displayTime}: score ${pt.riskScore}`}
                      onClick={() => setSelectedPointIndex(idx)}
                      onMouseEnter={() => setSelectedPointIndex(idx)}
                      className="group relative flex-1 min-w-[10px] sm:min-w-[14px] flex flex-col items-center h-full justify-end cursor-pointer"
                    >
                      {/* Peak Marker Badge */}
                      {pt.isPeak && (
                        <div className="absolute -top-6 flex flex-col items-center z-20">
                          <span className="rounded bg-red-600 text-white font-mono text-[8px] font-bold px-1 py-0.2 whitespace-nowrap shadow-xs">
                            DISASTER EVENT
                          </span>
                          <div className="h-2 w-0.5 bg-red-600" />
                        </div>
                      )}

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all ${
                          isSelected
                            ? "bg-slate-900 ring-2 ring-slate-900/30"
                            : pt.isPeak
                              ? "bg-red-600"
                              : pt.riskScore >= 80
                                ? "bg-red-500/80 hover:bg-red-600"
                                : pt.riskScore >= 60
                                  ? "bg-orange-400 hover:bg-orange-500"
                                  : pt.riskScore >= 30
                                    ? "bg-amber-400 hover:bg-amber-500"
                                    : "bg-emerald-300 hover:bg-emerald-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* X Axis Time Labels */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-2 border-t border-slate-200 pt-1">
                <span>{timelineData[0]?.displayTime}</span>
                <span className="text-red-600 font-bold">▲ Event Peak</span>
                <span>
                  {timelineData[timelineData.length - 1]?.displayTime}
                </span>
              </div>
            </div>

            {/* Selected Point Inspection Grid */}
            {activePoint && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    1h Rainfall
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {activePoint.rain1h} mm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    24h Cumulative
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {activePoint.rain24h} mm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    72h Antecedent
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {activePoint.rain72h} mm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Soil Saturation
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    {activePoint.soilPct}%
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Model Tier
                  </span>
                  <span
                    className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs border ${getScoreColor(activePoint.riskScore)}`}
                  >
                    {activePoint.riskLevel} ({activePoint.riskScore}/100)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TASK 3: MANDATORY VISIBLE LIMITATION NOTE */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-900 font-mono text-[11px]">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
          <span>Atmospheric Reanalysis Spatial Resolution Limitation</span>
        </div>
        <p className="leading-relaxed">
          <strong>Limitation Note:</strong> Atmospheric reanalysis models (such
          as ERA5-Land and Open-Meteo Archive) operate at an effective grid
          resolution of approximately ~25 km. Consequently, hyper-localized
          orographic cloudbursts, narrow convective micro-cells, and isolated
          valley thermal updrafts may be smoothed out or significantly
          underestimated in reanalysis datasets compared to ground-truth
          automated weather stations (AWS).
        </p>
      </div>
    </div>
  );
};
