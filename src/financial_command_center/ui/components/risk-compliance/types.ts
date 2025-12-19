/**
 * Type definitions for Risk & Compliance Monitoring module
 */

export type TimeWindow = "YTD" | "QTD" | "MTD" | "T12M";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type FindingStatus = "open" | "in_progress" | "remediated" | "accepted";
export type ControlStatus = "effective" | "needs_improvement" | "ineffective";
export type ComplianceEventType = "audit" | "filing" | "certification" | "review";

// ============ Audit & Control Dashboard ============

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  rootCause: string;
  ageDays: number;
  status: FindingStatus;
  riskLevel: RiskLevel;
  ffrdcId: string;
  assignee: string;
  dueDate: string;
}

export interface FindingsAgingBucket {
  bucket: string; // e.g., "0-30", "31-60", "61-90", ">90"
  count: number;
  riskWeighted: number;
}

export interface RootCauseTag {
  tag: string;
  count: number;
  percentage: number;
}

export interface ControlEffectiveness {
  domain: string;
  effectiveCount: number;
  needsImprovementCount: number;
  ineffectiveCount: number;
  effectivenessRate: number;
}

export interface RevRecScheduleItem {
  month: string;
  costReimbursable: number;
  fixedPrice: number;
  timeAndMaterials: number;
  milestone: number;
}

export interface ComplianceCalendarEvent {
  id: string;
  title: string;
  type: ComplianceEventType;
  dueDate: string;
  sponsor: string;
  status: "upcoming" | "in_progress" | "completed" | "overdue";
  daysUntilDue: number;
}

export interface AuditControlData {
  openFindingsCount: number;
  avgFindingAgeDays: number;
  findingsOver90Days: number;
  controlsEffectivePercent: number;
  findingsAging: FindingsAgingBucket[];
  rootCauseTags: RootCauseTag[];
  controlEffectiveness: ControlEffectiveness[];
  revRecSchedule: RevRecScheduleItem[];
  complianceCalendar: ComplianceCalendarEvent[];
  recentFindings: AuditFinding[];
}

// ============ Sponsor & Customer Concentration Risk ============

export interface SponsorConcentration {
  sponsorId: string;
  sponsorName: string;
  abbreviation: string;
  revenueAmount: number;
  revenuePercent: number;
  cumulativePercent: number;
  yoyChange: number;
}

export interface DiversificationData {
  category: string; // geography or mission area
  segments: { name: string; value: number; percent: number }[];
}

export interface RetentionDataPoint {
  year: string;
  retainedSponsors: number;
  newSponsors: number;
  churnedSponsors: number;
  retentionRate: number;
}

export interface ConcentrationRiskData {
  topSponsors: SponsorConcentration[];
  geographicDiversification: DiversificationData;
  missionAreaDiversification: DiversificationData;
  retentionTrend: RetentionDataPoint[];
  top3ConcentrationPercent: number;
  top10ConcentrationPercent: number;
  herfindahlIndex: number; // Market concentration index
}

// ============ Talent & Capability Risk ============

export interface KeyPersonDependency {
  id: string;
  capability: string;
  primaryOwner: string;
  backupCount: number;
  hasDocumentation: boolean;
  riskLevel: RiskLevel;
  ffrdcId: string;
  lastReviewDate: string;
}

export interface BenchUtilization {
  ffrdcId: string;
  ffrdcName: string;
  totalHeadcount: number;
  benchCount: number;
  benchPercent: number;
  status: "healthy" | "attention" | "critical";
}

export interface TurnoverDataPoint {
  ffrdcId: string;
  ffrdcName: string;
  period: string;
  turnoverRate: number;
  voluntaryRate: number;
  involuntaryRate: number;
  industryBenchmark: number;
}

export interface TalentRiskData {
  keyPersonDependencies: KeyPersonDependency[];
  benchUtilization: BenchUtilization[];
  turnoverTrend: TurnoverDataPoint[];
  criticalCapabilitiesAtRisk: number;
  avgBenchUtilization: number;
  avgTurnoverRate: number;
}

// ============ Financial Control Exceptions ============

export interface GLException {
  id: string;
  date: string;
  description: string;
  amount: number;
  account: string;
  ffrdcId: string;
  status: "open" | "under_review" | "resolved" | "escalated";
  severity: RiskLevel;
}

export interface ControlExceptionTrend {
  month: string;
  unusualEntries: number;
  failedTests: number;
  resolved: number;
}

export interface FailedAuditTest {
  controlDomain: string;
  testCount: number;
  failedCount: number;
  passRate: number;
}

export interface CovenantCompliance {
  covenant: string;
  threshold: number;
  currentValue: number;
  status: "compliant" | "warning" | "breach";
  headroom: number;
  headroomPercent: number;
}

export interface BudgetVarianceRootCause {
  ffrdcId: string;
  ffrdcName: string;
  laborVariance: number;
  materialVariance: number;
  subcontractVariance: number;
  overheadVariance: number;
  totalVariance: number;
}

export interface ControlExceptionsData {
  glExceptions: GLException[];
  exceptionTrend: ControlExceptionTrend[];
  failedAuditTests: FailedAuditTest[];
  covenantCompliance: CovenantCompliance[];
  budgetVarianceByFfrdc: BudgetVarianceRootCause[];
  totalOpenExceptions: number;
  escalatedExceptions: number;
  covenantBreaches: number;
}

// ============ FFRDC Reference ============

export interface FFRDCRef {
  id: string;
  name: string;
  shortName: string;
}

// ============ Root Snapshot ============

export interface RiskComplianceSnapshot {
  asOfDate: string;
  timeWindow: TimeWindow;
  ffrdcs: FFRDCRef[];
  auditControl: AuditControlData;
  concentrationRisk: ConcentrationRiskData;
  talentRisk: TalentRiskData;
  controlExceptions: ControlExceptionsData;
}

