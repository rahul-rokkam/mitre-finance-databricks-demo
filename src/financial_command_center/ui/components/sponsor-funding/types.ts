/**
 * Sponsor Funding & Cost Stewardship types
 * Designed to be swap-friendly with future Databricks SQL Warehouse APIs.
 */

export type TimeWindow = "YTD" | "QTD" | "MTD" | "T12M";

export interface FFRDCRef {
  id: string;
  shortName: string;
  fullName: string;
}

export interface SponsorRef {
  id: string;
  name: string;
  agencyGroup: string;
  abbreviation: string;
}

// ============ Stewardship Types ============

export interface IndirectRateTrendPoint {
  month: string;
  actualRate: number;
  negotiatedCap: number;
}

export interface OverheadByFfrdc {
  ffrdcId: string;
  ffrdcName: string;
  overheadRatio: number; // percentage
  target: number; // target ratio
}

export interface SponsorStewardship {
  sponsorId: string;
  sponsorName: string;
  sponsorAbbreviation: string;
  cpi: number; // Cost Performance Index (1.0 = on budget, >1 = under, <1 = over)
  actualSpend: number;
  estimatedSpend: number;
  overheadRatio: number; // overall percentage
  overheadByFfrdc: OverheadByFfrdc[];
  indirectRateCurrent: number;
  indirectRateCap: number;
  indirectRateTrend: IndirectRateTrendPoint[];
  billableUtilizationPct: number; // sponsor-funded work vs admin/overhead
  status: "excellent" | "good" | "attention" | "critical";
}

// ============ Efficiency Types ============

export interface BenchTrendPoint {
  month: string;
  benchPct: number;
}

export interface HeadcountDemandPoint {
  month: string;
  headcount: number;
  demand: number;
}

export interface FfrdcEfficiency {
  ffrdcId: string;
  ffrdcName: string;
  costPerTechFte: number;
  industryBenchmark: number;
  benchPct: number; // unallocated talent percentage
  benchTrend: BenchTrendPoint[];
  headcountVsDemand: HeadcountDemandPoint[];
  currentHeadcount: number;
  currentDemand: number;
}

// ============ Health Types ============

export interface TrendPoint {
  month: string;
  value: number;
}

export interface SponsorHealth {
  sponsorId: string;
  sponsorName: string;
  sponsorAbbreviation: string;
  // Quality
  defectRate: number; // percentage
  defectRateTrend: TrendPoint[];
  reworkPct: number;
  reworkPctTrend: TrendPoint[];
  // Schedule
  onTimeDeliveryPct: number;
  onTimeDeliveryTrend: TrendPoint[];
  // Budget
  budgetVariancePct: number; // positive = under budget, negative = over
  budgetVarianceTrend: TrendPoint[];
  // Satisfaction
  npsScore: number; // -100 to 100
  npsTrend: TrendPoint[];
  // Composite
  healthScore: number; // 0-100
  status: "healthy" | "attention" | "critical";
}

// ============ Renewal Types ============

export interface ContractRenewal {
  sponsorId: string;
  sponsorName: string;
  sponsorAbbreviation: string;
  renewalDate: string; // ISO date
  contractValue: number;
  annualRunRate: number;
  npsScore: number;
  healthStatus: "healthy" | "attention" | "critical";
  riskNotes: string;
  daysUntilRenewal: number;
}

// ============ Snapshot Types ============

export interface SponsorFundingSnapshot {
  asOfDate: string;
  timeWindow: TimeWindow;
  sponsors: SponsorRef[];
  ffrdcs: FFRDCRef[];
  stewardship: SponsorStewardship[];
  efficiency: FfrdcEfficiency[];
  health: SponsorHealth[];
  renewals: ContractRenewal[];
  // Summary KPIs
  summaryKpis: {
    avgCpi: number;
    avgOverheadRatio: number;
    avgBillableUtilization: number;
    avgNps: number;
    sponsorsAtRisk: number;
    upcomingRenewals30Days: number;
    upcomingRenewals90Days: number;
  };
}

