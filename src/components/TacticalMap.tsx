import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Play,
  Pause,
  Radio,
  Eye,
  AlertTriangle,
  Plane,
  Ship,
  Pickaxe,
  Building,
  Fuel,
  Maximize2,
} from 'lucide-react';
import {
  TankerVessel,
  ArmoredCargoFlight,
  GoldMineSite,
  BullionVaultHub,
  StorageTerminal,
  CommodityType,
} from '../types/intelligence';
import { ASSETS } from '../data/mockFeeds';

interface TacticalMapProps {
  vessels: TankerVessel[];
  flights: ArmoredCargoFlight[];
  mines: GoldMineSite[];
  vaults: BullionVaultHub[];
  terminals: StorageTerminal[];
  commodityFilter: CommodityType;
  selectedEntity: any | null;
  onSelectEntity: (entity: any, type: 'vessel' | 'flight' | 'mine' | 'vault' | 'terminal') => void;
}

// World landmass polygons (simplified world outlines for standalone high-performance rendering)
const WORLD_LAND_PATHS = [
  // North America
  'M 120 70 L 220 50 L 280 60 L 290 110 L 240 160 L 230 190 L 210 200 L 190 190 L 160 160 L 120 130 Z',
  // South America
  'M 230 210 L 280 230 L 310 280 L 280 370 L 240 370 L 230 300 L 220 240 Z',
  // Europe
  'M 470 60 L 530 65 L 540 110 L 490 130 L 460 110 L 460 70 Z',
  // Africa
  'M 460 140 L 540 140 L 570 200 L 530 310 L 480 320 L 450 220 L 440 170 Z',
  // Asia
  'M 540 60 L 740 60 L 780 120 L 740 180 L 680 180 L 640 210 L 600 180 L 550 140 Z',
  // Australia
  'M 720 260 L 790 260 L 810 320 L 750 330 L 710 300 Z',
  // Scandinavia / UK / Japan islands
  'M 465 80 L 485 80 L 480 100 L 460 95 Z',
  'M 445 85 L 455 85 L 452 105 L 440 100 Z',
  'M 770 120 L 785 130 L 778 155 L 765 145 Z',
  // Greenland
  'M 310 30 L 360 30 L 350 70 L 310 60 Z',
];

// Strategic chokepoints
const CHOKEPOINTS = [
  { name: 'Strait of Hormuz', lat: 26.56, lng: 56.25, note: '21M bbl/day oil chokepoint' },
  { name: 'Strait of Malacca', lat: 1.43, lng: 102.89, note: 'Primary Asia transit & STS hub' },
  { name: 'Bab-el-Mandeb', lat: 12.58, lng: 43.33, note: 'Red Sea entrance / high risk' },
  { name: 'Suez Canal', lat: 30.7, lng: 32.34, note: 'Europe-Asia maritime bypass' },
  { name: 'Panama Canal', lat: 9.08, lng: -79.68, note: 'Atlantic-Pacific lock transits' },
  { name: 'Lakonikos Gulf', lat: 36.65, lng: 22.55, note: 'Active STS dark transshipment zone' },
];

