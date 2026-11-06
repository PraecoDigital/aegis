import React from 'react';
import { Shield, FileText, Globe } from 'lucide-react';
import { CommodityType } from '../types/intelligence';

interface TopNavProps {
  activeTab: 'map' | 'vessels' | 'gold' | 'anomalies' | 'terminals';
  setActiveTab: (tab: 'map' | 'vessels' | 'gold' | 'anomalies' | 'terminals') => void;
  commodityFilter: CommodityType;
  setCommodityFilter: (filter: CommodityType) => void;
  onOpenReportModal: () => void;
  anomalyCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  commodityFilter,
  setCommodityFilter,
  onOpenReportModal,
  anomalyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#map"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('map');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
        >
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
            <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span>Aegis Intelligence</span>
        </a>

        {/* Quiet commodity switcher */}
        <div className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800">
          <button
            onClick={() => setCommodityFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              commodityFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Commodities
          </button>
          <button
            onClick={() => setCommodityFilter('crude')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              commodityFilter === 'crude'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crude & Petroleum
          </button>
          <button
            onClick={() => setCommodityFilter('gold')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              commodityFilter === 'gold'
                ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-800/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gold Bullion
          </button>
        </div>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('map')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'map'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-slate-400'
          }`}
        >
          Spatiotemporal Map
        </button>
        <button
          onClick={() => setActiveTab('vessels')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'vessels'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-slate-400'
          }`}
        >
          Maritime Tankers
        </button>
        <button
          onClick={() => setActiveTab('gold')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'gold'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-slate-400'
          }`}
        >
          Gold Supply Chain
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'anomalies'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span>Dark Fleet & Anomalies</span>
          <span className="font-mono text-xs text-rose-400 tabular-nums">
            ({anomalyCount})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('terminals')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'terminals'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-slate-400'
          }`}
        >
          Terminals & Vaults
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-all shadow-sm shadow-amber-500/20 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Generate Flow Report</span>
        </button>
      </div>
    </header>
  );
};
