import React from 'react';
import {
  Fuel,
  Ship,
  TrendingUp,
  TrendingDown,
  Camera,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { StorageTerminal, BullionVaultHub } from '../types/intelligence';

interface StorageTerminalsProps {
  terminals: StorageTerminal[];
  vaults: BullionVaultHub[];
  onSelectTerminal: (terminal: StorageTerminal) => void;
  onSelectVault: (vault: BullionVaultHub) => void;
}

export const StorageTerminals: React.FC<StorageTerminalsProps> = ({
  terminals,
  vaults,
  onSelectTerminal,
  onSelectVault,
}) => {
  const totalCrudeStorageBbl = terminals.reduce((acc, t) => acc + t.totalCapacityBbl, 0);
  const avgCrudeFill =
    terminals.reduce((acc, t) => acc + t.currentFillPercent, 0) / terminals.length;

  return (
    <div className="space-y-6">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Monitored Terminal Capacity
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {(totalCrudeStorageBbl / 1000000).toFixed(0)}M <span className="text-xs font-normal text-slate-400">bbl</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across 5 major global petroleum hubs
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Mean Storage Utilization
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {avgCrudeFill.toFixed(1)}% <span className="text-xs font-normal text-slate-400">fill rate</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calculated via floating-roof shadow geometry
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Total Floating-Roof Tanks
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {terminals.reduce((acc, t) => acc + t.floatingRoofTanksCount, 0)}{' '}
            <span className="text-xs font-normal text-slate-400">tanks</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Monitored twice daily via Sentinel-2 optical passes
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Berthed Tankers at Terminals
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {terminals.reduce((acc, t) => acc + t.berthedTankersCount, 0)}{' '}
            <span className="text-xs font-normal text-slate-400">vessels</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Concurrent loading/unloading operations
          </div>
        </div>
      </div>

      {/* Section 1: Crude Oil Floating Roof Terminals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-400" />
              <span>Petroleum Storage &amp; Terminal Infrastructure</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High-resolution optical satellite passes model the height of floating tank roofs based on sun angle and interior shadow arc length.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            OPTICAL GEOMETRY: PASS EVERY 12H
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terminals.map((terminal) => {
            const isElevated = terminal.thermalReadingStatus === 'ELEVATED';
            const isOffload = terminal.thermalReadingStatus === 'OFFLOAD_ACTIVE';

            return (
              <div
                key={terminal.id}
                onClick={() => onSelectTerminal(terminal)}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 rounded-lg transition-all cursor-pointer group space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {terminal.name}
                    </h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {terminal.region}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isElevated
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : isOffload
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {terminal.thermalReadingStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Capacity & Fill Gauge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">ESTIMATED FILL:</span>
                    <span className="text-white font-bold tabular-nums">
                      {terminal.currentFillPercent}% ({(terminal.totalCapacityBbl * (terminal.currentFillPercent / 100) / 1000000).toFixed(1)}M bbl)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        terminal.currentFillPercent > 85
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${terminal.currentFillPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                    <span>CAPACITY: {(terminal.totalCapacityBbl / 1000000).toFixed(0)}M bbl</span>
                    <span className="flex items-center gap-1">
                      {terminal.fillTrend24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-amber-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-cyan-400" />
                      )}
                      <span className={terminal.fillTrend24h >= 0 ? 'text-amber-400' : 'text-cyan-400'}>
                        {terminal.fillTrend24h >= 0 ? '+' : ''}{terminal.fillTrend24h}% (24h)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500">FLOATING ROOF TANKS:</span>
                    <div className="text-white font-bold tabular-nums">
                      {terminal.floatingRoofTanksCount} units
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">BERTHED TANKERS:</span>
                    <div className="text-cyan-300 font-bold tabular-nums">
                      {terminal.berthedTankersCount} vessels
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
                  <span>LAST PASS: {terminal.opticalPassTimestamp.split(' ')[1]} UTC</span>
                  <span className="text-emerald-400 group-hover:underline">
                    Terminal Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Sovereign Bullion Vaults & Freeports Overview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>International Bullion Vault Hubs &amp; Freeports</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Correlates armored air mobility arrivals with customs clearing terminal dwell times.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            TOTAL INFLOW: 2.13M OZ / WK
          </span>
        </div>

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
                    {vault.city}, {vault.country}
                  </div>
                </div>
                <span className="text-xs font-mono text-yellow-400 font-bold">
                  {(vault.estimatedWeeklyInflowOz / 1000).toFixed(0)}k oz/wk
                </span>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="text-slate-500 font-mono">REFINERS: </span>
                {vault.primaryRefiners.join(', ')}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
                <span>DWELL: {vault.dwellTimeAvgHours}h</span>
                <span className="text-purple-400 group-hover:underline">
                  Attribution Matrix &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
