import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ShieldAlert,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Map,
  Radio,
  LineChart,
  Info,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Wifi,
  RadioTower,
  Cpu,
  History,
  Settings,
  Sparkles,
  RefreshCw,
  Globe,
} from "lucide-react";
import { RiskLevel, AppMode } from "../types";

interface NavbarProps {
  currentTab: "dashboard" | "map" | "alerts" | "analytics" | "about" | "replay";
  onTabChange: (
    tab: "dashboard" | "map" | "alerts" | "analytics" | "about" | "replay",
  ) => void;
  overallRisk: RiskLevel;
  /** True when Live mode has no data: the risk pill shows "No data" instead of a tier. */
  riskUnknown?: boolean;
  activeAlertsCount: number;
  appMode: AppMode;
  onModeToggle: (mode: AppMode) => void;
  liveDataStatus?: "loading" | "success" | "cached" | "error";
  onOpenConfigModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  overallRisk,
  riskUnknown = false,
  activeAlertsCount,
  appMode,
  onModeToggle,
  liveDataStatus = "success",
  onOpenConfigModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [timeState, setTimeState] = useState({
    utc: new Date().toISOString().substring(11, 19) + " UTC",
    ist:
      new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      }) + " IST",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeState({
        utc: now.toISOString().substring(11, 19) + " UTC",
        ist:
          now.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false,
          }) + " IST",
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskIndicator = () => {
    if (riskUnknown) {
      return {
        dot: "bg-slate-400",
        label: "No data",
        badge: "bg-slate-50 text-slate-600 border-slate-200",
        pulse: "bg-slate-300",
      };
    }
    switch (overallRisk) {
      case "SEVERE":
        return {
          dot: "bg-red-500",
          label: "Severe",
          badge: "bg-red-50 text-red-700 border-red-200",
          pulse: "bg-red-400",
        };
      case "HIGH":
        return {
          dot: "bg-orange-500",
          label: "High Watch",
          badge: "bg-orange-50 text-orange-700 border-orange-200",
          pulse: "bg-orange-400",
        };
      case "MEDIUM":
        return {
          dot: "bg-amber-500",
          label: "Advisory",
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          pulse: "bg-amber-400",
        };
      default:
        return {
          dot: "bg-emerald-500",
          label: "Nominal",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          pulse: "bg-emerald-400",
        };
    }
  };

  const riskStatus = getRiskIndicator();

  // Navigation Items
  const operationalGroup: Array<{
    id: "dashboard" | "map" | "alerts";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasBadge?: boolean;
  }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Risk Map", icon: Map },
    { id: "alerts", label: "Alerts", icon: Radio, hasBadge: true },
  ];

  const intelligenceGroup: Array<{
    id: "analytics" | "replay" | "about";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "analytics", label: "Analytics", icon: LineChart },
    { id: "replay", label: "Event Replay", icon: History },
    { id: "about", label: "Architecture", icon: Info },
  ];

  const getModeBadge = () => {
    if (appMode === "LIVE") {
      if (liveDataStatus === "loading") {
        return {
          text: "CONNECTING OPEN-METEO...",
          class: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          dot: "bg-cyan-400 animate-pulse",
        };
      }
      if (liveDataStatus === "error") {
        return {
          text: "LIVE: NO DATA",
          class: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          dot: "bg-slate-400",
        };
      }
      if (liveDataStatus === "cached") {
        return {
          text: "LIVE (CACHED)",
          class: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          dot: "bg-amber-400",
        };
      }
      return {
        text: "LIVE (OPEN-METEO MODEL DATA)",
        class: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        dot: "bg-emerald-400 animate-ping",
      };
    }
    return {
      text: "DEMO SIMULATOR",
      class: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      dot: "bg-purple-400",
    };
  };

  const modeBadge = getModeBadge();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      {/* Tactical Mission Telemetry Bar */}
      <div className="hidden lg:block border-b border-slate-800 bg-slate-950 text-slate-300 px-4 sm:px-6 lg:px-8 py-1 text-[11px] font-mono">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Mode Indicator Badge per GLOBAL RULES */}
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-bold tracking-wide border ${modeBadge.class}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${modeBadge.dot}`} />
              <span>{modeBadge.text}</span>
            </span>

            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <RadioTower className="h-3 w-3 text-slate-400" />
              <span>Catchment: Rishi Ganga (Chamoli)</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="h-3 w-3 text-slate-400" />
              <span>Rule-based decision support (uncalibrated)</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="h-3 w-3 text-slate-400" />
              <span>CAP 1.2 export: exercise only</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="h-3 w-3 text-emerald-400" />
              <span className="text-white font-semibold tabular-nums tracking-wide">
                {timeState.utc}
              </span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400 tabular-nums">
              IST {timeState.ist.replace(" IST", "")}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange("dashboard")}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 focus:outline-hidden cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Hydro<span className="text-slate-900 font-black">Guard</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Chamoli EWS
              </span>
            </div>
          </button>
        </div>

        {/* Minimalist Grouped Navigation Tabs */}
        <nav className="hidden md:flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/70 text-xs">
          {/* Group 1: Monitoring & Operations */}
          <div className="flex items-center gap-0.5">
            {operationalGroup.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 rounded-lg bg-slate-900 shadow-xs"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {item.hasBadge && activeAlertsCount > 0 && (
                    <span className="relative z-10 ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white leading-none">
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Group Separator */}
          <div className="h-3.5 w-px bg-slate-300 mx-1.5" />

          {/* Group 2: Intelligence & System */}
          <div className="flex items-center gap-0.5">
            {intelligenceGroup.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 rounded-lg bg-slate-900 shadow-xs"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`}
                  />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Minimalist Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800">
            <Globe className="h-3.5 w-3.5" /> LIVE ONLY
          </span>
          {/* Settings / Config Button */}
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Catchment & Village Configuration"
              aria-label="Catchment Configuration"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}

          {/* Stream Threat Status Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${riskStatus.badge}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${riskStatus.pulse}`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${riskStatus.dot}`}
              />
            </span>
            <span className="text-[11px] font-bold tracking-tight uppercase">
              {riskStatus.label}
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Alert Notifications"
              aria-label="Alert Notifications"
            >
              <Bell className="h-4 w-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Notification Flyout */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl z-50 text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-900">
                    Computed Alerts
                  </span>
                  <span className="rounded bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600 border border-red-100">
                    {activeAlertsCount} Active
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <span>
                        {riskUnknown
                          ? "No data"
                          : overallRisk === "SEVERE"
                            ? "Severe tier: computed"
                            : overallRisk === "HIGH"
                              ? "High tier: computed"
                              : overallRisk === "MEDIUM"
                                ? "Medium tier: computed"
                                : "Low tier: nominal"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-700 leading-snug">
                      Alerts shown here are computed on screen. This prototype
                      does not dispatch anything to phones, sirens or
                      authorities.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    onTabChange("alerts");
                  }}
                  className="mt-3 w-full rounded-lg bg-slate-900 py-1.5 text-center text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  View Alerts Tab
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          {/* Operational Group */}
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Operations & Monitoring
            </div>
            <div className="space-y-0.5">
              {operationalGroup.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.hasBadge && activeAlertsCount > 0 && (
                      <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {activeAlertsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intelligence Group */}
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Intelligence & Systems
            </div>
            <div className="space-y-0.5">
              {intelligenceGroup.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
