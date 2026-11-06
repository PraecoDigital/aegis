import React, { useState } from 'react';
import {
  Pickaxe,
  Plane,
  Building,
  ArrowRight,
  AlertTriangle,
  Radio,
  ExternalLink,
  Shield,
  Truck,
  TrendingUp,
} from 'lucide-react';
import {
  GoldMineSite,
  ArmoredCargoFlight,
  BullionVaultHub,
} from '../types/intelligence';
import { ASSETS } from '../data/mockFeeds';

interface GoldTrackerProps {
  mines: GoldMineSite[];
  flights: ArmoredCargoFlight[];
  vaults: BullionVaultHub[];
  onSelectFlight: (flight: ArmoredCargoFlight) => void;
  onSelectMine: (mine: GoldMineSite) => void;
  onSelectVault: (vault: BullionVaultHub) => void;
}

export const GoldTracker: React.FC<GoldTrackerProps> = ({
  mines,
  flights,
  vaults,
  onSelectFlight,
  onSelectMine,
  onSelectVault,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'flights' | 'mines' | 'vaults'>('flights');

  // Total active in-flight bullion valuation
  const totalInFlightOz = flights.reduce((acc, f) => acc + f.estimatedBullionOz, 0);
  const totalInFlightUsd = flights.reduce((acc, f) => acc + f.estimatedValueUsd, 0);

  return (
    <div className="space-y-6">
      {/* Top Gold Flow Analytics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            In-Transit Bullion (Air Cargo)
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-400 mt-1 tabular-nums">
            {(totalInFlightOz / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-400">troy oz</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            &asymp; ${(totalInFlightUsd / 1000000).toFixed(0)}M USD equivalent
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Active Heavy Armored Flights
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {flights.length} <span className="text-xs font-normal text-slate-400">ADS-B tracked</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Boeing 747-400F &amp; MD-11F heavy freighters
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            SAR Displacement Monitored
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {mines.length} <span className="text-xs font-normal text-slate-400">tier-1 mines</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Interferometric radar &amp; haul truck telemetry
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Vault Inflow Rate
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
            2.13M <span className="text-xs font-normal text-slate-400">oz / week</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across Zurich, London, Dubai, Singapore &amp; NY
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('flights')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'flights'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Armored Flight Telematics ({flights.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('mines')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'mines'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Pickaxe className="w-3.5 h-3.5" />
            <span>Mining Operations &amp; SAR ({mines.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('vaults')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'vaults'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Vault Hubs &amp; Freeports ({vaults.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden md:block">
          GEOFENCE: AIRPORT CARGO DWELL &lt; 4.2h
        </div>
      </div>

      {/* VIEW 1: Armored Flights */}
      {activeSubTab === 'flights' && (
        <div className="space-y-4">
          {/* Spotlight Hero Card for High-Security Flight */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-rose-400 font-bold">TACTICAL OSINT LINKAGE</span>
                <span className="text-slate-600">·</span>
                <span>ADS-B / MODE-S ARMORED CORRIDOR</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Mine-Adjacent Air Cargo Corridors to Sovereign Bullion Vaults
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Aegis filters widebody freighter traffic (B747-400F, MD-11F) departing airports nearest to high-output extraction zones (Perth, Johannesburg, Navoi, Salt Lake City). Flight manifests are cross-correlated against refinery receipt records in Zurich, London, and Dubai to predict macro physical bullion movements.
              </p>
            </div>

            <div className="w-full lg:w-72 h-36 rounded-md overflow-hidden relative border border-slate-800 shrink-0">
              <img
                src={ASSETS.armoredCargoAircraft}
                alt="Armored air cargo security escort"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-mono text-slate-300">
                  Cargo apron security escort at tarmac loading
                </span>
              </div>
            </div>
          </div>

          {/* Flights Table */}
          <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider bg-slate-950/60">
                  <th className="py-3 px-4">Flight &amp; Airframe</th>
                  <th className="py-3 px-4">Origin &rarr; Destination</th>
                  <th className="py-3 px-4">Mine &amp; Vault Attribution</th>
                  <th className="py-3 px-4">Est. Bullion Payload</th>
                  <th className="py-3 px-4">Mode-S Telematics</th>
                  <th className="py-3 px-4">Squawk Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {flights.map((flight) => (
                  <tr
                    key={flight.id}
                    onClick={() => onSelectFlight(flight)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Flight & Airframe */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {flight.callsign}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{flight.aircraftType}</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span>{flight.tailNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {flight.operator}
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-white font-mono font-medium">
                        <span>{flight.originAirport}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{flight.destinationAirport}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px] mt-0.5" title={flight.destinationName}>
                        {flight.destinationName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Progress: {flight.progressPercent}% · ETA: {flight.eta.split(' ')[1]}
                      </div>
                    </td>

                    {/* Attribution */}
                    <td className="py-3 px-4">
                      <div className="text-slate-200 truncate max-w-[190px]" title={flight.mineAttribution}>
                        {flight.mineAttribution}
                      </div>
                      <div className="text-[11px] text-purple-300 truncate max-w-[190px] mt-0.5" title={flight.vaultHubAttribution}>
                        &rarr; {flight.vaultHubAttribution}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        Confidence: {flight.attributionConfidence}%
                      </div>
                    </td>

                    {/* Est Bullion Payload */}
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <div className="text-yellow-400 font-bold">
                        {flight.estimatedBullionOz.toLocaleString()} oz
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ${(flight.estimatedValueUsd / 1000000).toFixed(1)}M USD
                      </div>
                    </td>

                    {/* Telematics */}
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <div className="text-slate-200">
                        FL{Math.round(flight.altitudeFt / 100)} ({flight.altitudeFt.toLocaleString()} ft)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {flight.groundSpeedKts} kts · {flight.headingDeg}&deg;
                      </div>
                    </td>

                    {/* Squawk */}
                    <td className="py-3 px-4 font-mono">
                      {flight.squawkAnomaly ? (
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>SQUAWK {flight.squawkCode} (ALERT)</span>
                        </div>
                      ) : (
                        <div className="text-emerald-400">
                          Squawk {flight.squawkCode}
                        </div>
                      )}
                    </td>

                    {/* Inspect */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFlight(flight);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Gold Mines */}
      {activeSubTab === 'mines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mines.map((mine) => (
              <div
                key={mine.id}
                onClick={() => onSelectMine(mine)}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 rounded-lg transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                      {mine.name}
                    </h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {mine.country}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      mine.securityAlertLevel === 'CONVOY_DISPATCHED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : mine.securityAlertLevel === 'ELEVATED_TRANSPORT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {mine.securityAlertLevel.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500">ANNUAL OUTPUT:</span>
                    <div className="text-yellow-400 font-bold tabular-nums">
                      {mine.annualOutputMoz} Moz / yr
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">SAR INTENSITY:</span>
                    <div className="text-emerald-400 font-bold tabular-nums">
                      {mine.sarOperationalIntensity}% nominal
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">SURFACE SHIFT:</span>
                    <div className="text-white font-bold tabular-nums">
                      {mine.surfaceDisplacementMmPerMonth} mm/mo
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ACTIVE HAUL TRUCKS:</span>
                    <div className="text-amber-300 font-bold tabular-nums">
                      {mine.activeHaulTrucks} units
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                  {mine.notes}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>AIRPORT: {mine.adjacentAirportCode}</span>
                  <span className="text-amber-400 group-hover:underline flex items-center gap-1">
                    Inspect SAR passes &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Vault Hubs */}
      {activeSubTab === 'vaults' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault) => (
              <div
                key={vault.id}
                onClick={() => onSelectVault(vault)}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 rounded-lg transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {vault.name}
                    </h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {vault.city}, {vault.country} ({vault.airportCode})
                    </div>
                  </div>
                  <div className="p-1.5 bg-purple-950/60 border border-purple-800/50 rounded text-purple-300">
                    <Building className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500">WEEKLY INFLOW:</span>
                    <div className="text-yellow-400 font-bold tabular-nums">
                      {(vault.estimatedWeeklyInflowOz / 1000).toFixed(0)}k oz
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">AVG CARGO DWELL:</span>
                    <div className="text-white font-bold tabular-nums">
                      {vault.dwellTimeAvgHours} hours
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  <span className="text-slate-500 font-mono">PRIMARY REFINERS:</span>
                  <div className="text-slate-300 mt-0.5">
                    {vault.primaryRefiners.join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">{vault.securityClass}</span>
                  <span className="text-purple-400 group-hover:underline">
                    Correlate inflows &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
