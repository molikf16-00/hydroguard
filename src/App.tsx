import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import { SimulationScenario, RiskLevel, VillageData } from './types';
import { SCENARIO_METRICS, CATCHMENTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { DemoScenarioBar } from './components/DemoScenarioBar';
import { MainRiskCard } from './components/MainRiskCard';
import { MultiSourceCards } from './components/MultiSourceCards';
import { RiskTrendChart } from './components/RiskTrendChart';
import { RiskMap } from './components/RiskMap';
import { EmergencyAlertPanel } from './components/EmergencyAlertPanel';
import { EvacuationIntelligence } from './components/EvacuationIntelligence';
import { AlertChannelsCard } from './components/AlertChannelsCard';
import { AnalyticsView } from './components/AnalyticsView';
import { AboutView } from './components/AboutView';
import { EmergencyModal } from './components/EmergencyModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'alerts' | 'analytics' | 'about'>('dashboard');
  const [scenario, setScenario] = useState<SimulationScenario>('SEVERE');
  const [selectedCatchmentId, setSelectedCatchmentId] = useState<string>('chamoli-rishi-ganga');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [selectedVillageForModal, setSelectedVillageForModal] = useState<VillageData | null>(null);

  // Auto-cycle scenarios for hands-free presentations
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setScenario((prev) => {
        if (prev === 'NORMAL') return 'RISING';
        if (prev === 'RISING') return 'SEVERE';
        return 'NORMAL';
      });
    }, 9000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeCatchment = CATCHMENTS.find((c) => c.id === selectedCatchmentId) || CATCHMENTS[0];
  const activeMetrics = SCENARIO_METRICS[scenario];

  const handleOpenEmergencyDetails = () => {
    setSelectedVillageForModal(activeMetrics.villages[0] || null);
    setIsEmergencyModalOpen(true);
  };

  const handleOpenVillageRoute = (village: VillageData) => {
    setSelectedVillageForModal(village);
    setIsEmergencyModalOpen(true);
  };

  // Reusable Sub-View Breadcrumb & Navigation Bar
  const renderSubViewHeader = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    activeKey: 'map' | 'alerts' | 'analytics' | 'about'
  ) => (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition shadow-2xs shrink-0 group"
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
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
            activeKey === 'map'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          GIS Map
        </button>
        <button
          onClick={() => setCurrentTab('alerts')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
            activeKey === 'alerts'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
            activeKey === 'analytics'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setCurrentTab('about')}
          className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
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
      {/* 1. Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        overallRisk={activeMetrics.overallRisk}
        activeAlertsCount={activeMetrics.activeAlerts.length}
      />

      {/* 2. Clean Simulator Control Bar */}
      <DemoScenarioBar
        scenario={scenario}
        onScenarioChange={(newScenario) => setScenario(newScenario)}
        selectedCatchmentId={selectedCatchmentId}
        onCatchmentChange={(id) => setSelectedCatchmentId(id)}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Title & Operational Status Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Flash Flood Decision Support System
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Real-time multi-source hydrological telemetry, runoff kinematic modeling, and CAP early warning.
                </p>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-slate-700 shadow-2xs max-w-full min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                  <span className="font-semibold truncate">{activeCatchment.name}</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 py-1.5 text-emerald-800 shadow-2xs shrink-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span className="font-bold">Active Station Ingest (15s)</span>
                </div>
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
                  onClick={() => setCurrentTab('map')}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition shadow-2xs"
                >
                  <Layers className="h-3 w-3" />
                  <span>GIS Full View</span>
                </button>
                <button
                  onClick={() => setCurrentTab('analytics')}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition shadow-2xs"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Deep Analytics</span>
                </button>
              </div>
            </nav>

            {/* 1. Primary Incident Risk Hero Card */}
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
              />
            </div>

            {/* 2. Multi-Source Telemetry Inputs (4 Cards) */}
            <div id="telemetry">
              <MultiSourceCards
                rainfall={activeMetrics.rainfall}
                riverLevel={activeMetrics.riverLevel}
                soilMoisture={activeMetrics.soilMoisture}
                terrainSatellite={activeMetrics.terrainSatellite}
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
              />
            </div>

            {/* 5. Evacuation Intelligence Matrix */}
            <div id="evacuation-section">
              <EvacuationIntelligence
                villages={activeMetrics.villages}
                overallRisk={activeMetrics.overallRisk}
                onViewRouteModal={handleOpenVillageRoute}
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

              {/* 7. Multi-Channel Warning System Card */}
              <AlertChannelsCard />
            </div>
          </div>
        )}

        {/* Dedicated Risk Map Page */}
        {currentTab === 'map' && (
          <div className="space-y-4">
            {renderSubViewHeader(
              'Catchment GIS Topography & Inundation Map',
              'Inspect topological contour elevation, flood surge wave arrival times, safe shelters, and evacuation paths.',
              <Layers className="h-4 w-4 text-slate-800" />,
              'map'
            )}

            <RiskMap
              villages={activeMetrics.villages}
              overallRisk={activeMetrics.overallRisk}
              onSelectVillage={(v) => setSelectedVillageForModal(v)}
              onViewRoute={handleOpenVillageRoute}
            />
          </div>
        )}

        {/* Dedicated Alerts Page */}
        {currentTab === 'alerts' && (
          <div className="space-y-6">
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
            />

            <AlertChannelsCard />
          </div>
        )}

        {/* Dedicated Analytics Page */}
        {currentTab === 'analytics' && (
          <div className="space-y-6">
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
            />
          </div>
        )}

        {/* Dedicated Architecture Page */}
        {currentTab === 'about' && (
          <div className="space-y-6">
            {renderSubViewHeader(
              'System Architecture & Multi-Source Sensor Specifications',
              'Hardware datalogging, radar stage measurement, telemetry failover topology, and early warning standards.',
              <BookOpen className="h-4 w-4 text-slate-800" />,
              'about'
            )}

            <AboutView />
          </div>
        )}
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

      {/* Operational System Footer */}
      <Footer />
    </div>
  );
}
