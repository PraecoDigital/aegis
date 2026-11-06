import React, { useState } from 'react';
import {
  TopNav,
} from './components/TopNav';
import {
  TacticalMap,
} from './components/TacticalMap';
import {
  VesselTracker,
} from './components/VesselTracker';
import {
  GoldTracker,
} from './components/GoldTracker';
import {
  AnomalyFeed,
} from './components/AnomalyFeed';
import {
  StorageTerminals,
} from './components/StorageTerminals';
import {
  ForensicDrawer,
} from './components/ForensicDrawer';
import {
  FlowReportModal,
} from './components/FlowReportModal';
import {
  INITIAL_VESSELS,
  INITIAL_FLIGHTS,
  INITIAL_MINES,
  INITIAL_VAULTS,
  INITIAL_TERMINALS,
  INITIAL_ALERTS,
} from './data/mockFeeds';
import {
  CommodityType,
  TankerVessel,
  ArmoredCargoFlight,
  GoldMineSite,
  BullionVaultHub,
  StorageTerminal,
  AnomalyAlert,
} from './types/intelligence';
import {
  Shield,
  Radio,
  FileText,
  AlertTriangle,
  Ship,
  Plane,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'vessels' | 'gold' | 'anomalies' | 'terminals'>('map');
  const [commodityFilter, setCommodityFilter] = useState<CommodityType>('all');

  // Entities
  const [vessels] = useState<TankerVessel[]>(INITIAL_VESSELS);
  const [flights] = useState<ArmoredCargoFlight[]>(INITIAL_FLIGHTS);
  const [mines] = useState<GoldMineSite[]>(INITIAL_MINES);
  const [vaults] = useState<BullionVaultHub[]>(INITIAL_VAULTS);
  const [terminals] = useState<StorageTerminal[]>(INITIAL_TERMINALS);
  const [alerts] = useState<AnomalyAlert[]>(INITIAL_ALERTS);

  // Selected Entity for Forensic Drawer
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<
    'vessel' | 'flight' | 'mine' | 'vault' | 'terminal' | 'alert' | null
  >(null);

  // Flow Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleSelectEntity = (
    entity: any,
    type: 'vessel' | 'flight' | 'mine' | 'vault' | 'terminal' | 'alert'
  ) => {
    setSelectedEntity(entity);
    setSelectedEntityType(type);
  };

  const handleCloseDrawer = () => {
    setSelectedEntity(null);
    setSelectedEntityType(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Strict Top Navigation Bar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        commodityFilter={commodityFilter}
        setCommodityFilter={setCommodityFilter}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        anomalyCount={alerts.length}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Context Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-semibold uppercase">
                {commodityFilter === 'all'
                  ? 'MULTI-MODAL INTELLIGENCE'
                  : commodityFilter === 'crude'
                  ? 'CRUDE OIL & PETROLEUM VECTOR'
                  : 'GOLD BULLION SUPPLY CHAIN'}
              </span>
              <span className="text-slate-600">·</span>
              <span>SYNTHESIZING AIS, SATELLITE SAR &amp; ADS-B TELEMATICS</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              {activeTab === 'map' && 'Spatiotemporal Vector Command & Satellite Radar'}
              {activeTab === 'vessels' && 'Maritime Oil Tanker Tracking & Draft Displacement'}
              {activeTab === 'gold' && 'Gold Bullion Extraction, Heavy Air Cargo & Vault Inflows'}
              {activeTab === 'anomalies' && 'Dark Fleet Anomaly Detection & Geopolitical Flags'}
              {activeTab === 'terminals' && 'Terminal Floating-Roof Capacity & Vault Freeports'}
            </h1>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
            <div className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded flex items-center gap-1.5">
              <span className="text-slate-500">INGESTION:</span>
              <span className="text-emerald-400 font-bold tabular-nums">42s</span>
            </div>

            <div className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded flex items-center gap-1.5">
              <span className="text-slate-500">SAR PASSES:</span>
              <span className="text-cyan-400 font-bold tabular-nums">SENTINEL-1</span>
            </div>

            <div className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded flex items-center gap-1.5">
              <span className="text-slate-500">ANOMALIES:</span>
              <span className="text-rose-400 font-bold tabular-nums">
                {alerts.length} Flagged
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Views */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <TacticalMap
              vessels={vessels}
              flights={flights}
              mines={mines}
              vaults={vaults}
              terminals={terminals}
              commodityFilter={commodityFilter}
              selectedEntity={selectedEntity}
              onSelectEntity={handleSelectEntity}
            />

            {/* Bottom Quick-Inspection Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Priority Anomaly Radar */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Priority Anomaly Alerts</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('anomalies')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    View All ({alerts.length}) &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleSelectEntity(alert, 'alert')}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {alert.title}
                        </span>
                        <span className="text-[10px] font-mono text-rose-400 font-semibold">
                          {alert.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {alert.description}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                        <span>{alert.locationDescription}</span>
                        <span>·</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Active Transport Corridor Watch */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Corridors Under Tasked Pass</span>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Generate Report &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">
                        Persian Gulf &amp; Strait of Hormuz
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        21.4M bbl crude in transit · 1 AIS blackout confirmed via SAR
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-semibold shrink-0">
                      High Surveillance
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">
                        Lakonikos Gulf / Greek Offshore STS Hub
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        720k bbl Urals crude dual-tanker transshipment in progress
                      </div>
                    </div>
                    <span className="text-xs font-mono text-rose-400 font-semibold shrink-0">
                      STS Active
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">
                        Johannesburg &rarr; Zurich Bullion Flight Axis
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        CLX742 (B747-400F) carrying 185k oz bullion ($499M USD)
                      </div>
                    </div>
                    <span className="text-xs font-mono text-purple-400 font-semibold shrink-0">
                      In-Flight En Route
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vessels' && (
          <VesselTracker
            vessels={vessels}
            onSelectVessel={(vessel) => handleSelectEntity(vessel, 'vessel')}
          />
        )}

        {activeTab === 'gold' && (
          <GoldTracker
            mines={mines}
            flights={flights}
            vaults={vaults}
            onSelectFlight={(flight) => handleSelectEntity(flight, 'flight')}
            onSelectMine={(mine) => handleSelectEntity(mine, 'mine')}
            onSelectVault={(vault) => handleSelectEntity(vault, 'vault')}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyFeed
            alerts={alerts}
            commodityFilter={commodityFilter}
            onSelectAlert={(alert) => handleSelectEntity(alert, 'alert')}
            onSynthesizeWithGemini={(alert) => handleSelectEntity(alert, 'alert')}
          />
        )}

        {activeTab === 'terminals' && (
          <StorageTerminals
            terminals={terminals}
            vaults={vaults}
            onSelectTerminal={(terminal) => handleSelectEntity(terminal, 'terminal')}
            onSelectVault={(vault) => handleSelectEntity(vault, 'vault')}
          />
        )}
      </main>

      {/* Forensic Deep Dive Inspection Drawer */}
      <ForensicDrawer
        entity={selectedEntity}
        entityType={selectedEntityType}
        onClose={handleCloseDrawer}
      />

      {/* Flow Report Generation Modal */}
      <FlowReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentCommodity={commodityFilter}
        vesselsCount={vessels.length}
        flightsCount={flights.length}
        minesCount={mines.length}
        vaultsCount={vaults.length}
      />
    </div>
  );
}
