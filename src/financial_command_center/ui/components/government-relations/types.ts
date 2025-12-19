/**
 * Government Relations & Strategic Positioning types
 * Designed to be swap-friendly with future Databricks SQL Warehouse APIs.
 */

export type TimeWindow = "YTD" | "QTD" | "MTD" | "T12M";
export type FiscalYear = "FY24" | "FY25" | "FY26";

// ============ Mission Area Types ============

export type MissionArea =
  | "Defense"
  | "Cybersecurity"
  | "Health"
  | "Aviation"
  | "Climate"
  | "Homeland Security"
  | "Intelligence";

export interface MissionAreaRef {
  id: string;
  name: MissionArea;
  description: string;
}

// ============ Competitor Types ============

export interface CompetitorRef {
  id: string;
  name: string;
  abbreviation: string;
  type: "FFRDC" | "UARC" | "Industry";
}

// ============ Market Share Types ============

export interface CompetitorShare {
  competitorId: string;
  competitorName: string;
  competitorAbbreviation: string;
  share: number; // percentage
}

export interface MissionAreaMarketShare {
  missionAreaId: string;
  missionAreaName: MissionArea;
  totalAvailableMarket: number; // $ value
  mitreShare: number; // percentage
  mitreRevenue: number; // $ value
  competitorShares: CompetitorShare[];
  growthTrajectory: number; // YoY % change in TAM
  mitreGrowthTrajectory: number; // YoY % change in MITRE's share
}

// ============ Win/Loss Types ============

export interface WinLossRecord {
  competitorId: string;
  competitorName: string;
  competitorAbbreviation: string;
  wins: number;
  losses: number;
  netWins: number;
  winRate: number; // percentage
  totalOpportunities: number;
  recentTrend: "improving" | "stable" | "declining";
}

export interface WinLossByMissionArea {
  missionAreaId: string;
  missionAreaName: MissionArea;
  wins: number;
  losses: number;
  winRate: number;
}

// ============ Capability Gap Types ============

export type GapSeverity = "critical" | "high" | "medium" | "low";
export type GapStatus = "identified" | "addressing" | "resolved";

export interface CapabilityGap {
  id: string;
  capability: string;
  description: string;
  missionAreas: MissionArea[];
  severity: GapSeverity;
  status: GapStatus;
  sponsorDemand: number; // count of sponsors requesting
  estimatedImpact: number; // $ opportunity if filled
  identifiedDate: string; // ISO date
  targetResolutionDate?: string; // ISO date
}

// ============ Pipeline Types ============

export type PipelineStage =
  | "Sourcing"
  | "Screening"
  | "Due Diligence"
  | "Negotiation"
  | "Closed";

export type PipelineType = "Acquisition" | "Partnership" | "Investment";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface PipelineItem {
  id: string;
  name: string;
  type: PipelineType;
  description: string;
  capabilityGapAddressed: string;
  missionAreas: MissionArea[];
  stage: PipelineStage;
  confidenceLevel: ConfidenceLevel;
  estimatedImpact: number; // $ revenue impact
  strategicValue: number; // 1-10 score
  estimatedCost: number; // $ acquisition/investment cost
  complexity: number; // 1-10 score
  expectedCloseDate?: string; // ISO date
  leadOwner: string;
  lastUpdated: string; // ISO date
  notes?: string;
}

// ============ Initiative Types ============

export type InitiativeType =
  | "Legislation"
  | "Executive Order"
  | "Budget Request"
  | "Policy Change";

export type InitiativeImpact = "positive" | "neutral" | "negative";

export interface GovernmentInitiative {
  id: string;
  title: string;
  type: InitiativeType;
  description: string;
  affectedSponsors: string[];
  affectedMissionAreas: MissionArea[];
  budgetImpact: number; // $ change
  impact: InitiativeImpact;
  effectiveDate?: string; // ISO date
  source: string;
  dateIdentified: string; // ISO date
}

// ============ Snapshot Types ============

export interface GovernmentRelationsSnapshot {
  asOfDate: string;
  timeWindow: TimeWindow;
  fiscalYear: FiscalYear;

  // Reference data
  missionAreas: MissionAreaRef[];
  competitors: CompetitorRef[];

  // Competitive Positioning
  marketShare: MissionAreaMarketShare[];
  winLossRecords: WinLossRecord[];
  winLossByMissionArea: WinLossByMissionArea[];
  capabilityGaps: CapabilityGap[];

  // Strategic Pipeline
  pipeline: PipelineItem[];
  initiatives: GovernmentInitiative[];

  // Summary KPIs
  summaryKpis: {
    overallMarketShare: number; // percentage
    marketShareTrend: number; // YoY change
    totalAddressableMarket: number; // $ value
    mitreRevenue: number; // $ value
    overallWinRate: number; // percentage
    winRateTrend: number; // YoY change
    activePipelineValue: number; // $ value
    pipelineItemsCount: number;
    criticalGapsCount: number;
    upcomingInitiativesCount: number;
  };
}

