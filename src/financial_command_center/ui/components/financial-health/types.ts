/**
 * Financial Health Snapshot data contracts
 * These types define the shape of data for the Financial Health dashboard.
 * Currently backed by static data, but designed to be swap-friendly with
 * Databricks SQL Warehouse-backed APIs.
 */

export type Status = "green" | "yellow" | "red";

export type TimeWindow = "YTD" | "QTD" | "MTD" | "T12M";

export interface FFRDC {
  id: string;
  name: string;
  shortName: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit: "currency" | "percent" | "days" | "count" | "ratio";
  delta: number;
  deltaLabel: string;
  status: Status;
  sparklineData?: number[];
}

export interface TimePoint {
  date: string;
  value: number;
}

export interface RevenueBudgetByFFRDC {
  ffrdcId: string;
  ffrdcName: string;
  actual: number;
  budget: number;
  variance: number;
  variancePercent: number;
}

export interface MarginDataPoint {
  month: string;
  [ffrdcId: string]: number | string; // ffrdcId keys with margin values
}

export interface MarginByFFRDC {
  ffrdcId: string;
  ffrdcName: string;
  currentMargin: number;
  priorMargin: number;
  change: number;
  trend: TimePoint[];
}

export interface AgingBucket {
  label: string;
  ar: number;
  ap: number;
}

export interface CashPosition {
  cashBalance: number;
  workingCapital: number;
  dso: number;
  dpo: number;
  agingBuckets: AgingBucket[];
}

export interface HeadcountUtilByFFRDC {
  ffrdcId: string;
  ffrdcName: string;
  headcount: number;
  utilizationPct: number;
  billableHours: number;
  totalHours: number;
}

export interface OpexData {
  month: string;
  actual: number;
  forecast: number;
  budget: number;
}

export interface IndirectRateByFFRDC {
  ffrdcId: string;
  ffrdcName: string;
  actualRate: number;
  capRate: number;
  variance: number;
}

export interface Signal {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  kpiId: string;
  ffrdcId?: string;
  value?: number;
  threshold?: number;
}

export interface FinancialHealthSnapshot {
  asOfDate: string;
  timeWindow: TimeWindow;
  ffrdcs: FFRDC[];
  kpis: KpiMetric[];
  revenueBudget: RevenueBudgetByFFRDC[];
  marginTrend: MarginDataPoint[];
  marginByFFRDC: MarginByFFRDC[];
  cashPosition: CashPosition;
  headcountUtil: HeadcountUtilByFFRDC[];
  opexTrend: OpexData[];
  indirectRates: IndirectRateByFFRDC[];
  signals: Signal[];
}


