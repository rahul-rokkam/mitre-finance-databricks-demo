/**
 * Static mock data for Risk & Compliance Monitoring
 * Designed to be swap-friendly with Databricks SQL Warehouse-backed APIs.
 */

import type { RiskComplianceSnapshot } from "./types";

export const staticRiskComplianceSnapshot: RiskComplianceSnapshot = {
  asOfDate: new Date().toISOString(),
  timeWindow: "YTD",
  ffrdcs: [
    { id: "cems", name: "Center for Enterprise Modernization", shortName: "CEMS" },
    { id: "cve", name: "Center for Veterans Enterprise", shortName: "CVE" },
    { id: "hssedi", name: "Homeland Security Systems Engineering", shortName: "HSSEDI" },
    { id: "jsac", name: "Judiciary Systems Advisory Center", shortName: "JSAC" },
    { id: "nsc", name: "National Security Center", shortName: "NSC" },
    { id: "cms", name: "Centers for Medicare & Medicaid Services", shortName: "CMS" },
  ],

  // ============ Audit & Control Dashboard ============
  auditControl: {
    openFindingsCount: 23,
    avgFindingAgeDays: 42,
    findingsOver90Days: 5,
    controlsEffectivePercent: 87.3,
    
    findingsAging: [
      { bucket: "0-30 days", count: 8, riskWeighted: 12 },
      { bucket: "31-60 days", count: 6, riskWeighted: 18 },
      { bucket: "61-90 days", count: 4, riskWeighted: 16 },
      { bucket: ">90 days", count: 5, riskWeighted: 35 },
    ],
    
    rootCauseTags: [
      { tag: "Process Gap", count: 7, percentage: 30.4 },
      { tag: "Training Deficiency", count: 5, percentage: 21.7 },
      { tag: "System Limitation", count: 4, percentage: 17.4 },
      { tag: "Documentation", count: 3, percentage: 13.0 },
      { tag: "Staffing", count: 2, percentage: 8.7 },
      { tag: "Other", count: 2, percentage: 8.7 },
    ],
    
    controlEffectiveness: [
      { domain: "Financial Reporting", effectiveCount: 18, needsImprovementCount: 2, ineffectiveCount: 0, effectivenessRate: 90 },
      { domain: "Revenue Recognition", effectiveCount: 12, needsImprovementCount: 3, ineffectiveCount: 1, effectivenessRate: 75 },
      { domain: "Procurement", effectiveCount: 15, needsImprovementCount: 1, ineffectiveCount: 0, effectivenessRate: 94 },
      { domain: "Time & Labor", effectiveCount: 10, needsImprovementCount: 2, ineffectiveCount: 1, effectivenessRate: 77 },
      { domain: "IT General Controls", effectiveCount: 22, needsImprovementCount: 2, ineffectiveCount: 0, effectivenessRate: 92 },
      { domain: "Contract Compliance", effectiveCount: 14, needsImprovementCount: 1, ineffectiveCount: 0, effectivenessRate: 93 },
    ],
    
    revRecSchedule: [
      { month: "Jan", costReimbursable: 45.2, fixedPrice: 12.5, timeAndMaterials: 8.3, milestone: 5.1 },
      { month: "Feb", costReimbursable: 47.8, fixedPrice: 11.2, timeAndMaterials: 9.1, milestone: 3.2 },
      { month: "Mar", costReimbursable: 52.1, fixedPrice: 14.3, timeAndMaterials: 8.7, milestone: 8.5 },
      { month: "Apr", costReimbursable: 48.9, fixedPrice: 13.1, timeAndMaterials: 9.4, milestone: 4.2 },
      { month: "May", costReimbursable: 51.3, fixedPrice: 12.8, timeAndMaterials: 8.9, milestone: 6.7 },
      { month: "Jun", costReimbursable: 54.7, fixedPrice: 15.2, timeAndMaterials: 10.1, milestone: 9.3 },
      { month: "Jul", costReimbursable: 49.2, fixedPrice: 13.7, timeAndMaterials: 9.6, milestone: 5.8 },
      { month: "Aug", costReimbursable: 53.4, fixedPrice: 14.1, timeAndMaterials: 10.3, milestone: 7.1 },
      { month: "Sep", costReimbursable: 56.8, fixedPrice: 16.2, timeAndMaterials: 11.2, milestone: 10.5 },
      { month: "Oct", costReimbursable: 52.1, fixedPrice: 14.8, timeAndMaterials: 9.8, milestone: 6.4 },
      { month: "Nov", costReimbursable: 50.6, fixedPrice: 13.9, timeAndMaterials: 9.2, milestone: 5.9 },
      { month: "Dec", costReimbursable: 58.3, fixedPrice: 17.1, timeAndMaterials: 12.4, milestone: 11.2 },
    ],
    
    complianceCalendar: [
      { id: "cc1", title: "Annual A-133 Audit", type: "audit", dueDate: "2025-01-15", sponsor: "DCAA", status: "upcoming", daysUntilDue: 27 },
      { id: "cc2", title: "DCAA Incurred Cost Submission", type: "filing", dueDate: "2025-01-31", sponsor: "DCAA", status: "upcoming", daysUntilDue: 43 },
      { id: "cc3", title: "SF-SAC Certification", type: "certification", dueDate: "2025-02-15", sponsor: "Federal", status: "upcoming", daysUntilDue: 58 },
      { id: "cc4", title: "Quarterly CAS Review", type: "review", dueDate: "2025-01-20", sponsor: "Internal", status: "in_progress", daysUntilDue: 32 },
      { id: "cc5", title: "DoD Sponsor Certification", type: "certification", dueDate: "2025-02-28", sponsor: "DoD", status: "upcoming", daysUntilDue: 71 },
      { id: "cc6", title: "Internal Controls Assessment", type: "audit", dueDate: "2025-03-15", sponsor: "Internal", status: "upcoming", daysUntilDue: 86 },
      { id: "cc7", title: "GSA Schedule Review", type: "review", dueDate: "2024-12-28", sponsor: "GSA", status: "overdue", daysUntilDue: -9 },
      { id: "cc8", title: "Indirect Rate Proposal", type: "filing", dueDate: "2025-01-10", sponsor: "DCAA", status: "in_progress", daysUntilDue: 22 },
    ],
    
    recentFindings: [
      { id: "f1", title: "Incomplete timekeeping documentation", description: "Missing supervisor approvals for T&M contracts", rootCause: "Process Gap", ageDays: 15, status: "open", riskLevel: "medium", ffrdcId: "cems", assignee: "J. Smith", dueDate: "2025-01-15" },
      { id: "f2", title: "Revenue recognition timing variance", description: "Milestone billing not aligned with delivery dates", rootCause: "System Limitation", ageDays: 45, status: "in_progress", riskLevel: "high", ffrdcId: "hssedi", assignee: "M. Johnson", dueDate: "2025-01-05" },
      { id: "f3", title: "Subcontractor rate verification gap", description: "Annual rate verification not completed for 3 subs", rootCause: "Training Deficiency", ageDays: 92, status: "open", riskLevel: "high", ffrdcId: "nsc", assignee: "R. Williams", dueDate: "2024-12-15" },
      { id: "f4", title: "Cost pool allocation methodology", description: "Inconsistent allocation bases across FFRDCs", rootCause: "Documentation", ageDays: 28, status: "in_progress", riskLevel: "medium", ffrdcId: "cve", assignee: "K. Davis", dueDate: "2025-01-20" },
      { id: "f5", title: "Travel expense policy compliance", description: "Multiple instances of non-compliant lodging rates", rootCause: "Training Deficiency", ageDays: 67, status: "open", riskLevel: "low", ffrdcId: "jsac", assignee: "L. Brown", dueDate: "2025-01-10" },
    ],
  },

  // ============ Sponsor & Customer Concentration Risk ============
  concentrationRisk: {
    top3ConcentrationPercent: 52.3,
    top10ConcentrationPercent: 78.6,
    herfindahlIndex: 0.142,
    
    topSponsors: [
      { sponsorId: "dod", sponsorName: "Department of Defense", abbreviation: "DoD", revenueAmount: 285000000, revenuePercent: 23.4, cumulativePercent: 23.4, yoyChange: 5.2 },
      { sponsorId: "dhs", sponsorName: "Department of Homeland Security", abbreviation: "DHS", revenueAmount: 198000000, revenuePercent: 16.3, cumulativePercent: 39.7, yoyChange: -2.1 },
      { sponsorId: "hhs", sponsorName: "Health and Human Services", abbreviation: "HHS", revenueAmount: 153000000, revenuePercent: 12.6, cumulativePercent: 52.3, yoyChange: 8.7 },
      { sponsorId: "irs", sponsorName: "Internal Revenue Service", abbreviation: "IRS", revenueAmount: 112000000, revenuePercent: 9.2, cumulativePercent: 61.5, yoyChange: 3.4 },
      { sponsorId: "va", sponsorName: "Veterans Affairs", abbreviation: "VA", revenueAmount: 87000000, revenuePercent: 7.1, cumulativePercent: 68.6, yoyChange: 12.3 },
      { sponsorId: "doj", sponsorName: "Department of Justice", abbreviation: "DOJ", revenueAmount: 54000000, revenuePercent: 4.4, cumulativePercent: 73.0, yoyChange: -5.8 },
      { sponsorId: "treasury", sponsorName: "Department of Treasury", abbreviation: "Treasury", revenueAmount: 42000000, revenuePercent: 3.5, cumulativePercent: 76.5, yoyChange: 1.2 },
      { sponsorId: "ssa", sponsorName: "Social Security Administration", abbreviation: "SSA", revenueAmount: 38000000, revenuePercent: 3.1, cumulativePercent: 79.6, yoyChange: -1.5 },
      { sponsorId: "fema", sponsorName: "Federal Emergency Management Agency", abbreviation: "FEMA", revenueAmount: 31000000, revenuePercent: 2.5, cumulativePercent: 82.1, yoyChange: 18.2 },
      { sponsorId: "gsa", sponsorName: "General Services Administration", abbreviation: "GSA", revenueAmount: 28000000, revenuePercent: 2.3, cumulativePercent: 84.4, yoyChange: -3.2 },
    ],
    
    geographicDiversification: {
      category: "Geographic Region",
      segments: [
        { name: "National Capital Region", value: 520000000, percent: 42.7 },
        { name: "Northeast", value: 195000000, percent: 16.0 },
        { name: "Southeast", value: 168000000, percent: 13.8 },
        { name: "Midwest", value: 134000000, percent: 11.0 },
        { name: "Southwest", value: 112000000, percent: 9.2 },
        { name: "West", value: 89000000, percent: 7.3 },
      ],
    },
    
    missionAreaDiversification: {
      category: "Mission Area",
      segments: [
        { name: "Cybersecurity", value: 298000000, percent: 24.5 },
        { name: "Enterprise IT", value: 267000000, percent: 21.9 },
        { name: "Healthcare IT", value: 189000000, percent: 15.5 },
        { name: "Financial Systems", value: 156000000, percent: 12.8 },
        { name: "Homeland Security", value: 143000000, percent: 11.7 },
        { name: "Defense Systems", value: 112000000, percent: 9.2 },
        { name: "Other", value: 53000000, percent: 4.4 },
      ],
    },
    
    retentionTrend: [
      { year: "2020", retainedSponsors: 42, newSponsors: 8, churnedSponsors: 5, retentionRate: 89.4 },
      { year: "2021", retainedSponsors: 45, newSponsors: 6, churnedSponsors: 3, retentionRate: 93.8 },
      { year: "2022", retainedSponsors: 48, newSponsors: 7, churnedSponsors: 4, retentionRate: 92.3 },
      { year: "2023", retainedSponsors: 51, newSponsors: 5, churnedSponsors: 2, retentionRate: 96.2 },
      { year: "2024", retainedSponsors: 54, newSponsors: 6, churnedSponsors: 3, retentionRate: 94.7 },
    ],
  },

  // ============ Talent & Capability Risk ============
  talentRisk: {
    criticalCapabilitiesAtRisk: 4,
    avgBenchUtilization: 18.3,
    avgTurnoverRate: 12.8,
    
    keyPersonDependencies: [
      { id: "kp1", capability: "FedRAMP Security Assessment", primaryOwner: "Dr. Sarah Chen", backupCount: 1, hasDocumentation: true, riskLevel: "high", ffrdcId: "hssedi", lastReviewDate: "2024-09-15" },
      { id: "kp2", capability: "CAS Compliance Advisory", primaryOwner: "Michael Roberts", backupCount: 0, hasDocumentation: false, riskLevel: "critical", ffrdcId: "cems", lastReviewDate: "2024-06-20" },
      { id: "kp3", capability: "Healthcare Analytics (CMS)", primaryOwner: "Dr. Emily Watson", backupCount: 2, hasDocumentation: true, riskLevel: "medium", ffrdcId: "cms", lastReviewDate: "2024-11-01" },
      { id: "kp4", capability: "DoD Acquisition Systems", primaryOwner: "James Thompson", backupCount: 1, hasDocumentation: true, riskLevel: "high", ffrdcId: "nsc", lastReviewDate: "2024-08-10" },
      { id: "kp5", capability: "Judicial Case Management", primaryOwner: "Patricia Anderson", backupCount: 0, hasDocumentation: false, riskLevel: "critical", ffrdcId: "jsac", lastReviewDate: "2024-04-15" },
      { id: "kp6", capability: "Veteran Benefits Modernization", primaryOwner: "David Kim", backupCount: 2, hasDocumentation: true, riskLevel: "low", ffrdcId: "cve", lastReviewDate: "2024-10-22" },
      { id: "kp7", capability: "Zero Trust Architecture", primaryOwner: "Angela Martinez", backupCount: 1, hasDocumentation: true, riskLevel: "medium", ffrdcId: "hssedi", lastReviewDate: "2024-11-15" },
      { id: "kp8", capability: "Financial Systems Integration", primaryOwner: "Robert Lee", backupCount: 0, hasDocumentation: false, riskLevel: "high", ffrdcId: "cems", lastReviewDate: "2024-07-30" },
    ],
    
    benchUtilization: [
      { ffrdcId: "cems", ffrdcName: "CEMS", totalHeadcount: 485, benchCount: 78, benchPercent: 16.1, status: "healthy" },
      { ffrdcId: "cve", ffrdcName: "CVE", totalHeadcount: 312, benchCount: 71, benchPercent: 22.8, status: "attention" },
      { ffrdcId: "hssedi", ffrdcName: "HSSEDI", totalHeadcount: 567, benchCount: 102, benchPercent: 18.0, status: "healthy" },
      { ffrdcId: "jsac", ffrdcName: "JSAC", totalHeadcount: 198, benchCount: 52, benchPercent: 26.3, status: "critical" },
      { ffrdcId: "nsc", ffrdcName: "NSC", totalHeadcount: 423, benchCount: 68, benchPercent: 16.1, status: "healthy" },
      { ffrdcId: "cms", ffrdcName: "CMS", totalHeadcount: 289, benchCount: 49, benchPercent: 17.0, status: "healthy" },
    ],
    
    turnoverTrend: [
      { ffrdcId: "cems", ffrdcName: "CEMS", period: "2024", turnoverRate: 11.2, voluntaryRate: 8.5, involuntaryRate: 2.7, industryBenchmark: 13.5 },
      { ffrdcId: "cve", ffrdcName: "CVE", period: "2024", turnoverRate: 14.8, voluntaryRate: 12.1, involuntaryRate: 2.7, industryBenchmark: 13.5 },
      { ffrdcId: "hssedi", ffrdcName: "HSSEDI", period: "2024", turnoverRate: 9.7, voluntaryRate: 7.2, involuntaryRate: 2.5, industryBenchmark: 13.5 },
      { ffrdcId: "jsac", ffrdcName: "JSAC", period: "2024", turnoverRate: 18.2, voluntaryRate: 15.6, involuntaryRate: 2.6, industryBenchmark: 13.5 },
      { ffrdcId: "nsc", ffrdcName: "NSC", period: "2024", turnoverRate: 12.3, voluntaryRate: 9.8, involuntaryRate: 2.5, industryBenchmark: 13.5 },
      { ffrdcId: "cms", ffrdcName: "CMS", period: "2024", turnoverRate: 10.5, voluntaryRate: 8.1, involuntaryRate: 2.4, industryBenchmark: 13.5 },
    ],
  },

  // ============ Financial Control Exceptions ============
  controlExceptions: {
    totalOpenExceptions: 18,
    escalatedExceptions: 3,
    covenantBreaches: 0,
    
    glExceptions: [
      { id: "gl1", date: "2024-12-15", description: "Large manual journal entry - Intercompany adjustment", amount: 2450000, account: "1500-IC", ffrdcId: "cems", status: "under_review", severity: "high" },
      { id: "gl2", date: "2024-12-12", description: "Reversal of prior period accrual", amount: 890000, account: "2100-ACC", ffrdcId: "hssedi", status: "resolved", severity: "medium" },
      { id: "gl3", date: "2024-12-10", description: "Unusual vendor payment timing", amount: 567000, account: "2000-AP", ffrdcId: "nsc", status: "open", severity: "medium" },
      { id: "gl4", date: "2024-12-08", description: "Cost transfer between projects", amount: 234000, account: "5100-DL", ffrdcId: "cve", status: "open", severity: "low" },
      { id: "gl5", date: "2024-12-05", description: "Indirect rate adjustment entry", amount: 1120000, account: "6500-OH", ffrdcId: "cms", status: "escalated", severity: "high" },
      { id: "gl6", date: "2024-12-01", description: "Unbilled revenue reclassification", amount: 678000, account: "1300-UB", ffrdcId: "jsac", status: "under_review", severity: "medium" },
    ],
    
    exceptionTrend: [
      { month: "Jul", unusualEntries: 8, failedTests: 3, resolved: 6 },
      { month: "Aug", unusualEntries: 12, failedTests: 5, resolved: 10 },
      { month: "Sep", unusualEntries: 6, failedTests: 2, resolved: 8 },
      { month: "Oct", unusualEntries: 9, failedTests: 4, resolved: 7 },
      { month: "Nov", unusualEntries: 11, failedTests: 3, resolved: 9 },
      { month: "Dec", unusualEntries: 14, failedTests: 6, resolved: 5 },
    ],
    
    failedAuditTests: [
      { controlDomain: "Revenue Recognition", testCount: 24, failedCount: 4, passRate: 83.3 },
      { controlDomain: "Time & Labor", testCount: 18, failedCount: 3, passRate: 83.3 },
      { controlDomain: "Procurement", testCount: 20, failedCount: 1, passRate: 95.0 },
      { controlDomain: "IT General Controls", testCount: 32, failedCount: 2, passRate: 93.8 },
      { controlDomain: "Financial Close", testCount: 16, failedCount: 2, passRate: 87.5 },
      { controlDomain: "Contract Compliance", testCount: 22, failedCount: 3, passRate: 86.4 },
    ],
    
    covenantCompliance: [
      { covenant: "Current Ratio", threshold: 1.25, currentValue: 1.82, status: "compliant", headroom: 0.57, headroomPercent: 45.6 },
      { covenant: "Debt-to-Equity", threshold: 2.0, currentValue: 1.23, status: "compliant", headroom: 0.77, headroomPercent: 38.5 },
      { covenant: "Interest Coverage", threshold: 3.0, currentValue: 5.84, status: "compliant", headroom: 2.84, headroomPercent: 94.7 },
      { covenant: "G&A Rate Cap", threshold: 15.0, currentValue: 13.2, status: "compliant", headroom: 1.8, headroomPercent: 12.0 },
      { covenant: "Indirect Rate Ceiling", threshold: 45.0, currentValue: 42.8, status: "warning", headroom: 2.2, headroomPercent: 4.9 },
    ],
    
    budgetVarianceByFfrdc: [
      { ffrdcId: "cems", ffrdcName: "CEMS", laborVariance: -320000, materialVariance: 85000, subcontractVariance: -145000, overheadVariance: 52000, totalVariance: -328000 },
      { ffrdcId: "cve", ffrdcName: "CVE", laborVariance: 180000, materialVariance: -42000, subcontractVariance: 95000, overheadVariance: -28000, totalVariance: 205000 },
      { ffrdcId: "hssedi", ffrdcName: "HSSEDI", laborVariance: -450000, materialVariance: 120000, subcontractVariance: -280000, overheadVariance: 75000, totalVariance: -535000 },
      { ffrdcId: "jsac", ffrdcName: "JSAC", laborVariance: 95000, materialVariance: 32000, subcontractVariance: -18000, overheadVariance: -15000, totalVariance: 94000 },
      { ffrdcId: "nsc", ffrdcName: "NSC", laborVariance: -210000, materialVariance: -65000, subcontractVariance: 142000, overheadVariance: 38000, totalVariance: -95000 },
      { ffrdcId: "cms", ffrdcName: "CMS", laborVariance: 275000, materialVariance: 48000, subcontractVariance: -92000, overheadVariance: -35000, totalVariance: 196000 },
    ],
  },
};

