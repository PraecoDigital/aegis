export type CommodityType = 'all' | 'crude' | 'gold';

export type VesselClass = 'VLCC' | 'Suezmax' | 'Aframax' | 'Product Tanker';

export type AISStatus = 'BROADCASTING' | 'GAP_DETECTED' | 'GPS_SPOOFED' | 'STS_ACTIVE';

export interface TankerVessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  callsign: string;
  vesselClass: VesselClass;
  flag: string;
  flagCode: string;
  dwt: number; // Deadweight tonnage (metric tons)
  cargoCapacityBbl: number; // Barrels
  currentDraftM: number;
  scantlingDraftM: number;
  draftChange72h: number; // e.g. -4.8m (unloaded) or +6.2m (loaded)
  estimatedCargoLoadMT: number;
  speedKnots: number;
  headingDeg: number;
  coordinates: [number, number]; // [lat, lng]
  originPort: string;
  destinationPort: string;
  eta: string;
  aisStatus: AISStatus;
  gapDurationHours?: number;
  sarVerified: boolean;
  sarConfidence: number; // 0 - 100%
  beneficialOwner: string;
  commercialOperator: string;
  sanctionRiskScore: number; // 0 - 100
  recentTrack: [number, number][]; // lat, lng points
  notes: string;
}

export interface StorageTerminal {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number];
  totalCapacityBbl: number;
  currentFillPercent: number;
  fillTrend24h: number; // percent change
  floatingRoofTanksCount: number;
  berthedTankersCount: number;
  opticalPassTimestamp: string;
  thermalReadingStatus: 'NOMINAL' | 'ELEVATED' | 'OFFLOAD_ACTIVE';
}

export interface GoldMineSite {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  operator: string;
  annualOutputMoz: number; // Million ounces
  sarOperationalIntensity: number; // 0 - 100%
  surfaceDisplacementMmPerMonth: number;
  activeHaulTrucks: number;
  adjacentAirportCode: string;
  adjacentAirportName: string;
  securityAlertLevel: 'NORMAL' | 'ELEVATED_TRANSPORT' | 'CONVOY_DISPATCHED';
  lastSatellitePass: string;
  notes: string;
}

export interface ArmoredCargoFlight {
  id: string;
  callsign: string;
  aircraftType: string; // e.g. Boeing 747-400F
  tailNumber: string;
  operator: string;
  originAirport: string;
  originName: string;
  destinationAirport: string;
  destinationName: string;
  vaultHubAttribution: string;
  mineAttribution: string;
  attributionConfidence: number; // percentage
  altitudeFt: number;
  groundSpeedKts: number;
  headingDeg: number;
  currentCoordinates: [number, number];
  originCoordinates: [number, number];
  destCoordinates: [number, number];
  flightPathArc: [number, number][];
  progressPercent: number;
  estimatedBullionOz: number; // Fine troy ounces
  estimatedValueUsd: number;
  squawkCode: string;
  squawkAnomaly: boolean;
  eta: string;
}

export interface BullionVaultHub {
  id: string;
  name: string;
  city: string;
  country: string;
  airportCode: string;
  coordinates: [number, number];
  estimatedWeeklyInflowOz: number;
  primaryRefiners: string[];
  securityClass: string;
  dwellTimeAvgHours: number;
  activeInflowAlerts: number;
}

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MONITORED';

export interface AnomalyAlert {
  id: string;
  title: string;
  commodity: 'crude' | 'gold';
  severity: AnomalySeverity;
  category: 'AIS_DARK' | 'STS_TRANSFER' | 'GPS_SPOOFING' | 'CARGO_FLIGHT_DIVERGENCE' | 'MINE_SURGE' | 'CUSTOMS_DISCREPANCY';
  entityId: string;
  entityName: string;
  timestamp: string;
  locationDescription: string;
  coordinates: [number, number];
  description: string;
  sarEvidenceImage?: string;
  opticalEvidenceImage?: string;
  metrics: {
    label: string;
    value: string;
  }[];
  geminiAnalyzed?: boolean;
}

export interface FlowReportSummary {
  title: string;
  classification: string;
  generatedAt: string;
  executiveSummary: string;
  keyFindings: string[];
  corridorBreakdown: {
    corridor: string;
    status: string;
    notes: string;
  }[];
  complianceAlert: string;
}
