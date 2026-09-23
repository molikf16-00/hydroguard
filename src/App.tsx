import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CloudRain,
  Database,
  Droplets,
  ExternalLink,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Signal,
  Waves,
  WifiOff,
  X,
} from "lucide-react";
import { useLiveCatchment } from "./hooks/useLiveCatchment";
import { LiveMap, tierColors } from "./components/LiveMap";
import { LiveTrend } from "./components/LiveTrend";
import { DEFAULT_CATCHMENT_CONFIG } from "./config/catchmentConfig";
import type { SourceMetric, TransparentRiskScore } from "./types";
const EventReplay = lazy(() =>
  import("./components/EventReplayView").then((m) => ({
    default: m.EventReplayView,
  })),
);
type Tab = "overview" | "villages" | "sources" | "replay" | "method";
const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "villages", label: "Village monitor", icon: MapPin },
  { id: "sources", label: "Data sources", icon: Database },
  { id: "replay", label: "Historical replay", icon: History },
  { id: "method", label: "Methodology", icon: Layers },
] as const;
const shortName = (name: string) => name.split(" (")[0];
const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }) + " IST"
    : "Awaiting data";

function MetricCard({
  metric,
  label,
  icon: Icon,
}: {
  metric?: SourceMetric;
  label: string;
  icon: typeof CloudRain;
}) {
  return (
    <article className="metric-card">
      <div className="metric-heading">
        <span>{label}</span>
        <Icon size={17} />
      </div>
      <div className="metric-value">
        {!metric || metric.unavailable ? "—" : metric.value}
        <small>
          {metric && !metric.unavailable ? metric.unit : "Awaiting source"}
        </small>
      </div>
      <div className="metric-bottom">
        <span
          className={`status-dot ${metric && !metric.unavailable ? "ready" : ""}`}
        />
        {metric?.unavailable
          ? "Source unavailable"
          : metric
            ? metric.status
            : "No measurement"}
      </div>
    </article>
  );
}
function ScoreBreakdown({ score }: { score?: TransparentRiskScore }) {
  return (
    <div className="factor-list">
      {score ? (
        score.factors.map((f) => (
          <div className="factor" key={f.id}>
            <div>
              <span>{f.name.split(" (")[0]}</span>
              <strong>
                {f.unavailable
                  ? "Unavailable"
                  : `${f.contributionPoints} / ${f.maxPoints}`}
              </strong>
            </div>
            <div className="factor-track">
              <span
                style={{
                  width: `${f.maxPoints ? (f.contributionPoints / f.maxPoints) * 100 : 0}%`,
                }}
              />
            </div>
            <small>{f.rawValue}</small>
          </div>
        ))
      ) : (
        <div className="quiet-empty">
          Factors appear when the required inputs are complete.
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { data, loading, error, refresh, age } = useLiveCatchment();
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState(
    DEFAULT_CATCHMENT_CONFIG.villages[0].id,
  );
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [scoreOpen, setScoreOpen] = useState(false);
  const [readOnlyReport, setReadOnlyReport] = useState(false);
  useEffect(() => {
    if (!scoreOpen && !readOnlyReport) return;
    const opener = document.activeElement as HTMLElement | null;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".dialog button, .dialog a, .dialog input, .dialog select",
        ),
      );
      const first = elements[0],
        last = elements[elements.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      opener?.focus();
    };
  }, [scoreOpen, readOnlyReport]);
  const villages = data?.villages ?? [];
  const village = villages.find((v) => v.id === selected);
  const configVillage = DEFAULT_CATCHMENT_CONFIG.villages.find(
    (v) => v.id === selected,
  )!;
  const score = data?.riskScore;
  const watchCount = villages.filter(
    (v) => v.riskLevel === "HIGH" || v.riskLevel === "SEVERE",
  ).length;
  const selectedScore = data?.villageScores[selected];
  const filtered = villages.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedTitle = NAV.find((n) => n.id === tab)?.label ?? "Overview";
  const sourceMetrics = data
    ? [
        data.metrics.rainfall,
        data.metrics.soilMoisture,
        data.metrics.riverLevel,
      ]
    : [];
  const sourcesReady = sourceMetrics.filter((m) => !m.unavailable).length;
  const signalLabel = data
    ? data.isCached || age >= 15
      ? `Cached · ${age}m old`
      : "Live model data"
    : loading
      ? "Connecting to sources"
      : "Sources unavailable";
  const selectedTier = village?.riskLevel;
  const setView = (id: Tab) => {
    setTab(id);
    setMobileNav(false);
  };
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setScoreOpen(false);
        setReadOnlyReport(false);
        setMobileNav(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  function exportSnapshot() {
    if (!data) return;
    const report = {
      product: "HydroGuard",
      type: "Uncalibrated model-data snapshot; not an official warning",
      exportedAt: new Date().toISOString(),
      fetchedAt: data.fetchedAtIso,
      modelValidAt: data.validAtIso,
      cached: data.isCached || age >= 15,
      scoringVersion: "2.0",
      villages: villages.map((v) => ({
        id: v.id,
        name: v.name,
        lat: v.lat,
        lon: v.lon,
        score: v.riskScore,
        tier: v.riskLevel,
        factors: data.villageScores[v.id]?.factors,
      })),
      sources: sourceMetrics.map((m) => ({
        name: m.sourceName,
        value: m.value,
        unit: m.unit,
        unavailable: !!m.unavailable,
      })),
      limitations:
        "No verified shelter or route information. No field sensors. Scores are not probabilities.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `hydroguard-live-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Live snapshot downloaded");
  }
  const riskCopy = useMemo(() => {
    if (!score)
      return {
        title: "Listening to the catchment.",
        text: "Connecting to live weather and river models. Risk is shown only when the required data is complete.",
      };
    return {
      title: {
        LOW: "A quieter catchment. Stay informed.",
        MEDIUM: "Changing conditions. Stay aware.",
        HIGH: "Elevated indicators. Watch closely.",
        SEVERE: "High modelled risk. Stay informed.",
      }[score.riskLevel],
      text: `The highest current score is in ${shortName(data!.drivingVillageName)}. ${watchCount ? `${watchCount} villages are at high or severe modelled risk.` : "No monitored village is above the medium tier."}`,
    };
  }, [score, data, watchCount]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to dashboard
      </a>
      {mobileNav && (
        <button
          aria-label="Close navigation"
          className="nav-overlay"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("overview");
          }}
          className="brand"
        >
          <span className="brand-icon">
            <Waves size={25} />
          </span>
          <span>
            Hydro<span className="brand-light">Guard</span>
            <small>CATCHMENT INTELLIGENCE</small>
          </span>
        </a>
        <div className="workspace-label">
          WORKSPACE <span>01</span>
        </div>
        <div className="catchment-switch">
          <span className="catchment-avatar">
            <MountainMark />
          </span>
          <div>
            Rishi Ganga<small>Uttarakhand, India</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">MONITOR</div>
        <nav aria-label="Main navigation">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${tab === id ? "active" : ""}`}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setView(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "overview" && <span className="nav-live" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="source-mini">
            <span className={`status-dot ${data ? "ready" : ""}`} />
            <span>
              {data ? "Live sources connected" : "Live sources pending"}
              <small>Open-Meteo · Copernicus</small>
            </span>
          </div>
          <div className="prototype-box">
            <ShieldCheck size={18} />
            <strong>Built for informed decisions</strong>
            <p>Research prototype. Follow official local advisories.</p>
            <button onClick={() => setView("method")}>
              Understand the model <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="sidebar-foot">
            <span className="version">HG / 2.0</span>
            <span>Live data only</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{selectedTitle}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-pill">
              <span className={`status-dot ${data ? "ready" : ""}`} />
              LIVE FEEDS
            </span>
            <button
              className="icon-button"
              title="Methodology"
              aria-label="Read methodology"
              onClick={() => setView("method")}
            >
              <CircleHelp size={18} />
            </button>
            <div className="profile-mark">HG</div>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                HIMALAYAN CATCHMENT NETWORK <span>/</span> RISHI GANGA
              </div>
              <h1>
                {tab === "overview" ? "Catchment overview" : selectedTitle}
              </h1>
              <p>
                {tab === "overview"
                  ? "A clearer view of changing conditions. Every signal, in context."
                  : tab === "villages"
                    ? "Local model scores, grounded in configured village coordinates."
                    : tab === "sources"
                      ? "Know where each value comes from—and what it can tell you."
                      : tab === "replay"
                        ? "Explore historical reanalysis. This is separate from current live conditions."
                        : "Transparent rules. Visible assumptions. Measurable limitations."}
              </p>
            </div>
            <div className="page-actions">
              <button
                className="button secondary"
                disabled={loading}
                onClick={() => void refresh()}
              >
                <RefreshCw size={15} className={loading ? "spin" : ""} />
                {loading ? "Refreshing" : "Refresh"}
              </button>
              <button
                className="button primary"
                disabled={!data}
                onClick={exportSnapshot}
              >
                <ArrowDownToLine size={15} />
                Export snapshot
              </button>
            </div>
          </div>
          <div
            className={`connection-bar ${error ? "connection-error" : ""}`}
            role="status"
          >
            <span className="connection-left">
              {error ? <WifiOff size={14} /> : <Radio size={14} />}
              <strong>{signalLabel}</strong>
              <span className="divider" />
              <span>
                {data
                  ? `Retrieved ${formatTime(data.fetchedAtIso)}`
                  : "No synthetic values or demo fallback"}
              </span>
            </span>
            <span>
              {data
                ? `Valid hour ${formatTime(data.validAtIso)}`
                : "Refreshes every 10 minutes"}
            </span>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <div>
                <strong>Live data isn’t available right now.</strong>
                <p>{error} No risk score is being inferred.</p>
              </div>
              <button
                className="button secondary"
                onClick={() => void refresh()}
                disabled={loading}
              >
                Retry connection
              </button>
            </div>
          )}
          {tab === "overview" && (
            <>
              <section
                className={`risk-hero ${score?.riskLevel.toLowerCase() ?? "pending"}`}
              >
                <div className="hero-landscape" aria-hidden="true">
                  <svg viewBox="0 0 550 250">
                    <path d="M0 210 75 100 120 140 205 20 295 120 330 75 430 160 500 80 550 150V250H0Z" />
                    <path d="M0 240 90 180 155 200 235 110 300 165 385 105 460 190 550 165V250H0Z" />
                    <path d="M0 250 85 218 155 235 255 190 315 225 390 185 470 230 550 205V250Z" />
                  </svg>
                </div>
                <div className="hero-content">
                  <div className="hero-eyebrow">
                    <span className="status-dot ready" /> CATCHMENT STATUS{" "}
                    <span className="hero-tier">
                      {score ? `${score.riskLevel} TIER` : "AWAITING DATA"}
                    </span>
                  </div>
                  <h2>{riskCopy.title}</h2>
                  <p>{riskCopy.text}</p>
                  <button
                    className="hero-link"
                    disabled={!data}
                    onClick={() => setScoreOpen(true)}
                  >
                    Understand this score <ArrowRight size={15} />
                  </button>
                </div>
                <div className="hero-score">
                  <div
                    className="score-ring"
                    style={
                      {
                        "--score": `${(score?.totalScore ?? 0) * 3.6}deg`,
                      } as React.CSSProperties
                    }
                  >
                    <div>
                      <strong>{score?.totalScore ?? "—"}</strong>
                      <span>OUT OF 100</span>
                    </div>
                  </div>
                  <span>Uncalibrated risk index</span>
                </div>
              </section>
              <div className="metrics-grid">
                <MetricCard
                  label="Rainfall · rolling 24h"
                  metric={data?.metrics.rainfall}
                  icon={CloudRain}
                />
                <MetricCard
                  label="Topsoil moisture"
                  metric={data?.metrics.soilMoisture}
                  icon={Leaf}
                />
                <MetricCard
                  label="River discharge · daily"
                  metric={data?.metrics.riverLevel}
                  icon={Waves}
                />
                <article className="metric-card">
                  <div className="metric-heading">
                    <span>Villages at high / severe</span>
                    <MapPin size={17} />
                  </div>
                  <div className="metric-value">
                    {data ? watchCount : "—"}
                    <small>
                      of {DEFAULT_CATCHMENT_CONFIG.villages.length} monitored
                    </small>
                  </div>
                  <div className="metric-bottom">
                    <span className="status-dot" />
                    Model scores, not official alerts
                  </div>
                </article>
              </div>
              <div className="main-grid">
                <section className="panel map-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Catchment geography</h3>
                      <p>Village locations & current risk tiers</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setView("villages")}
                    >
                      View all <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <LiveMap
                    villages={villages}
                    selected={selected}
                    onSelect={setSelected}
                  />
                  <div className="map-legend">
                    {Object.entries(tierColors).map(([tier, color]) => (
                      <span key={tier}>
                        <i style={{ background: color }} />
                        {tier.charAt(0) + tier.slice(1).toLowerCase()}
                      </span>
                    ))}
                    <span>
                      <i style={{ background: "#778b90" }} />
                      Unavailable
                    </span>
                  </div>
                </section>
                <section className="panel village-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Village spotlight</h3>
                      <p>Select a marker to explore</p>
                    </div>
                    <MapPin size={18} />
                  </div>
                  <label className="sr-only" htmlFor="village-select">
                    Select village
                  </label>
                  <select
                    id="village-select"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    {DEFAULT_CATCHMENT_CONFIG.villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <div className="village-title">
                    <h2>{shortName(configVillage.name)}</h2>
                    <span
                      className="tier-badge"
                      style={{
                        color: selectedTier
                          ? tierColors[selectedTier]
                          : "#6c7e78",
                      }}
                    >
                      {selectedTier ?? "NO DATA"}
                    </span>
                  </div>
                  <div className="coordinate">
                    {configVillage.lat.toFixed(4)}° N &nbsp;{" "}
                    {configVillage.lon.toFixed(4)}° E
                  </div>
                  <div className="village-score">
                    <strong>{village?.riskScore ?? "—"}</strong>
                    <span>
                      /100<small>Local model risk index</small>
                    </span>
                    <Activity size={26} />
                  </div>
                  <ScoreBreakdown score={selectedScore} />
                  <div className="village-note">
                    <ShieldCheck size={16} />
                    <span>
                      Shelters and routes require local verification. Follow
                      official district advisories.
                    </span>
                  </div>
                </section>
              </div>
              <div className="bottom-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>How conditions are changing</h3>
                      <p>
                        {data
                          ? shortName(data.drivingVillageName)
                          : "Highest-scoring village"}{" "}
                        · previous 24 hours
                      </p>
                    </div>
                    <span className="small-tag">MODEL HISTORY</span>
                  </div>
                  <LiveTrend points={data?.trendHistory ?? []} />
                </section>
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Source health</h3>
                      <p>Visibility before certainty</p>
                    </div>
                    <span className="source-count">
                      {sourcesReady}
                      <small>/3</small>
                    </span>
                  </div>
                  {[
                    {
                      title: "Weather model",
                      sub: "Rainfall & topsoil · hourly",
                      ok: !!data,
                    },
                    {
                      title: "GloFAS river model",
                      sub: "River discharge · daily",
                      ok: !!data && !data.metrics.riverLevel.unavailable,
                    },
                    {
                      title: "Field observations",
                      sub: "No physical sensors connected",
                      ok: false,
                    },
                  ].map((s) => (
                    <div className="source-row" key={s.title}>
                      <div className={`source-icon ${s.ok ? "connected" : ""}`}>
                        {s.ok ? <Check size={15} /> : <Signal size={15} />}
                      </div>
                      <div>
                        <strong>{s.title}</strong>
                        <small>{s.sub}</small>
                      </div>
                      <span>{s.ok ? "Available" : "Unavailable"}</span>
                    </div>
                  ))}
                  <button
                    className="text-button source-details"
                    onClick={() => setView("sources")}
                  >
                    Explore data provenance <ArrowRight size={14} />
                  </button>
                </section>
              </div>
            </>
          )}
          {tab === "villages" && (
            <div className="panel village-monitor">
              <div className="panel-heading">
                <div>
                  <h3>Monitored villages</h3>
                  <p>
                    All values come from the latest successful model response.
                  </p>
                </div>
                <label className="search">
                  <Search size={16} />
                  <input
                    aria-label="Search villages"
                    placeholder="Search villages…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Village</th>
                      <th>Coordinates</th>
                      <th>Risk index</th>
                      <th>Tier</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.name}</strong>
                        </td>
                        <td className="mono">
                          {v.lat?.toFixed(4)}, {v.lon?.toFixed(4)}
                        </td>
                        <td>
                          <strong>{v.riskScore}</strong> / 100
                        </td>
                        <td>
                          <span
                            className="tier-badge"
                            style={{ color: tierColors[v.riskLevel] }}
                          >
                            {v.riskLevel}
                          </span>
                        </td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => {
                              setSelected(v.id);
                              setView("overview");
                            }}
                          >
                            Inspect <ArrowUpRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <div className="quiet-empty">
                    {data
                      ? "No villages match your search."
                      : "Village scores are unavailable until live data is received."}
                  </div>
                )}
              </div>
              <LiveMap
                villages={villages}
                selected={selected}
                onSelect={(id) => {
                  setSelected(id);
                  setView("overview");
                }}
              />
            </div>
          )}
          {tab === "sources" && (
            <div className="sources-page">
              {["rainfall", "soilMoisture", "riverLevel"].map((key) => {
                const m = data?.metrics[key as "rainfall"];
                return (
                  <article className="panel provenance" key={key}>
                    <div className="panel-heading">
                      <h3>
                        {key === "rainfall"
                          ? "Rainfall"
                          : key === "soilMoisture"
                            ? "Topsoil moisture"
                            : "River discharge"}
                      </h3>
                      <span className="small-tag">
                        {m && !m.unavailable ? "MODEL DATA" : "UNAVAILABLE"}
                      </span>
                    </div>
                    <h2>
                      {m && !m.unavailable
                        ? `${m.value} ${m.unit}`
                        : "No current value"}
                    </h2>
                    <dl>
                      <dt>Provider</dt>
                      <dd>
                        {m?.sourceName ??
                          (key === "riverLevel"
                            ? "Copernicus GloFAS via Open-Meteo"
                            : "Open-Meteo forecast API")}
                      </dd>
                      <dt>Method</dt>
                      <dd>
                        {m?.sourceMethod ?? "Waiting for a valid response."}
                      </dd>
                      <dt>Data context</dt>
                      <dd>
                        {m?.details ??
                          "Missing readings are never substituted with zero."}
                      </dd>
                      <dt>Retrieved</dt>
                      <dd>{formatTime(data?.fetchedAtIso)}</dd>
                    </dl>
                    <a
                      href={
                        key === "riverLevel"
                          ? "https://open-meteo.com/en/docs/flood-api"
                          : "https://open-meteo.com/en/docs"
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Provider documentation <ExternalLink size={14} />
                    </a>
                  </article>
                );
              })}
              <div className="panel provenance">
                <h3>Freshness is part of the signal</h3>
                <p>
                  Rainfall and soil readings must cover the current UTC hour,
                  with a complete 72-hour rainfall window. River discharge is a
                  daily model value. A recent real response can be used for up
                  to six hours during an outage and is labelled cached. It is
                  never replaced with synthetic data.
                </p>
                <p>
                  Nearby villages may share a model grid cell. Their scores
                  should not be interpreted as independent sensor readings.
                </p>
              </div>
            </div>
          )}
          {tab === "replay" && (
            <Suspense
              fallback={
                <div className="quiet-empty">Loading archive explorer…</div>
              }
            >
              <EventReplay />
            </Suspense>
          )}
          {tab === "method" && (
            <div className="method-grid">
              <section className="panel prose">
                <span className="eyebrow">MODEL CARD / VERSION 2.0</span>
                <h2>Every score should be explainable.</h2>
                <p>
                  HydroGuard combines modelled rainfall, antecedent wetness,
                  topsoil moisture and river discharge into a 0–100
                  decision-support index. The score is{" "}
                  <strong>not a flood probability</strong> and is not calibrated
                  for operational warnings.
                </p>
                <div className="method-weights">
                  {[
                    ["Rainfall", "35%"],
                    ["72h rainfall", "20%"],
                    ["Topsoil", "25%"],
                    ["Discharge", "20%"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <h3>What the model does</h3>
                <ul>
                  <li>
                    Uses the strongest of 1-hour, 3-hour and 24-hour rainfall
                    indicators.
                  </li>
                  <li>
                    Requires complete rainfall history and a current soil
                    reading.
                  </li>
                  <li>
                    Excludes unavailable river discharge and adjusts weights to
                    44 / 25 / 31.
                  </li>
                  <li>
                    Computes a separate score at each configured village
                    coordinate.
                  </li>
                </ul>
                <h3>What it cannot establish</h3>
                <ul>
                  <li>
                    Flood extent, safe evacuation routes, or verified shelters.
                  </li>
                  <li>
                    Warning lead time or the arrival time of an actual flood.
                  </li>
                  <li>Rock-and-ice avalanche or other cryospheric triggers.</li>
                  <li>
                    Independent confirmation: the indicators are correlated.
                  </li>
                </ul>
                <h3>Validation required</h3>
                <p>
                  Compare against dated gauge records and verified events,
                  include non-flood periods, and measure false alarms and missed
                  events on a separate evaluation set. Reanalysis replay
                  illustrates the rules; it does not prove forecast skill.
                </p>
              </section>
              <div>
                <section className="panel prose">
                  <h3>Risk tiers</h3>
                  {[
                    ["LOW", "0–29"],
                    ["MEDIUM", "30–59"],
                    ["HIGH", "60–79"],
                    ["SEVERE", "80–100"],
                  ].map(([tier, range]) => (
                    <div className="tier-row" key={tier}>
                      <span
                        className="tier-badge"
                        style={{
                          color: tierColors[tier as keyof typeof tierColors],
                        }}
                      >
                        {tier}
                      </span>
                      <strong>{range}</strong>
                    </div>
                  ))}
                  <p>
                    Only the 24-hour rainfall cut-offs follow IMD categories.
                    Other thresholds, weights and the assumed soil field
                    capacity are HydroGuard heuristics.
                  </p>
                </section>
                <section className="panel prose next-step">
                  <ShieldCheck size={25} />
                  <h3>Live inputs. Honest limits.</h3>
                  <p>
                    No demo mode, fabricated telemetry, simulated delivery
                    receipts or unverified evacuation instructions.
                  </p>
                  <a
                    href="https://github.com/molikf16-00/hydroguard"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View project repository <ArrowUpRight size={14} />
                  </a>
                </section>
              </div>
            </div>
          )}
          <footer className="footer">
            <span>
              <Waves size={15} /> HydroGuard{" "}
              <span className="footer-separator">/</span> Catchment intelligence
            </span>
            <span>
              Model data · Uncalibrated prototype · Not an official warning
            </span>
            <button onClick={() => setReadOnlyReport(true)}>
              About this workspace <ArrowUpRight size={12} />
            </button>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
      {(scoreOpen || readOnlyReport) && (
        <div
          className="dialog-backdrop"
          onClick={() => {
            setScoreOpen(false);
            setReadOnlyReport(false);
          }}
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              scoreOpen ? "Risk score explanation" : "About HydroGuard"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="dialog-close icon-button"
              aria-label="Close dialog"
              onClick={() => {
                setScoreOpen(false);
                setReadOnlyReport(false);
              }}
            >
              <X size={20} />
            </button>
            {scoreOpen ? (
              <>
                <span className="eyebrow">WHY THIS SCORE</span>
                <h2>
                  {score?.totalScore}/100 · {score?.riskLevel}
                </h2>
                <p>
                  {data?.drivingVillageName} has the highest score in the
                  monitored catchment.
                </p>
                <ScoreBreakdown score={score} />
                <p className="dialog-note">{score?.methodologyNote}</p>
              </>
            ) : (
              <>
                <span className="eyebrow">HYDROGUARD / 2.0</span>
                <h2>Clarity for changing conditions.</h2>
                <p>
                  A live-data decision-support workspace for the Rishi Ganga
                  catchment. Built using public weather and river model APIs.
                </p>
                <p>
                  The geographic map shows configured village coordinates. No
                  surveyed shelter, population or route information is presented
                  as operational data.
                </p>
                <p>
                  Weather and river data: Open-Meteo and Copernicus. Map:
                  OpenStreetMap contributors.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function MountainMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="m2 19 7-12 4 6 3-4 6 10Z" />
      <path d="m6 12 3 2 3-2" />
    </svg>
  );
}
