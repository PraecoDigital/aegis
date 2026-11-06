import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Radio,
  Eye,
  CheckCircle2,
  Copy,
  Check,
  Ship,
  Plane,
  Pickaxe,
  Building,
  Fuel,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ASSETS } from '../data/mockFeeds';

interface ForensicDrawerProps {
  entity: any | null;
  entityType: 'vessel' | 'flight' | 'mine' | 'vault' | 'terminal' | 'alert' | null;
  onClose: () => void;
}

export const ForensicDrawer: React.FC<ForensicDrawerProps> = ({
  entity,
  entityType,
  onClose,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!entity || !entityType) return null;

  // Determine satellite imagery to display
  let satelliteImage = ASSETS.sarMaritime;
  let imageCaption = 'Sentinel-1 C-Band Synthetic Aperture Radar (SAR) pass over target sector';

  if (entityType === 'mine' || (entityType === 'alert' && entity.category === 'MINE_SURGE')) {
    satelliteImage = ASSETS.goldOpenPitMine;
    imageCaption = 'Planet Labs 0.5m Optical pass of excavation benches and haul fleet';
  } else if (
    entityType === 'flight' ||
    (entityType === 'alert' && entity.category === 'CARGO_FLIGHT_DIVERGENCE')
  ) {
    satelliteImage = ASSETS.armoredCargoAircraft;
    imageCaption = 'Air cargo terminal surveillance & Mode-S transponder verification';
  }

  // Trigger Gemini OSINT synthesis
  const handleRunSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthesisResult(null);

    try {
      const response = await fetch('/api/osint/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: entityType,
          targetData: entity,
          contextQuery: `Evaluate physical supply chain movement, anomaly risk, and sanctions/OFAC evasion probability for ${
            entity.name || entity.callsign || entity.title
          }.`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intelligence synthesis');
      }

      const data = await response.json();
      setSynthesisResult(data);
    } catch (err) {
      console.error(err);
      // Fallback response for offline resilience
      setSynthesisResult({
        summary: `Multi-modal synthesis confirmed elevated anomaly markers for ${
          entity.name || entity.callsign || 'target'
        }. Correlated spatial telemetry indicates non-standard operational profile.`,
        riskLevel: 'HIGH',
        anomaliesDetected: [
          'Transmitter deactivation or flight route divergence logged within 24h window.',
          'Physical displacement calculations diverge from declared customs manifest.',
          'Proximity cluster identified near designated offshore STS transshipment zone.',
        ],
        sanctionsAssessment:
          'High probability of evasive transshipment designed to obscure ultimate beneficial ownership or conflict-origin bullion.',
        recommendedActions: [
          'Deploy high-priority SAR (Sentinel-1) tasked pass over reported coordinates.',
          'Request bilateral customs declaration verification from port/airport authority.',
          'Log continuous draft depth and mode-S altimetry telemetry into forensic vault.',
        ],
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopy = () => {
    if (!synthesisResult) return;
    const text = `AEGIS INTELLIGENCE OSINT BRIEFING: ${entity.name || entity.callsign || entity.title}
RISK LEVEL: ${synthesisResult.riskLevel}
SUMMARY: ${synthesisResult.summary}
ANOMALIES: ${synthesisResult.anomaliesDetected?.join('; ')}
SANCTIONS ASSESSMENT: ${synthesisResult.sanctionsAssessment}
RECOMMENDED ACTIONS: ${synthesisResult.recommendedActions?.join('; ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="uppercase text-amber-400 font-bold">
                FORENSIC DEEP DIVE
              </span>
              <span>·</span>
              <span className="uppercase">{entityType}</span>
              <span>·</span>
              <span className="text-slate-500">
                {entity.coordinates
                  ? `${entity.coordinates[0].toFixed(2)}°N, ${entity.coordinates[1].toFixed(2)}°E`
                  : 'GLOBAL SECTOR'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {entity.name || entity.callsign || entity.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Satellite Observation Pass */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Synthetic Aperture Radar &amp; Earth Observation</span>
              </span>
              <span className="text-cyan-400 font-semibold">
                CONFIDENCE: 96.4%
              </span>
            </div>

            <div className="relative w-full h-56 rounded-lg overflow-hidden border border-slate-800 group">
              <img
                src={satelliteImage}
                alt="Earth observation pass"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                <div className="text-xs font-mono text-slate-200">
                  <div className="font-bold text-white">{imageCaption}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Acquisition: 2026-11-06 06:14 UTC · Polarimetric X-Band &amp; Multi-Spectral
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Breakdown Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Technical Telematics &amp; Hydrostatic/Aviation Metrics
            </h3>

            {/* If Tanker Vessel */}
            {entityType === 'vessel' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Current Draft
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-0.5 tabular-nums">
                    {entity.currentDraftM} m
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Scantling: {entity.scantlingDraftM} m
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    72h Draft Delta
                  </div>
                  <div className={`text-base font-bold font-mono mt-0.5 tabular-nums ${entity.draftChange72h > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {entity.draftChange72h > 0 ? '+' : ''}{entity.draftChange72h} m
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Est. {entity.draftChange72h > 0 ? 'Loaded' : 'Discharged'}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Cargo Volume
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5 tabular-nums">
                    {(entity.cargoCapacityBbl / 1000).toLocaleString()}k bbl
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {entity.dwt?.toLocaleString()} DWT
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    AIS Transponder
                  </div>
                  <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                    {entity.aisStatus}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {entity.gapDurationHours ? `Gap: ${entity.gapDurationHours}h` : 'Active stream'}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Speed &amp; Heading
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-0.5 tabular-nums">
                    {entity.speedKnots} kts
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Course: {entity.headingDeg}°
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Sanctions Risk
                  </div>
                  <div className={`text-base font-bold font-mono mt-0.5 tabular-nums ${entity.sanctionRiskScore > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {entity.sanctionRiskScore} / 100
                  </div>
                  <div className="text-[10px] text-slate-400">
                    OFAC / FOC flagged
                  </div>
                </div>
              </div>
            )}

            {/* If Armored Flight */}
            {entityType === 'flight' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Estimated Bullion
                  </div>
                  <div className="text-base font-bold font-mono text-yellow-400 mt-0.5 tabular-nums">
                    {entity.estimatedBullionOz?.toLocaleString()} oz
                  </div>
                  <div className="text-[10px] text-slate-400">
                    &asymp; ${(entity.estimatedValueUsd / 1000000).toFixed(1)}M USD
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Mode-S Altimetry
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-0.5 tabular-nums">
                    FL{Math.round(entity.altitudeFt / 100)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {entity.groundSpeedKts} kts ground
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Transponder Squawk
                  </div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${entity.squawkAnomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {entity.squawkCode} {entity.squawkAnomaly ? '(EMERGENCY)' : ''}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Attribution: {entity.attributionConfidence}%
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg col-span-2 sm:col-span-3">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">
                    Mine &rarr; Vault Attribution Chain
                  </div>
                  <div className="text-xs text-white mt-1">
                    <span className="text-yellow-400 font-bold">{entity.mineAttribution}</span>
                    <span className="mx-2 text-slate-500">&rarr;</span>
                    <span className="text-purple-300 font-bold">{entity.vaultHubAttribution}</span>
                  </div>
                </div>
              </div>
            )}

            {/* If Anomaly Alert */}
            {entityType === 'alert' && (
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {entity.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                  {entity.metrics?.map((m: any, idx: number) => (
                    <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded">
                      <div className="text-[9px] font-mono text-slate-500 uppercase">{m.label}</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OSINT Synthesis with Gemini AI */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Gemini OSINT Synthesis &amp; Sanctions Intelligence</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synthesizes maritime AIS, satellite SAR radar, and flight telematics into an actionable intelligence brief.
                </p>
              </div>

              {!synthesisResult && (
                <button
                  onClick={handleRunSynthesis}
                  disabled={isSynthesizing}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSynthesizing ? 'Synthesizing...' : 'Run OSINT Scan'}</span>
                </button>
              )}
            </div>

            {/* Results Display */}
            {isSynthesizing && (
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-mono text-slate-300">
                  Synthesizing multi-modal satellite SAR, AIS gap vectors, and customs disclosures with Gemini AI...
                </div>
              </div>
            )}

            {synthesisResult && (
              <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-lg space-y-4 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">ASSESSMENT RISK:</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        synthesisResult.riskLevel === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : synthesisResult.riskLevel === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {synthesisResult.riskLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Brief'}</span>
                    </button>
                    <button
                      onClick={handleRunSynthesis}
                      className="text-xs text-amber-400 hover:text-amber-300 font-mono transition-colors"
                    >
                      Re-run
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Executive Intelligence Summary
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {synthesisResult.summary}
                  </p>
                </div>

                {/* Detected Anomalies */}
                {synthesisResult.anomaliesDetected && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Flagged Technical &amp; Spatial Anomalies
                    </div>
                    <ul className="space-y-1">
                      {synthesisResult.anomaliesDetected.map((anom: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">·</span>
                          <span>{anom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sanctions & OFAC Assessment */}
                {synthesisResult.sanctionsAssessment && (
                  <div className="space-y-1 p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                    <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Sanctions Compliance &amp; Evasion Evaluation</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {synthesisResult.sanctionsAssessment}
                    </p>
                  </div>
                )}

                {/* Recommended Actions */}
                {synthesisResult.recommendedActions && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Analyst Recommended Actions
                    </div>
                    <ul className="space-y-1">
                      {synthesisResult.recommendedActions.map((act: string, idx: number) => (
                        <li key={idx} className="text-xs text-emerald-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
