import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Maximize2,
  Compass,
  Layers,
  BarChart3,
  BookOpen,
  History,
  Scale,
  Settings,
  FileCode2,
  Globe
} from 'lucide-react';
import { SimulationScenario, RiskLevel, VillageData, AppMode, MetricInspectionData, TransparentRiskScore } from './types';
import { SCENARIO_METRICS, CATCHMENTS } from './data/mockData';
import { DEFAULT_CATCHMENT_CONFIG, CatchmentConfig, calculateKinematicLeadTime } from './config/catchmentConfig';
import { calculateTransparentRiskScore } from './utils/riskScoring';
import { fetchLiveCatchmentData, LiveCatchmentState } from './utils/openMeteo';

import { Navbar } from './components/Navbar';
import { DemoScenarioBar } from './components/DemoScenarioBar';
import { MainRiskCard } from './components/MainRiskCard';
import { CitizenActionGuide } from './components/CitizenActionGuide';
import { MultiSourceCards } from './components/MultiSourceCards';
import { RiskTrendChart } from './components/RiskTrendChart';
import { RiskMap } from './components/RiskMap';
import { EmergencyAlertPanel } from './components/EmergencyAlertPanel';
import { EvacuationIntelligence } from './components/EvacuationIntelligence';
import { AlertChannelsCard } from './components/AlertChannelsCard';
import { AnalyticsView } from './components/AnalyticsView';
import { AboutView } from './components/AboutView';
import { EmergencyModal } from './components/EmergencyModal';
import { EventReplayView } from './components/EventReplayView';
import { MetricSourceModal } from './components/MetricSourceModal';
import { WhyThisScoreModal } from './components/WhyThisScoreModal';
import { CapAlertModal } from './components/CapAlertModal';
import { CatchmentConfigModal } from './components/CatchmentConfigModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & Operating Mode
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'alerts' | 'analytics' | 'about' | 'replay'>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>('DEMO');
  const [scenario, setScenario] = useState<SimulationScenario>('SEVERE');
  const [selectedCatchmentId, setSelectedCatchmentId] = useState<string>('chamoli-rishi-ganga');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Catchment Configuration (editable via UI)
  const [catchmentConfig, setCatchmentConfig] = useState<CatchmentConfig>(DEFAULT_CATCHMENT_CONFIG);

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [selectedVillageForModal, setSelectedVillageForModal] = useState<VillageData | null>(null);
  const [inspectMetric, setInspectMetric] = useState<MetricInspectionData | null>(null);
  const [isWhyScoreOpen, setIsWhyScoreOpen] = useState<boolean>(false);
  const [capModalVillage, setCapModalVillage] = useState<VillageData | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Live Data State
  const [liveDataStatus, setLiveDataStatus] = useState<'loading' | 'success' | 'cached' | 'error'>('success');
  const [isRefreshingLive, setIsRefreshingLive] = useState<boolean>(false);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveCatchmentState | null>(null);

  // Fetch Live Data from Open-Meteo
  const loadLiveData = useCallback(async () => {
    setIsRefreshingLive(true);
    setLiveDataStatus('loading');
    try {
      const data = await fetchLiveCatchmentData(
        catchmentConfig.upstreamTriggerPoint.lat,
        catchmentConfig.upstreamTriggerPoint.lon
      );
      setLiveTelemetry(data);
      if (data.isCached) {
        setLiveDataStatus('cached');
      } else {
        setLiveDataStatus('success');
      }
    } catch (err) {
      console.warn('Live data fetch failed, using fallback:', err);
      setLiveDataStatus('error');
    } finally {
      setIsRefreshingLive(false);
    }
  }, [catchmentConfig.upstreamTriggerPoint.lat, catchmentConfig.upstreamTriggerPoint.lon]);

  // Load live data on mode switch to LIVE
  useEffect(() => {
    if (appMode === 'LIVE') {
      loadLiveData();
    }
  }, [appMode, loadLiveData]);

  // Auto-cycle scenarios for hands-free presentations in Demo mode
  useEffect(() => {
    if (!isAutoPlaying || appMode === 'LIVE') return;
    const interval = setInterval(() => {
      setScenario((prev) => {
        if (prev === 'NORMAL') return 'RISING';
        if (prev === 'RISING') return 'SEVERE';
        return 'NORMAL';
      });
    }, 9000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, appMode]);

  const activeCatchment = CATCHMENTS.find((c) => c.id === selectedCatchmentId) || CATCHMENTS[0];
  const demoMetrics = SCENARIO_METRICS[scenario];

  // Derive Active Telemetry & Transparent Score
  const activeMetrics = React.useMemo(() => {
    if (appMode === 'LIVE' && liveTelemetry) {
      const transparentScore = liveTelemetry.riskScore;

      // Compute dynamic kinematic lead times for villages
      const updatedVillages: VillageData[] = catchmentConfig.villages.map((v) => {
        const lead = calculateKinematicLeadTime(v.distanceFromTriggerKm, 3.5);
        return {
          id: v.id,
          name: v.name,
          population: v.population,
          elevationM: v.elevationM,
          distanceFromRiverM: 120,
          evacuationTimeMinutes: lead.conservativeMinutes,
          riskLevel: transparentScore.riskLevel,
          evacuationStatus:
            transparentScore.riskLevel === 'SEVERE'
              ? 'ORDERED'
              : transparentScore.riskLevel === 'HIGH'
              ? 'PREPARED'
              : 'STANDBY',
          safeElevationM: v.elevationM + 140,
          nearestShelter: v.nearestShelter,
          shelterCapacity: 500,
          cluster: v.cluster,
        };
      });

      const rainMetric = liveTelemetry.metrics.find((m) => m.iconType === 'rain');
      const riverMetric = liveTelemetry.metrics.find((m) => m.iconType === 'river');
      const soilMetric = liveTelemetry.metrics.find((m) => m.iconType === 'soil');

      return {
        overallRisk: transparentScore.riskLevel,
        riskScore: transparentScore.totalScore,
        confidence: 'Design target: 85% accuracy',
        leadTime: '16m – 40m',
        lastUpdated: liveTelemetry.lastUpdatedText,
        headline: liveTelemetry.headline,
        description: liveTelemetry.description,
        rainfall: {
          currentMm: rainMetric?.numericValue || 4.2,
          hourlyRateMm: rainMetric?.numericValue || 4.2,
          status: rainMetric?.status || 'Moderate',
          sensorLocation: 'Rishi Ganga AWS-01 (Open-Meteo Ingest)',
          lastPing: liveTelemetry.lastUpdatedText,
          trend: rainMetric?.trend === 'Increasing' ? ('UP' as const) : ('STABLE' as const),
        },
        riverLevel: {
          currentM: +(2.8 + ((riverMetric?.numericValue || 3.5) / 3.5 - 1.0) * 1.5).toFixed(2),
          dangerLevelM: 5.2,
          rateOfRiseMPerHour: +(0.15 * ((riverMetric?.numericValue || 3.5) / 3.5)).toFixed(2),
          sensorLocation: 'Rishi Ganga Canyon Radar (GloFAS Runoff)',
          lastPing: riverMetric?.sourceTimestamp || 'Hourly sync',
          trend: riverMetric?.trend === 'Increasing' ? ('UP' as const) : ('STABLE' as const),
        },
        soilMoisture: {
          saturationPercentage: soilMetric?.numericValue || 64,
          status: soilMetric?.status || 'Absorptive',
          sensorLocation: 'Raini Hills Slope TDR Array (Land Surface Assimilation)',
          lastPing: soilMetric?.sourceTimestamp || 'Hourly sync',
          trend: soilMetric?.trend === 'Elevated' ? ('UP' as const) : ('STABLE' as const),
        },
        terrainSatellite: {
          slopeInstabilityIndex: 0.72,
          status: 'High Slope Gradient (>32°)',
          opticalClearance: 'Cartosat DEM Baseline',
          lastPass: 'ALOS PALSAR / Cartosat-1 DEM',
          trend: 'STABLE' as const,
        },
        affectedCluster: 'Cluster A & B (Raini, Tapovan)',
        evacuationPriority:
          transparentScore.riskLevel === 'SEVERE'
            ? 'IMMEDIATE VERTICAL EVACUATION TO HIGH GROUND'
            : transparentScore.riskLevel === 'HIGH'
            ? 'PREPARE EVACUATION ROUTE & SECURE ESSENTIALS'
            : 'NORMAL MONITORING',
        villages: updatedVillages,
        trendHistory: liveTelemetry.trendHistory.length > 0 ? liveTelemetry.trendHistory : demoMetrics.trendHistory,
        activeAlerts:
          transparentScore.riskLevel === 'SEVERE' || transparentScore.riskLevel === 'HIGH'
            ? demoMetrics.activeAlerts
            : [],
        transparentScore,
      };
    }

    // Demo Mode: calculate transparent score from demo scenario values
    const demo1h = demoMetrics.rainfall.currentMm;
    const demo3h = demo1h * 2.2;
    const demo24h = demo1h * 4.5;
    const demo72h = demo1h * 6.0;
    const demoSoil = demoMetrics.soilMoisture.saturationPercentage;
    const demoRiver = demoMetrics.riverLevel.currentM / 2.8;

    const transparentScore = calculateTransparentRiskScore({
      rain1hMm: demo1h,
      rain3hMm: demo3h,
      rain24hMm: demo24h,
      rain72hAntecedentMm: demo72h,
      soilMoistureSaturationPct: demoSoil,
      riverDischargeRatio: demoRiver,
      freshnessText: `Demo Simulator: ${scenario} Scenario`,
    });

    return {
      ...demoMetrics,
      riskScore: transparentScore.totalScore,
      overallRisk: transparentScore.riskLevel,
      transparentScore,
    };
  }, [appMode, liveTelemetry, demoMetrics, catchmentConfig, scenario]);

  const handleOpenEmergencyDetails = () => {
    setSelectedVillageForModal(activeMetrics.villages[0] || null);
    setIsEmergencyModalOpen(true);
  };

  const handleOpenVillageRoute = (village: VillageData) => {
    setSelectedVillageForModal(village);
    setIsEmergencyModalOpen(true);
  };

  const handleGenerateCap = (village: VillageData) => {
    setCapModalVillage(village);
  };

  // Reusable Sub-View Breadcrumb & Navigation Bar
  const renderSubViewHeader = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    activeKey: 'map' | 'alerts' | 'analytics' | 'replay' | 'about'
  ) => (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition shadow-2xs shrink-0 group cursor-pointer"
          title="Return to Main Operations Dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Dashboard</span>
        </button>

        <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
            {icon}
            <span className="truncate">{title}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-md md:max-w-lg">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Quick Sibling View Switcher */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <span className="text-[11px] text-slate-600 font-medium mr-1 hidden xl:inline">Switch view:</span>
        <button
          onClick={() => setCurrentTab('map')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition cursor-pointer ${
            activeKey === 'map'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          GIS Map
        </button>
        <button
          onClick={() => setCurrentTab('alerts')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition cursor-pointer ${
            activeKey === 'alerts'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition cursor-pointer ${
            activeKey === 'analytics'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setCurrentTab('replay')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition cursor-pointer ${
            activeKey === 'replay'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Event Replay
        </button>
        <button
          onClick={() => setCurrentTab('about')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition cursor-pointer ${
            activeKey === 'about'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Architecture
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header Navigation with Mode Switcher & Real Badges */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        overallRisk={activeMetrics.overallRisk}
        activeAlertsCount={activeMetrics.activeAlerts.length}
        appMode={appMode}
        onModeToggle={(m) => setAppMode(m)}
        liveDataStatus={liveDataStatus}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* 2. Mode Status & Scenario Control Bar */}
      <DemoScenarioBar
        scenario={scenario}
        onScenarioChange={(newScenario) => setScenario(newScenario)}
        selectedCatchmentId={selectedCatchmentId}
        onCatchmentChange={(id) => setSelectedCatchmentId(id)}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
        appMode={appMode}
        onModeToggle={(m) => setAppMode(m)}
        onRefreshLive={loadLiveData}
        isRefreshingLive={isRefreshingLive}
        liveStatusText={
          liveDataStatus === 'success'
            ? 'Open-Meteo Weather & GloFAS River Realtime'
            : liveDataStatus === 'cached'
            ? 'Open-Meteo Cached Telemetry (CORS Resilient)'
            : 'Connecting...'
        }
      />

      {/* Main Viewport Container */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Top Title & Operational Status Header */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Flash Flood Decision Support System
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Transparent 4-factor risk scoring, kinematic lead time modeling, and OASIS CAP 1.2 early warning.
                  </p>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div
                    onClick={() => setIsConfigModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-slate-700 shadow-2xs max-w-full min-w-0 cursor-pointer hover:bg-slate-50 transition"
                    title="Click to view & edit catchment parameters"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                    <span className="font-semibold truncate">{activeCatchment.name}</span>
                    <span className="text-[10px] text-slate-400">({catchmentConfig.villages.length} villages)</span>
                  </div>

                  {appMode === 'LIVE' ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 py-1.5 text-emerald-800 shadow-2xs shrink-0">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                      <span className="font-bold">Live Data Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 sm:px-3 py-1.5 text-purple-800 shadow-2xs shrink-0">
                      <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" />
                      <span className="font-bold">Demo Simulator ({scenario})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Section Navigation Bar */}
              <nav aria-label="Dashboard quick jumps" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <Compass className="h-3.5 w-3.5 text-slate-800 shrink-0 ml-1" />
                  <span className="hidden sm:inline">Jump to:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1 text-xs">
                  <a
                    href="#citizen-guide"
                    className="rounded-lg px-2.5 py-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
                  >
                    Citizen Action Guide
                  </a>
                  <a
                    href="#telemetry"
                    className="rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    Telemetry
                  </a>
                  <a
                    href="#map-section"
                    className="rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    Catchment GIS Map
                  </a>
                  <a
                    href="#trend-section"
                    className="rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    Hydro Trend
                  </a>
                  <a
                    href="#evacuation-section"
                    className="rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    Evacuation Matrix
                  </a>
                  <a
                    href="#alerts-section"
                    className="rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    Broadcasts
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setCurrentTab('replay')}
                    className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-purple-800 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                  >
                    <History className="h-3 w-3" />
                    <span>Event Replay</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('analytics')}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition shadow-2xs cursor-pointer"
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>Analytics</span>
                  </button>
                </div>
              </nav>

              {/* 1. Primary Incident Risk Hero Card with "Why This Score" attribution */}
              <div id="overview">
                <MainRiskCard
                  overallRisk={activeMetrics.overallRisk}
                  riskScore={activeMetrics.riskScore}
                  confidence={activeMetrics.confidence}
                  leadTime={activeMetrics.leadTime}
                  lastUpdated={activeMetrics.lastUpdated}
                  headline={activeMetrics.headline}
                  description={activeMetrics.description}
                  catchmentName={activeCatchment.name}
                  onViewEmergencyDetails={handleOpenEmergencyDetails}
                  transparentScore={activeMetrics.transparentScore}
                  onOpenWhyScore={() => setIsWhyScoreOpen(true)}
                  onInspectMetric={(data) => setInspectMetric(data)}
                />
              </div>

              {/* Citizen Action Guide */}
              <div id="citizen-guide">
                <CitizenActionGuide
                  overallRisk={activeMetrics.overallRisk}
                  leadTime={activeMetrics.leadTime}
                  affectedCluster={activeMetrics.affectedCluster}
                  nearestShelter={activeMetrics.villages[0]?.nearestShelter || 'High Ground Safe School'}
                  recommendedAction={activeMetrics.evacuationPriority}
                  villages={activeMetrics.villages}
                  onOpenRoute={handleOpenVillageRoute}
                />
              </div>

              {/* 2. Multi-Source Telemetry Inputs (Audit click-enabled) */}
              <div id="telemetry">
                <MultiSourceCards
                  rainfall={activeMetrics.rainfall}
                  riverLevel={activeMetrics.riverLevel}
                  soilMoisture={activeMetrics.soilMoisture}
                  terrainSatellite={activeMetrics.terrainSatellite}
                  onInspectMetric={(data) => setInspectMetric(data)}
                />
              </div>

              {/* 3. Interactive Catchment Topography & Risk Map */}
              <div id="map-section">
                <RiskMap
                  villages={activeMetrics.villages}
                  overallRisk={activeMetrics.overallRisk}
                  onSelectVillage={(v) => setSelectedVillageForModal(v)}
                  onViewRoute={handleOpenVillageRoute}
                />
              </div>

              {/* 4. Catchment Hydrological Risk Trend Chart */}
              <div id="trend-section">
                <RiskTrendChart
                  trendHistory={activeMetrics.trendHistory}
                  overallRisk={activeMetrics.overallRisk}
                  onInspectMetric={(data) => setInspectMetric(data)}
                />
              </div>

              {/* 5. Evacuation Intelligence Matrix with Kinematic Lead Times & OASIS CAP generator */}
              <div id="evacuation-section">
                <EvacuationIntelligence
                  villages={activeMetrics.villages}
                  overallRisk={activeMetrics.overallRisk}
                  onViewRouteModal={handleOpenVillageRoute}
                  onGenerateCapAlert={handleGenerateCap}
                  onInspectMetric={(data) => setInspectMetric(data)}
                />
              </div>

              {/* 6. Emergency Broadcasts & Alert History */}
              <div id="alerts-section" className="space-y-6">
                <EmergencyAlertPanel
                  overallRisk={activeMetrics.overallRisk}
                  headline={activeMetrics.headline}
                  description={activeMetrics.description}
                  affectedCluster={activeMetrics.affectedCluster}
                  leadTime={activeMetrics.leadTime}
                  recommendedAction={activeMetrics.evacuationPriority}
                  activeAlerts={activeMetrics.activeAlerts}
                  onViewEvacuationPlan={handleOpenEmergencyDetails}
                  onViewAffectedVillages={() => setCurrentTab('map')}
                />

                {/* 7. Multi-Channel Warning System Card with Honest Design Targets */}
                <AlertChannelsCard onInspectMetric={(data) => setInspectMetric(data)} />
              </div>
            </motion.div>
          )}

          {/* TAB 2: DEDICATED RISK MAP PAGE */}
          {currentTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {renderSubViewHeader(
                'Catchment GIS Topography & Inundation Map',
                'Topological contour elevation, kinematic wave arrival times, safe shelters, and evacuation paths.',
                <Layers className="h-4 w-4 text-slate-800" />,
                'map'
              )}

              <RiskMap
                villages={activeMetrics.villages}
                overallRisk={activeMetrics.overallRisk}
                onSelectVillage={(v) => setSelectedVillageForModal(v)}
                onViewRoute={handleOpenVillageRoute}
              />
            </motion.div>
          )}

          {/* TAB 3: DEDICATED ALERTS PAGE */}
          {currentTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {renderSubViewHeader(
                'Emergency Broadcast Center & Warning Feeds',
                'Common Alerting Protocol (CAP v1.2) multi-channel dispatch, sirens, SMS broadcast, and transmission logs.',
                <Radio className="h-4 w-4 text-slate-800" />,
                'alerts'
              )}

              <EmergencyAlertPanel
                overallRisk={activeMetrics.overallRisk}
                headline={activeMetrics.headline}
                description={activeMetrics.description}
                affectedCluster={activeMetrics.affectedCluster}
                leadTime={activeMetrics.leadTime}
                recommendedAction={activeMetrics.evacuationPriority}
                activeAlerts={activeMetrics.activeAlerts}
                onViewEvacuationPlan={handleOpenEmergencyDetails}
                onViewAffectedVillages={() => setCurrentTab('map')}
              />

              <EvacuationIntelligence
                villages={activeMetrics.villages}
                overallRisk={activeMetrics.overallRisk}
                onViewRouteModal={handleOpenVillageRoute}
                onGenerateCapAlert={handleGenerateCap}
                onInspectMetric={(data) => setInspectMetric(data)}
              />

              <AlertChannelsCard onInspectMetric={(data) => setInspectMetric(data)} />
            </motion.div>
          )}

          {/* TAB 4: DEDICATED ANALYTICS PAGE */}
          {currentTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {renderSubViewHeader(
                'Hydrological Analytics & Sensor Runoff Diagnostics',
                'Multi-source sensor correlation, time-series rainfall/river stage tracking, and kinematic catchment delay calculations.',
                <BarChart3 className="h-4 w-4 text-slate-800" />,
                'analytics'
              )}

              <AnalyticsView
                trendHistory={activeMetrics.trendHistory}
                overallRisk={activeMetrics.overallRisk}
                villages={activeMetrics.villages}
                alertsCount={activeMetrics.activeAlerts.length}
                transparentScore={activeMetrics.transparentScore}
                onInspectMetric={(data) => setInspectMetric(data)}
                onOpenWhyScore={() => setIsWhyScoreOpen(true)}
              />
            </motion.div>
          )}

          {/* TAB 5: TASK 3 EVENT REPLAY VIEW (ERA5 Reanalysis Historical Events) */}
          {currentTab === 'replay' && (
            <motion.div
              key="replay"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {renderSubViewHeader(
                'Historical Event Replay Engine (ERA5 Reanalysis)',
                'Replay catastrophic Himalayan flash flood events step-by-step to stress-test early warning lead times.',
                <History className="h-4 w-4 text-purple-600" />,
                'replay'
              )}

              <EventReplayView onInspectMetric={(data) => setInspectMetric(data)} />
            </motion.div>
          )}

          {/* TAB 6: DEDICATED ARCHITECTURE PAGE */}
          {currentTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {renderSubViewHeader(
                'System Architecture & Multi-Source Sensor Specifications',
                'Hardware datalogging, radar stage measurement, telemetry failover topology, and early warning standards.',
                <BookOpen className="h-4 w-4 text-slate-800" />,
                'about'
              )}

              <AboutView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Emergency Operational Details Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        overallRisk={activeMetrics.overallRisk}
        headline={activeMetrics.headline}
        affectedCluster={activeMetrics.affectedCluster}
        leadTime={activeMetrics.leadTime}
        selectedVillage={selectedVillageForModal}
      />

      {/* Metric Provenance & Source Audit Modal */}
      <MetricSourceModal
        isOpen={!!inspectMetric}
        onClose={() => setInspectMetric(null)}
        data={inspectMetric}
      />

      {/* Transparent Score Attribution Modal ("Why This Score?") */}
      <WhyThisScoreModal
        isOpen={isWhyScoreOpen}
        onClose={() => setIsWhyScoreOpen(false)}
        score={activeMetrics.transparentScore}
        catchmentName={catchmentConfig.catchmentName}
      />

      {/* OASIS CAP 1.2 XML Generator Modal */}
      <CapAlertModal
        isOpen={!!capModalVillage}
        onClose={() => setCapModalVillage(null)}
        village={capModalVillage}
        riskLevel={activeMetrics.overallRisk}
        catchmentConfig={catchmentConfig}
      />

      {/* Editable Catchment Configuration Modal */}
      <CatchmentConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={catchmentConfig}
        onSaveConfig={(updated) => setCatchmentConfig(updated)}
      />

      {/* Operational System Footer */}
      <Footer />
    </div>
  );
}
