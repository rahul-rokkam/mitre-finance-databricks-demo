/**
 * Program Portfolio & Sponsor Funding Analytics types
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
  agencyGroup: string; // e.g., "Defense", "Homeland Security", "Health & Human Services"
  abbreviation: string; // e.g., "DoD", "DHS", "HHS"
}

export interface YearlyFunding {
  year: number;
  funding: number;
}

export interface SponsorFundingAllocation {
  sponsorId: string;
  totalFunding: number;
  byFfrdc: Record<string, number>; // ffrdcId -> funding amount
  ytdFunding: number;
  annualBudget: number;
  trend3y: YearlyFunding[];
  growthPct: number; // YoY growth percentage
}

export interface RateTrendPoint {
  month: string;
  negotiatedRate: number;
  inflation: number;
  laborCost: number;
}

export interface FfrdcCostEffectiveness {
  ffrdcId: string;
  ffrdcName: string;
  revenue: number;
  costOfDelivery: number;
  marginPct: number;
  costPerFte: number;
  headcount: number;
  negotiatedRateIndex: number; // Index where 100 = baseline
  inflationIndex: number;
  laborCostIndex: number;
  rateTrend: RateTrendPoint[];
}

export interface SponsorHealth {
  sponsorId: string;
  sponsorName: string;
  fundingVolume: number;
  cpi: number; // Cost Performance Index (1.0 = on budget, >1 = under budget, <1 = over budget)
  utilizationPct: number;
  runwayMonths: number;
  nextRenewalDate: string; // ISO date
  contractValue: number;
  status: "healthy" | "attention" | "critical";
}

export interface ProgramPortfolioSnapshot {
  asOfDate: string;
  timeWindow: TimeWindow;
  ffrdcs: FFRDCRef[];
  sponsors: SponsorRef[];
  allocations: SponsorFundingAllocation[];
  ffrdcEconomics: FfrdcCostEffectiveness[];
  sponsorHealth: SponsorHealth[];
}

