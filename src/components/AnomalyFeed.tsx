import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  Eye,
  CheckCircle2,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import { AnomalyAlert, CommodityType, AnomalySeverity } from '../types/intelligence';

interface AnomalyFeedProps {
  alerts: AnomalyAlert[];
  commodityFilter: CommodityType;
  onSelectAlert: (alert: AnomalyAlert) => void;
  onSynthesizeWithGemini: (alert: AnomalyAlert) => void;
}

export const AnomalyFeed: React.FC<AnomalyFeedProps> = ({
  alerts,
  commodityFilter,
  onSelectAlert,
  onSynthesizeWithGemini,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesCommodity =
      commodityFilter === 'all' || alert.commodity === commodityFilter;

    const matchesSeverity =
      selectedSeverity === 'ALL' || alert.severity === selectedSeverity;

    const matchesCategory =
      selectedCategory === 'ALL' || alert.category === selectedCategory;

    return matchesCommodity && matchesSeverity && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Benchmark KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Dark Fleet Detection Rate
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            94.2% <span className="text-xs font-normal text-slate-400">accuracy</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Verified vs. Sentinel-1 SAR &amp; Planet optical
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Flight-to-Vault Attribution
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            89.4% <span className="text-xs font-normal text-slate-400">precision</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Correlating mine departure to refinery receipt
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Data Ingestion Latency
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            42s <span className="text-xs font-normal text-slate-400">&lt; 120s SLA</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Streaming terrestrial &amp; space-based AIS/ADS-B
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Volume Margin of Error
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
            &plusmn; 3.8% <span className="text-xs font-normal text-slate-400">&lt; 5% target</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calculated crude volume variance at offload
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-md text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono px-1">
              Severity:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'ELEVATED'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                  selectedSeverity === sev
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-md text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono px-1">
              Category:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'AIS_DARK', label: 'AIS Dark' },
              { id: 'STS_TRANSFER', label: 'STS Transfer' },
              { id: 'GPS_SPOOFING', label: 'GPS Spoof' },
              { id: 'CARGO_FLIGHT_DIVERGENCE', label: 'Flight Divergence' },
              { id: 'MINE_SURGE', label: 'Mine Surge' },
              { id: 'CUSTOMS_DISCREPANCY', label: 'Customs' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-white font-bold">{filteredAlerts.length}</span> active anomalies
        </div>
      </div>

      {/* Anomaly Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-lg text-slate-500">
            No active anomalies matching current filter parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg transition-all space-y-4"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : isHigh
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}
                    >
                      {alert.severity}
                    </span>

                    <span className="text-xs font-mono text-slate-400">
                      {alert.category.replace('_', ' ')}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-mono text-slate-500">
                      {alert.timestamp}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    LOC: <span className="text-slate-200">{alert.locationDescription}</span>
                  </div>
                </div>

                {/* Main Content & Title */}
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <h4 className="text-base font-bold text-white hover:text-amber-400 transition-colors cursor-pointer" onClick={() => onSelectAlert(alert)}>
                      {alert.title}
                    </h4>

                    <div className="text-xs font-mono text-amber-300/90 font-medium">
                      Target Entity: {alert.entityName}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>

                    {/* Key Technical Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {alert.metrics.map((m, idx) => (
                        <div key={idx} className="p-2 bg-slate-950/60 border border-slate-800 rounded">
                          <div className="text-[10px] font-mono text-slate-500 uppercase">
                            {m.label}
                          </div>
                          <div className="text-xs font-mono font-bold text-white mt-0.5 tabular-nums">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Thumbnail (if satellite SAR or optical pass present) */}
                  {(alert.sarEvidenceImage || alert.opticalEvidenceImage) && (
                    <div
                      onClick={() => onSelectAlert(alert)}
                      className="w-full lg:w-48 h-28 rounded-md overflow-hidden relative border border-slate-700/80 shrink-0 cursor-pointer group"
                    >
                      <img
                        src={alert.sarEvidenceImage || alert.opticalEvidenceImage}
                        alt="Satellite pass evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[9px] font-mono text-cyan-300 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{alert.sarEvidenceImage ? 'SAR Sentinel-1 Pass' : 'Optical Pass'}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                    <span>COORDINATES:</span>
                    <span className="text-slate-300">
                      {alert.coordinates[0].toFixed(2)}&deg;N, {alert.coordinates[1].toFixed(2)}&deg;E
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSynthesizeWithGemini(alert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-600/50 rounded-md font-medium transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synthesize OSINT with Gemini AI</span>
                    </button>

                    <button
                      onClick={() => onSelectAlert(alert)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors font-medium cursor-pointer"
                    >
                      <span>Forensic Deep Dive</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