export const TacticalMap: React.FC<TacticalMapProps> = ({
  vessels,
  flights,
  mines,
  vaults,
  terminals,
  commodityFilter,
  selectedEntity,
  onSelectEntity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Layer toggles
  const [showVessels, setShowVessels] = useState(true);
  const [showFlights, setShowFlights] = useState(true);
  const [showMines, setShowMines] = useState(true);
  const [showVaults, setShowVaults] = useState(true);
  const [showTerminals, setShowTerminals] = useState(true);
  const [showChokepoints, setShowChokepoints] = useState(true);
  const [showSarOverlay, setShowSarOverlay] = useState(false);

  // Time scrubber state
  const [timeStep, setTimeStep] = useState<number>(100); // 0 (T-48h) to 100 (Real-Time)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-advance time scrubber
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeStep((prev) => {
          if (prev >= 100) return 0;
          return prev + 2;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Dimensions
  const mapWidth = 960;
  const mapHeight = 500;

  // Convert lat/lng to SVG map coordinates (Equirectangular)
  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Convert SVG coordinates back to lat/lng
  const unproject = (x: number, y: number) => {
    const lng = (x / mapWidth) * 360 - 180;
    const lat = 90 - (y / mapHeight) * 180;
    return {
      lat: Math.max(-85, Math.min(85, lat)),
      lng: Math.max(-180, Math.min(180, lng)),
    };
  };

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - pan.x) / zoom;
      const clickY = (e.clientY - rect.top - pan.y) / zoom;
      setCursorCoords(unproject(clickX, clickY));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.8, Math.min(4.5, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Region jump presets
  const jumpToRegion = (region: 'global' | 'hormuz' | 'malacca' | 'europe' | 'us') => {
    if (region === 'global') {
      resetView();
    } else if (region === 'hormuz') {
      setZoom(3.2);
      const target = project(25.5, 56.0);
      setPan({ x: -target.x * 3.2 + mapWidth / 2, y: -target.y * 3.2 + mapHeight / 2 });
    } else if (region === 'malacca') {
      setZoom(3.4);
      const target = project(2.5, 102.5);
      setPan({ x: -target.x * 3.4 + mapWidth / 2, y: -target.y * 3.4 + mapHeight / 2 });
    } else if (region === 'europe') {
      setZoom(2.8);
      const target = project(48.5, 9.0);
      setPan({ x: -target.x * 2.8 + mapWidth / 2, y: -target.y * 2.8 + mapHeight / 2 });
    } else if (region === 'us') {
      setZoom(2.2);
      const target = project(38.0, -98.0);
      setPan({ x: -target.x * 2.2 + mapWidth / 2, y: -target.y * 2.2 + mapHeight / 2 });
    }
  };

  // Interpolate vessel positions based on timeStep (simulating real-time timeline)
  const displayVessels = useMemo(() => {
    if (commodityFilter === 'gold') return [];
    return vessels.map((vessel) => {
      if (vessel.recentTrack && vessel.recentTrack.length > 1) {
        const track = vessel.recentTrack;
        const index = Math.min(
          track.length - 1,
          Math.floor((timeStep / 100) * (track.length - 1))
        );
        const nextIndex = Math.min(track.length - 1, index + 1);
        const subFraction = (timeStep / 100) * (track.length - 1) - index;

        const lat = track[index][0] + (track[nextIndex][0] - track[index][0]) * subFraction;
        const lng = track[index][1] + (track[nextIndex][1] - track[index][1]) * subFraction;

        return { ...vessel, currentCoords: [lat, lng] as [number, number] };
      }
      return { ...vessel, currentCoords: vessel.coordinates };
    });
  }, [vessels, timeStep, commodityFilter]);

  // Interpolate flight positions based on timeStep
  const displayFlights = useMemo(() => {
    if (commodityFilter === 'crude') return [];
    return flights.map((flight) => {
      const arc = flight.flightPathArc;
      if (arc && arc.length > 1) {
        const factor = (timeStep / 100);
        const totalSegments = arc.length - 1;
        const currentSegment = Math.min(totalSegments - 1, Math.floor(factor * totalSegments));
        const subFactor = factor * totalSegments - currentSegment;

        const p1 = arc[currentSegment];
        const p2 = arc[currentSegment + 1];
        const lat = p1[0] + (p2[0] - p1[0]) * subFactor;
        const lng = p1[1] + (p2[1] - p1[1]) * subFactor;

        return {
          ...flight,
          currentInterpCoords: [lat, lng] as [number, number],
          interpProgress: Math.round(factor * 100),
        };
      }
      return {
        ...flight,
        currentInterpCoords: flight.currentCoordinates,
        interpProgress: flight.progressPercent,
      };
    });
  }, [flights, timeStep, commodityFilter]);

  // SAR overlay position (over Strait of Hormuz / Gulf of Oman)
  const sarOverlayPos = project(24.8, 56.8);

  return (
    <div className="relative w-full h-[620px] bg-[#070a13] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Region presets */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md pointer-events-auto shadow-lg">
          <span className="text-xs font-mono text-slate-400 px-2 uppercase tracking-wider">
            Sector:
          </span>
          <button
            onClick={() => jumpToRegion('global')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
          >
            Global
          </button>
          <button
            onClick={() => jumpToRegion('hormuz')}
            className="px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 rounded transition-colors whitespace-nowrap"
          >
            Hormuz & Gulf
          </button>
          <button
            onClick={() => jumpToRegion('malacca')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
          >
            Malacca STS
          </button>
          <button
            onClick={() => jumpToRegion('europe')}
            className="px-2.5 py-1 text-xs font-medium text-yellow-300 hover:text-yellow-200 hover:bg-yellow-950/40 rounded transition-colors whitespace-nowrap"
          >
            Swiss / UK Vaults
          </button>
          <button
            onClick={() => jumpToRegion('us')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
          >
            Americas
          </button>
        </div>

        {/* Right: Layer Toggles & Zoom */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Layer toggles dropdown / pill cluster */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg text-xs">
            {commodityFilter !== 'gold' && (
              <button
                onClick={() => setShowVessels(!showVessels)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  showVessels
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Maritime Oil Tankers"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Tankers</span>
              </button>
            )}

            {commodityFilter !== 'crude' && (
              <>
                <button
                  onClick={() => setShowFlights(!showFlights)}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    showFlights
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Toggle Cargo Bullion Flights"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Bullion Air</span>
                </button>
                <button
                  onClick={() => setShowMines(!showMines)}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    showMines
                      ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-800/60'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Toggle Gold Mines"
                >
                  <Pickaxe className="w-3.5 h-3.5" />
                  <span>Mines</span>
                </button>
                <button
                  onClick={() => setShowVaults(!showVaults)}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    showVaults
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Toggle Vault Hubs"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Vaults</span>
                </button>
              </>
            )}

            {commodityFilter !== 'gold' && (
              <button
                onClick={() => setShowTerminals(!showTerminals)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  showTerminals
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Oil Storage Terminals"
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>Terminals</span>
              </button>
            )}

            {/* SAR Satellite Overlay Button */}
            <button
              onClick={() => setShowSarOverlay(!showSarOverlay)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                showSarOverlay
                  ? 'bg-rose-900/70 text-rose-200 border border-rose-600/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Toggle Synthetic Aperture Radar (SAR) Satellite Pass Overlay"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>SAR Overlay</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg">
            <button
              onClick={() => handleZoom(0.3)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.3)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Vector Map Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <defs>
            {/* Ocean background pattern grid */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(30, 41, 59, 0.4)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Glowing marker filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#06b6d4" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f59e0b" />
            </filter>
            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f43f5e" />
            </filter>

            {/* Linear gradients for flight arcs */}
            <linearGradient id="flight-arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Deep ocean background */}
          <rect width={mapWidth} height={mapHeight} fill="#070a13" />
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

          {/* Equator & Meridians */}
          <line
            x1="0"
            y1={mapHeight / 2}
            x2={mapWidth}
            y2={mapHeight / 2}
            stroke="rgba(51, 65, 85, 0.4)"
            strokeDasharray="4 4"
            strokeWidth="0.8"
          />
          <line
            x1={mapWidth / 2}
            y1="0"
            x2={mapWidth / 2}
            y2={mapHeight}
            stroke="rgba(51, 65, 85, 0.4)"
            strokeDasharray="4 4"
            strokeWidth="0.8"
          />

          {/* Landmass outlines */}
          <g className="landmasses" fill="#0f172a" stroke="#1e293b" strokeWidth="1">
            {WORLD_LAND_PATHS.map((d, idx) => (
              <path key={idx} d={d} />
            ))}
          </g>

          {/* Chokepoint Zones */}
          {showChokepoints && (
            <g className="chokepoints">
              {CHOKEPOINTS.map((cp, idx) => {
                const pos = project(cp.lat, cp.lng);
                return (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="7"
                      fill="none"
                      stroke="rgba(244, 63, 94, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="2.5"
                      fill="#f43f5e"
                    />
                    <text
                      x={pos.x + 8}
                      y={pos.y + 3}
                      fill="#94a3b8"
                      fontSize="7"
                      fontFamily="JetBrains Mono, monospace"
                      className="group-hover:fill-rose-300"
                    >
                      {cp.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* SAR Satellite Overlay Footprint (Hormuz & Persian Gulf) */}
          {showSarOverlay && (
            <g className="sar-overlay" transform={`translate(${sarOverlayPos.x - 60}, ${sarOverlayPos.y - 40})`}>
              {/* Bounding box with radar crosshairs */}
              <rect
                width="120"
                height="80"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <image
                href={ASSETS.sarMaritime}
                x="0"
                y="0"
                width="120"
                height="80"
                opacity="0.82"
                preserveAspectRatio="xMidYMid slice"
              />
              {/* Telemetry frame tags */}
              <rect x="0" y="0" width="120" height="12" fill="rgba(6, 182, 212, 0.3)" />
              <text
                x="4"
                y="9"
                fill="#ecfeff"
                fontSize="6"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                SENTINEL-1 SAR PASS // HORMUZ OFFSHORE
              </text>
              {/* Radar sweep indicator */}
              <circle
                cx="60"
                cy="45"
                r="30"
                fill="none"
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth="0.8"
              />
              <line
                x1="60"
                y1="45"
                x2="90"
                y2="45"
                stroke="#06b6d4"
                strokeWidth="1.5"
                className="origin-[60px_45px] animate-radar-sweep"
              />
            </g>
          )}

          {/* Flight Path Arcs (Bullion Cargo) */}
          {showFlights &&
            displayFlights.map((flight) => {
              const orig = project(flight.originCoordinates[0], flight.originCoordinates[1]);
              const dest = project(flight.destCoordinates[0], flight.destCoordinates[1]);

              // Calculate bezier curve control point (curved arc)
              const midX = (orig.x + dest.x) / 2;
              const midY = Math.min(orig.y, dest.y) - 40;
              const pathD = `M ${orig.x} ${orig.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`;

              const currentPos = project(
                flight.currentInterpCoords[0],
                flight.currentInterpCoords[1]
              );

              const isSelected = selectedEntity?.id === flight.id;

              return (
                <g key={flight.id} className="flight-group cursor-pointer">
                  {/* Flight trajectory arc */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={flight.squawkAnomaly ? '#f43f5e' : '#f59e0b'}
                    strokeWidth={isSelected ? '2.2' : '1.2'}
                    strokeDasharray={flight.squawkAnomaly ? '3 3' : 'none'}
                    opacity={isSelected ? 1 : 0.65}
                  />

                  {/* Animated Plane Glyph */}
                  <g
                    transform={`translate(${currentPos.x}, ${currentPos.y})`}
                    onClick={() => onSelectEntity(flight, 'flight')}
                  >
                    {flight.squawkAnomaly && (
                      <circle
                        r="12"
                        fill="rgba(244, 63, 94, 0.2)"
                        stroke="#f43f5e"
                        strokeWidth="0.8"
                        className="animate-radar-blip"
                      />
                    )}
                    <circle
                      r={isSelected ? '6' : '4'}
                      fill={flight.squawkAnomaly ? '#f43f5e' : '#f59e0b'}
                      filter="url(#glow-amber)"
                    />
                    {/* Callsign label */}
                    <text
                      x="7"
                      y="-4"
                      fill={flight.squawkAnomaly ? '#fda4af' : '#fde68a'}
                      fontSize="7"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {flight.callsign} ({flight.estimatedBullionOz.toLocaleString()} oz)
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Vessel Tracks & Icons (Crude Tankers) */}
          {showVessels &&
            displayVessels.map((vessel) => {
              const pos = project(vessel.currentCoords[0], vessel.currentCoords[1]);
              const isSelected = selectedEntity?.id === vessel.id;

              const isDark = vessel.aisStatus === 'GAP_DETECTED';
              const isSpoofed = vessel.aisStatus === 'GPS_SPOOFED';
              const isSTS = vessel.aisStatus === 'STS_ACTIVE';

              let markerColor = '#06b6d4'; // normal broadcasting cyan
              if (isDark) markerColor = '#f43f5e'; // red
              if (isSpoofed) markerColor = '#e11d48'; // deep red
              if (isSTS) markerColor = '#fb923c'; // orange

              return (
                <g
                  key={vessel.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectEntity(vessel, 'vessel')}
                  className="cursor-pointer group"
                >
                  {/* Dark fleet gap pulsing halo */}
                  {(isDark || isSTS) && (
                    <circle
                      r="14"
                      fill={isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 146, 60, 0.15)'}
                      stroke={markerColor}
                      strokeWidth="0.8"
                      className="animate-radar-blip"
                    />
                  )}

                  {/* Heading Vector Arrow */}
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin((vessel.headingDeg * Math.PI) / 180) * 12}
                    y2={-Math.cos((vessel.headingDeg * Math.PI) / 180) * 12}
                    stroke={markerColor}
                    strokeWidth="1.4"
                  />

                  {/* Vessel icon / diamond */}
                  <polygon
                    points="0,-5 4,0 0,5 -4,0"
                    fill={markerColor}
                    stroke="#020617"
                    strokeWidth="0.8"
                    filter="url(#glow-cyan)"
                  />

                  {/* Label */}
                  <text
                    x="8"
                    y="3"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="group-hover:fill-amber-300"
                  >
                    {vessel.name} {isDark ? '[AIS DARK]' : isSTS ? '[STS]' : ''}
                  </text>
                </g>
              );
            })}

          {/* Gold Mines */}
          {showMines &&
            mines.map((mine) => {
              const pos = project(mine.coordinates[0], mine.coordinates[1]);
              const isSelected = selectedEntity?.id === mine.id;
              return (
                <g
                  key={mine.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectEntity(mine, 'mine')}
                  className="cursor-pointer group"
                >
                  {/* Mine intensity ring */}
                  <circle
                    r={isSelected ? '8' : '5'}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="1"
                    strokeDasharray="2 1"
                  />
                  <rect
                    x="-2.5"
                    y="-2.5"
                    width="5"
                    height="5"
                    fill="#eab308"
                    transform="rotate(45)"
                  />
                  <text
                    x="8"
                    y="3"
                    fill="#fef08a"
                    fontSize="6.5"
                    fontFamily="JetBrains Mono, monospace"
                    className="group-hover:fill-white"
                  >
                    {mine.name.split(' ')[0]} ({mine.annualOutputMoz}Moz)
                  </text>
                </g>
              );
            })}

          {/* Bullion Vault Hubs */}
          {showVaults &&
            vaults.map((vault) => {
              const pos = project(vault.coordinates[0], vault.coordinates[1]);
              const isSelected = selectedEntity?.id === vault.id;
              return (
                <g
                  key={vault.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectEntity(vault, 'vault')}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? '9' : '6'}
                    fill="rgba(168, 85, 247, 0.25)"
                    stroke="#a855f7"
                    strokeWidth="1.2"
                  />
                  <circle cx="0" cy="0" r="2.5" fill="#c084fc" />
                  <text
                    x="9"
                    y="3"
                    fill="#e9d5ff"
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    className="group-hover:fill-white"
                  >
                    VAULT: {vault.city}
                  </text>
                </g>
              );
            })}

          {/* Storage Terminals */}
          {showTerminals &&
            terminals.map((term) => {
              const pos = project(term.coordinates[0], term.coordinates[1]);
              const isSelected = selectedEntity?.id === term.id;
              return (
                <g
                  key={term.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectEntity(term, 'terminal')}
                  className="cursor-pointer group"
                >
                  <rect
                    x="-4"
                    y="-4"
                    width="8"
                    height="8"
                    fill="rgba(16, 185, 129, 0.25)"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text
                    x="7"
                    y="3"
                    fill="#6ee7b7"
                    fontSize="6.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {term.name.split(' ')[0]} ({term.currentFillPercent}%)
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Bottom Timeline & Telemetry Scrubber Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg pointer-events-auto">
        {/* Playback Controls & Timeline Scrubber */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors"
            title={isPlaying ? 'Pause Playback' : 'Simulate Temporal Playback'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
              T-48h
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={timeStep}
              onChange={(e) => setTimeStep(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider shrink-0">
              {timeStep === 100 ? 'REAL-TIME LIVE' : `T-${Math.round((100 - timeStep) * 0.48)}h`}
            </span>
          </div>
        </div>

        {/* Live Coordinate Crosshairs & Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
          {cursorCoords && (
            <div className="hidden sm:block">
              <span className="text-slate-500">CURSOR: </span>
              <span className="text-slate-200 tabular-nums">
                {cursorCoords.lat.toFixed(2)}°N, {cursorCoords.lng.toFixed(2)}°E
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-500">INGESTION LATENCY:</span>
            <span className="text-emerald-400 font-bold tabular-nums">42s</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">ACTIVE TRACKS:</span>
            <span className="text-white font-bold tabular-nums">
              {displayVessels.length + displayFlights.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
