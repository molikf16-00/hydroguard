import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { Navbar } from "./components/Navbar";
import { MainRiskCard } from "./components/MainRiskCard";
import { MultiSourceCards } from "./components/MultiSourceCards";
import { RiskMap } from "./components/RiskMap";
import { RiskTrendChart } from "./components/RiskTrendChart";

import { WhyThisScoreModal } from "./components/WhyThisScoreModal";
import { MetricSourceModal } from "./components/MetricSourceModal";
import { CapAlertModal } from "./components/CapAlertModal";
import { Footer } from "./components/Footer";

import { useLiveCatchment } from "./hooks/useLiveCatchment";
import { DEFAULT_CATCHMENT_CONFIG } from "./config/catchmentConfig";
import type {
  MetricInspectionData,
  VillageData,
  TransparentRiskScore,
} from "./types";
const AnalyticsView = lazy(() =>
  import("./components/AnalyticsView").then((m) => ({
    default: m.AnalyticsView,
  })),
);
const LiveMap = lazy(() =>
  import("./components/LiveMap").then((m) => ({ default: m.LiveMap })),
);
const EventReplay = lazy(() =>
  import("./components/EventReplayView").then((m) => ({
    default: m.EventReplayView,
  })),
);
type Tab = "dashboard" | "map" | "alerts" | "analytics" | "about" | "replay";
const positions = [
  { xPercent: 34, yPercent: 44 },
  { xPercent: 48, yPercent: 52 },
  { xPercent: 78, yPercent: 32 },
  { xPercent: 62, yPercent: 60 },
  { xPercent: 88, yPercent: 78 },
];
const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-xs";
const button =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed";
const dateText = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }) + " IST";

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>("dashboard");
  const { data, loading, error, refresh, age } = useLiveCatchment();
  const [selectedVillage, setSelectedVillage] = useState(
    DEFAULT_CATCHMENT_CONFIG.villages[0].id,
  );
  const [scoreId, setScoreId] = useState<string | null>(null);
  const [inspectMetric, setInspectMetric] =
    useState<MetricInspectionData | null>(null);
  const [capVillage, setCapVillage] = useState<VillageData | null>(null);
  const [mapMode, setMapMode] = useState<"schematic" | "geographic">(
    "schematic",
  );
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const cached = !!data && (data.isCached || age >= 15);
  const status =
    loading && !data
      ? "loading"
      : !data
        ? "error"
        : cached
          ? "cached"
          : "success";
  const overall = data?.riskScore.riskLevel ?? "LOW";
  const villages = data?.villages ?? [];
  const mapVillages = villages.map((v, i) => ({
    ...v,
    coordinates: positions[i] ?? { xPercent: 50, yPercent: 50 },
  }));
  const score: TransparentRiskScore | undefined =
    scoreId === "catchment"
      ? data?.riskScore
      : scoreId
        ? data?.villageScores[scoreId]
        : undefined;
  const flagged = villages.filter(
    (v) => v.riskLevel === "HIGH" || v.riskLevel === "SEVERE",
  );
  const filtered = villages.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );
  const gate = !data && !["about", "replay"].includes(currentTab);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!scoreId && !inspectMetric && !capVillage) return;
    const opener = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setScoreId(null);
        setInspectMetric(null);
        setCapVillage(null);
      }
      if (e.key === "Tab") {
        const items = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button,[role="dialog"] a,[role="dialog"] input',
          ),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (first && e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (first && !e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const timer = setTimeout(
      () =>
        document.querySelector<HTMLElement>('[role="dialog"] button')?.focus(),
      50,
    );
    document.addEventListener("keydown", key);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", key);
      opener?.focus();
    };
  }, [scoreId, inspectMetric, capVillage]);
  function exportSnapshot() {
    if (!data) return;
    const payload = {
      product: "HydroGuard",
      version: "2.1",
      status: "Research prototype; not an official alert",
      exportedAt: new Date().toISOString(),
      fetchedAt: data.fetchedAtIso,
      validAt: data.validAtIso,
      cached,
      scoringMethod: data.riskScore.methodologyNote,
      villages: data.villages.map((v) => ({
        ...v,
        factors: data.villageScores[v.id]?.factors,
      })),
      sources: data.metrics,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `hydroguard-live-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Live snapshot downloaded");
  }
  function villageTable() {
    return (
      <section id="villages" className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Village Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Current per-village scores, explanations and exercise exports.
            </p>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              className="text-xs outline-none w-40 max-w-full"
              aria-label="Search villages"
              placeholder="Search villages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {[
                  "Village",
                  "Coordinates",
                  "Risk score",
                  "Tier",
                  "Actions",
                ].map((t) => (
                  <th key={t} className="p-3 whitespace-nowrap">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-slate-100 hover:bg-slate-50/70"
                >
                  <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                    {v.name}
                  </td>
                  <td className="p-3 font-mono whitespace-nowrap text-slate-500">
                    {v.lat.toFixed(4)}, {v.lon.toFixed(4)}
                  </td>
                  <td className="p-3 font-mono font-bold">{v.riskScore}/100</td>
                  <td className="p-3">
                    <span
                      className={`tier-label tier-${v.riskLevel.toLowerCase()}`}
                    >
                      {v.riskLevel}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className={button}
                        onClick={() => setScoreId(v.id)}
                        aria-label={`Explain ${v.name} score`}
                      >
                        Why this score?
                      </button>
                      <button
                        className={button}
                        onClick={() => setCapVillage(v)}
                        aria-label={`Export CAP for ${v.name}`}
                      >
                        CAP XML
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="py-8 text-center text-sm text-slate-500">
              No villages match your search.
            </p>
          )}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Model scores do not establish safe evacuation routes, shelter
          availability or flood arrival times. CAP files are exercise-only;
          nothing is dispatched.
        </p>
      </section>
    );
  }
  function mapSection() {
    return (
      <section id="map-section" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase text-slate-800 flex items-center gap-2">
            <MapPin size={16} />
            Catchment view
          </h2>
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {(["schematic", "geographic"] as const).map((mode) => (
              <button
                key={mode}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${mapMode === mode ? "bg-slate-900 text-white" : "text-slate-600"}`}
                onClick={() => setMapMode(mode)}
              >
                {mode === "schematic" ? "Original schematic" : "Geographic map"}
              </button>
            ))}
          </div>
        </div>
        {mapMode === "schematic" ? (
          <RiskMap
            villages={mapVillages}
            overallRisk={overall}
            onSelectVillage={(v) => setSelectedVillage(v.id)}
            onViewRoute={(v) => setScoreId(v.id)}
          />
        ) : (
          <div className={panel}>
            <Suspense
              fallback={
                <p className="p-8 text-sm text-slate-500">
                  Loading geographic map…
                </p>
              }
            >
              <LiveMap
                villages={villages}
                selected={selectedVillage}
                onSelect={setSelectedVillage}
              />
            </Suspense>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="text-xs text-slate-600">
                Village{" "}
                <select
                  className="ml-2 border border-slate-200 rounded p-2"
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={button}
                onClick={() => setScoreId(selectedVillage)}
              >
                Explain selected village
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }
  function sourceHealth() {
    return (
      <section id="source-health" className={panel}>
        <div className="flex items-center gap-2 mb-4">
          <Database size={17} />
          <h2 className="text-sm font-bold uppercase">Live source health</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              name: "Weather model",
              available: !!data,
              note: "Hourly rainfall and topsoil moisture",
            },
            {
              name: "River discharge",
              available: !!data && !data.metrics.riverLevel.unavailable,
              note: "Daily GloFAS hydrological model",
            },
            {
              name: "Field sensors",
              available: false,
              note: "Not connected; no fabricated readings",
            },
          ].map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <span>{s.name}</span>
                <span
                  className={
                    s.available ? "text-emerald-700" : "text-slate-500"
                  }
                >
                  {s.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{s.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {data
            ? `Retrieved ${dateText(data.fetchedAtIso)}. Hourly model valid time: ${dateText(data.validAtIso)}.`
            : "Awaiting a valid response."}{" "}
          Cached responses are labelled and expire after six hours.
        </p>
      </section>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <a href="#main-content" className="skip-link">
        Skip to dashboard
      </a>
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        overallRisk={overall}
        riskUnknown={!data}
        activeAlertsCount={flagged.length}
        appMode="LIVE"
        onModeToggle={() => {}}
        liveDataStatus={status}
        onOpenConfigModal={() => setCurrentTab("about")}
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <MapPin size={14} />
              Chamoli · Rishi Ganga
            </span>
            <span
              className={`rounded-md border px-2 py-1 font-semibold ${cached ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
              role="status"
            >
              {data
                ? cached
                  ? `Cached model data · ${age}m old`
                  : "Live model data"
                : loading
                  ? "Connecting to live sources"
                  : "No live data"}
            </span>
            <span className="text-slate-500">
              5 villages · refresh every 10 min
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className={button}
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing" : "Refresh live data"}
            </button>
            <button
              className={
                button +
                " bg-slate-900! text-white! border-slate-900! hover:bg-slate-800!"
              }
              disabled={!data}
              onClick={exportSnapshot}
            >
              <ArrowDownToLine size={14} />
              Export snapshot
            </button>
          </div>
        </div>
      </div>
      <main
        id="main-content"
        className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6"
      >
        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {currentTab === "dashboard"
                ? "Flash Flood Decision Support System"
                : {
                    map: "Catchment Risk Map",
                    alerts: "Computed Alerts & Village Intelligence",
                    analytics: "Hydrological Risk Analytics",
                    about: "System Architecture & Data Methodology",
                    replay: "Historical Event Replay",
                  }[currentTab]}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Live model feeds, explainable risk scoring, and transparent data
              quality.
            </p>
          </div>
          {data && (
            <div className="text-xs text-slate-500 leading-6">
              <p className="flex items-center gap-1.5">
                <Clock size={13} />
                Retrieved: {dateText(data.fetchedAtIso)}
              </p>
              <p>Model valid: {dateText(data.validAtIso)}</p>
            </div>
          )}
        </div>
        {gate ? (
          <section
            className={panel + " text-center py-12!"}
            role={loading ? "status" : "alert"}
          >
            {loading ? (
              <RefreshCw className="h-8 w-8 mx-auto text-slate-400 animate-spin" />
            ) : (
              <WifiOff className="h-8 w-8 mx-auto text-slate-400" />
            )}
            <h2 className="mt-4 font-bold text-lg">
              {loading
                ? "Loading live data"
                : "Live data isn’t available right now"}
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              {loading
                ? "Fetching validated weather and river model data for each village."
                : error}{" "}
              No demo values or synthetic risk scores are shown.
            </p>
            <button
              className={button + " mt-5"}
              onClick={() => void refresh()}
              disabled={loading}
            >
              Retry connection
            </button>
          </section>
        ) : (
          <>
            {currentTab === "dashboard" && data && (
              <>
                <nav
                  aria-label="Dashboard quick jumps"
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs"
                >
                  <Compass size={15} className="text-slate-500" />
                  <strong className="mr-2">Jump to:</strong>
                  {[
                    ["#citizen-guide", "Citizen Action Guide"],
                    ["#telemetry", "Live Telemetry"],
                    ["#map-section", "Risk Map"],
                    ["#trend-section", "Risk Trend"],
                    ["#villages", "Village Intelligence"],
                    ["#source-health", "Source Health"],
                  ].map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
                <MainRiskCard
                  overallRisk={overall}
                  riskScore={data.riskScore.totalScore}
                  villages={villages}
                  leadTime={`${age} min`}
                  lastUpdated={dateText(data.fetchedAtIso)}
                  headline={data.headline}
                  description={data.description}
                  catchmentName="Chamoli · Rishi Ganga"
                  onViewEmergencyDetails={() =>
                    document
                      .getElementById("villages")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  transparentScore={data.riskScore}
                  onOpenWhyScore={() => setScoreId("catchment")}
                  onInspectMetric={setInspectMetric}
                />
                <section
                  id="citizen-guide"
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
                >
                  <h2 className="flex gap-2 items-center text-sm font-bold uppercase text-emerald-900">
                    <ShieldCheck size={18} />
                    Citizen Action Guide
                  </h2>
                  <p className="text-sm text-emerald-900 mt-3">
                    Use the indicators to stay informed and follow official
                    district advisories. A low score does not establish that an
                    area is safe.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 mt-4 text-xs text-emerald-900">
                    <div className="bg-white/70 rounded-lg p-3">
                      <strong>Check the source</strong>
                      <p className="mt-1 text-emerald-800">
                        These are weather and river models, not physical sensor
                        readings.
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3">
                      <strong>Check freshness</strong>
                      <p className="mt-1 text-emerald-800">
                        Read the retrieval and model timestamps before
                        interpreting a score.
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3">
                      <strong>Use verified guidance</strong>
                      <p className="mt-1 text-emerald-800">
                        Shelter availability and safe routes require
                        confirmation from local authorities.
                      </p>
                    </div>
                  </div>
                </section>
                <section id="telemetry">
                  <MultiSourceCards
                    {...data.metrics}
                    isLive
                    onInspectMetric={setInspectMetric}
                  />
                </section>
                {mapSection()}
                <section id="trend-section">
                  <RiskTrendChart
                    trendHistory={data.trendHistory}
                    overallRisk={overall}
                  />
                </section>
                {villageTable()}
                {sourceHealth()}
              </>
            )}
            {currentTab === "map" && data && (
              <>
                {mapSection()}
                {villageTable()}
              </>
            )}
            {currentTab === "alerts" && data && (
              <>
                <section className={panel}>
                  <h2 className="flex gap-2 items-center font-bold text-sm">
                    <Radio size={17} />
                    Computed alerts · not dispatched
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    {flagged.length} villages currently have high or severe
                    model scores. These are not official warnings.
                  </p>
                  {data.alerts.length ? (
                    data.alerts.map((a) => (
                      <div
                        key={a.id}
                        className="mt-3 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <strong className="text-sm">{a.area}</strong>
                          <p className="text-xs text-slate-500 mt-1">
                            {a.title} · {a.time}
                          </p>
                        </div>
                        <span
                          className={`tier-label tier-${a.level.toLowerCase()}`}
                        >
                          {a.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="mt-4 text-sm text-slate-600">
                      No village is currently above the medium tier.
                    </p>
                  )}
                </section>
                {villageTable()}
                {sourceHealth()}
              </>
            )}
            {currentTab === "analytics" && data && (
              <>
                <Suspense
                  fallback={
                    <p className="text-sm text-slate-500">Loading analytics…</p>
                  }
                >
                  <AnalyticsView
                    isLive
                    trendHistory={data.trendHistory}
                    overallRisk={overall}
                    villages={villages}
                    alertsCount={flagged.length}
                    transparentScore={data.riskScore}
                    onInspectMetric={setInspectMetric}
                    onOpenWhyScore={() => setScoreId("catchment")}
                  />
                </Suspense>
                {sourceHealth()}
              </>
            )}
            {currentTab === "replay" && (
              <Suspense
                fallback={
                  <p className="text-sm text-slate-500">
                    Loading archive explorer…
                  </p>
                }
              >
                <EventReplay />
              </Suspense>
            )}
            {currentTab === "about" && (
              <>
                <section className={panel}>
                  <h2 className="text-sm font-bold uppercase">
                    Live data pipeline
                  </h2>
                  <div className="grid gap-3 md:grid-cols-4 mt-4">
                    {[
                      [
                        "01",
                        "Collect",
                        "Open-Meteo hourly weather and daily GloFAS discharge.",
                      ],
                      [
                        "02",
                        "Validate",
                        "Require consecutive rainfall history and a current soil reading.",
                      ],
                      [
                        "03",
                        "Explain",
                        "Score each village and display each factor’s contribution.",
                      ],
                      [
                        "04",
                        "Review",
                        "Inspect sources, export a snapshot, or compare historical reanalysis.",
                      ],
                    ].map(([n, title, copy]) => (
                      <div
                        key={n}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <span className="font-mono text-emerald-700 text-xs">
                          {n}
                        </span>
                        <h3 className="font-bold text-sm mt-2">{title}</h3>
                        <p className="text-xs text-slate-600 leading-6 mt-2">
                          {copy}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className={panel}>
                  <h2 className="font-bold text-sm uppercase">
                    Model methodology
                  </h2>
                  <p className="text-sm text-slate-600 leading-7 mt-3">
                    The rule-based index is uncalibrated and is not a flood
                    probability. Weights: rainfall 35%, 72-hour rainfall 20%,
                    soil moisture 25%, discharge 20%. Missing discharge is
                    excluded and the other weights become 44%, 25%, 31%. Only
                    the 24-hour rainfall cut-offs follow IMD categories; all
                    other thresholds are heuristics.
                  </p>
                  <p className="text-sm text-slate-600 leading-7 mt-3">
                    Nearby villages can share a coarse model cell. Correlated
                    indicators do not provide independent confirmation.
                    Historical reanalysis is retrospective, so replay crossings
                    do not establish forecast lead time. No physical sensors or
                    external alert channels are connected.
                  </p>
                </section>
                {sourceHealth()}
                <section className={panel}>
                  <h2 className="text-sm font-bold uppercase">
                    Monitored coordinates
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {DEFAULT_CATCHMENT_CONFIG.villages.map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3 text-xs"
                      >
                        <strong>{v.name}</strong>
                        <span className="font-mono text-slate-500">
                          {v.lat}, {v.lon}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Coordinates are configured points. The original schematic is
                    illustrative; the geographic view uses these actual
                    coordinates.
                  </p>
                </section>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
      {score && (
        <WhyThisScoreModal
          scoreData={score}
          isOpen
          onClose={() => setScoreId(null)}
        />
      )}
      <MetricSourceModal
        data={inspectMetric}
        onClose={() => setInspectMetric(null)}
      />
      {capVillage && data && (
        <CapAlertModal
          village={capVillage}
          overallRisk={overall}
          isOpen
          onClose={() => setCapVillage(null)}
        />
      )}{" "}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
