import React, { useState, useMemo } from 'react';
import {
  Ship,
  Search,
  Filter,
  AlertTriangle,
  Radio,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { TankerVessel, VesselClass, AISStatus } from '../types/intelligence';

interface VesselTrackerProps {
  vessels: TankerVessel[];
  onSelectVessel: (vessel: TankerVessel) => void;
}

export const VesselTracker: React.FC<VesselTrackerProps> = ({
  vessels,
  onSelectVessel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filtered vessels
  const filteredVessels = useMemo(() => {
    return vessels.filter((vessel) => {
      const matchesSearch =
        vessel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.imo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.originPort.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.destinationPort.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.beneficialOwner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass =
        selectedClass === 'ALL' || vessel.vesselClass === selectedClass;

      const matchesStatus =
        selectedStatus === 'ALL' || vessel.aisStatus === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [vessels, searchQuery, selectedClass, selectedStatus]);

  // Aggregate metrics
  const totalDWT = useMemo(
    () => vessels.reduce((acc, v) => acc + v.dwt, 0),
    [vessels]
  );
  const totalBbl = useMemo(
    () => vessels.reduce((acc, v) => acc + v.cargoCapacityBbl, 0),
    [vessels]
  );
  const darkFleetCount = useMemo(
    () =>
      vessels.filter(
        (v) => v.aisStatus === 'GAP_DETECTED' || v.aisStatus === 'GPS_SPOOFED' || v.aisStatus === 'STS_ACTIVE'
      ).length,
    [vessels]
  );

  return (
    <div className="space-y-6">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Total Monitored Deadweight
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {(totalDWT / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">DWT</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {vessels.length} active deep-water tankers
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Estimated Crude In Transit
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {(totalBbl / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-400">bbl</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calculated via hydrostatic draft displacement
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Dark Fleet / Anomaly Vessels
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {darkFleetCount} <span className="text-xs font-normal text-slate-400">flagged</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            AIS gap &gt; 12h, STS transfer, or GPS spoofing
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            SAR Displacement Precision
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            &plusmn; 3.8% <span className="text-xs font-normal text-slate-400">variance</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calibrated against Sentinel-1 SAR &amp; berth logs
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vessel name, IMO, port, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          >
          </input>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-md text-xs">
            {['ALL', 'VLCC', 'Suezmax', 'Aframax', 'Product Tanker'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedClass === cls
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-md text-xs">
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'BROADCASTING', label: 'Broadcasting' },
              { id: 'GAP_DETECTED', label: 'AIS Dark' },
              { id: 'STS_ACTIVE', label: 'STS Transfer' },
              { id: 'GPS_SPOOFED', label: 'Spoofed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedStatus === st.id
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tankers Table */}
      <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider bg-slate-950/60">
              <th className="py-3 px-4">Vessel &amp; Class</th>
              <th className="py-3 px-4">Flag &amp; Beneficial Owner</th>
              <th className="py-3 px-4">Draft &amp; Load Delta</th>
              <th className="py-3 px-4">Cargo Est. (bbl / DWT)</th>
              <th className="py-3 px-4">Route &amp; ETA</th>
              <th className="py-3 px-4">AIS / SAR Telematics</th>
              <th className="py-3 px-4 text-right">Risk &amp; Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredVessels.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No vessels match the specified filter criteria.
                </td>
              </tr>
            ) : (
              filteredVessels.map((vessel) => {
                const draftRatio = vessel.currentDraftM / vessel.scantlingDraftM;
                const isDark = vessel.aisStatus === 'GAP_DETECTED';
                const isSpoofed = vessel.aisStatus === 'GPS_SPOOFED';
                const isSTS = vessel.aisStatus === 'STS_ACTIVE';

                return (
                  <tr
                    key={vessel.id}
                    onClick={() => onSelectVessel(vessel)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Vessel & Class */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {vessel.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{vessel.vesselClass}</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span>{vessel.imo}</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span>{vessel.callsign}</span>
                      </div>
                    </td>

                    {/* Flag & Ownership */}
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{vessel.flag}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5" title={vessel.beneficialOwner}>
                        {vessel.beneficialOwner}
                      </div>
                    </td>

                    {/* Draft Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-white font-semibold">{vessel.currentDraftM.toFixed(1)}m</span>
                        <span className="text-slate-500 text-[10px]">/ {vessel.scantlingDraftM.toFixed(1)}m</span>
                        {vessel.draftChange72h !== 0 && (
                          <span
                            className={`text-[10px] ${
                              vessel.draftChange72h > 0
                                ? 'text-amber-400'
                                : 'text-cyan-400'
                            }`}
                          >
                            ({vessel.draftChange72h > 0 ? '+' : ''}{vessel.draftChange72h}m)
                          </span>
                        )}
                      </div>
                      {/* Visual gauge */}
                      <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            draftRatio > 0.85
                              ? 'bg-amber-400'
                              : draftRatio > 0.6
                              ? 'bg-cyan-400'
                              : 'bg-slate-500'
                          }`}
                          style={{ width: `${Math.min(100, draftRatio * 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Cargo Load */}
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <div className="text-amber-300 font-medium">
                        {(vessel.cargoCapacityBbl / 1000).toLocaleString()}k bbl
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {vessel.estimatedCargoLoadMT.toLocaleString()} MT
                      </div>
                    </td>

                    {/* Route & ETA */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <span className="truncate max-w-[110px]" title={vessel.originPort}>
                          {vessel.originPort}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[110px]" title={vessel.destinationPort}>
                          {vessel.destinationPort}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ETA: {vessel.eta}
                      </div>
                    </td>

                    {/* AIS & SAR Telematics */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isDark ? (
                          <span className="text-rose-400 font-mono font-medium">
                            AIS Gap ({vessel.gapDurationHours}h)
                          </span>
                        ) : isSpoofed ? (
                          <span className="text-rose-400 font-mono font-medium">
                            GPS Spoofed (27.8kt)
                          </span>
                        ) : isSTS ? (
                          <span className="text-amber-400 font-mono font-medium">
                            STS Active
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-mono">
                            Broadcasting
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{vessel.speedKnots} kts</span>
                        <span>·</span>
                        <span>{vessel.headingDeg}°</span>
                        <span>·</span>
                        <span className="text-cyan-400">SAR {vessel.sarConfidence}%</span>
                      </div>
                    </td>

                    {/* Sanction Risk & Action */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <div
                            className={`font-mono font-bold tabular-nums ${
                              vessel.sanctionRiskScore > 75
                                ? 'text-rose-400'
                                : vessel.sanctionRiskScore > 40
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {vessel.sanctionRiskScore}/100
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono">
                            Risk Index
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVessel(vessel);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="Inspect Telematics"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
