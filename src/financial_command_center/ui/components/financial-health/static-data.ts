/**
 * Static Financial Health Snapshot data
 * This data represents a realistic snapshot of MITRE's six FFRDCs.
 * Will be replaced with Databricks SQL Warehouse queries in production.
 */

import type { FinancialHealthSnapshot } from "./types";

export const staticFinancialHealthSnapshot: FinancialHealthSnapshot = {
  asOfDate: "2024-12-15",
  timeWindow: "YTD",
  ffrdcs: [
    { id: "cems", name: "Center for Enterprise Modernization (CEM)", shortName: "CEM" },
    { id: "cve", name: "Center for Veterans Enterprise (CVE)", shortName: "CVE" },
    { id: "hssedi", name: "Homeland Security Systems Engineering & Development Institute", shortName: "HSSEDI" },
    { id: "jsac", name: "Judiciary Engineering and Modernization Center (JEMC)", shortName: "JEMC" },
    { id: "nsc", name: "National Security Engineering Center (NSEC)", shortName: "NSEC" },
    { id: "cms", name: "CMS Alliance to Modernize Healthcare (CAMH)", shortName: "CAMH" },
  ],
  kpis: [
    {
      id: "ytd-revenue",
      label: "YTD Revenue vs Budget",
      value: 2847000000,
      unit: "currency",
      delta: 2.3,
      deltaLabel: "vs budget",
      status: "green",
      sparklineData: [2100, 2250, 2400, 2520, 2650, 2780, 2847],
    },
    {
      id: "gross-margin",
      label: "Gross Margin %",
      value: 28.4,
      unit: "percent",
      delta: -0.8,
      deltaLabel: "vs prior period",
      status: "yellow",
      sparklineData: [29.2, 29.0, 28.8, 28.6, 28.5, 28.4, 28.4],
    },
    {
      id: "cash-position",
      label: "Cash & Working Capital",
      value: 485000000,
      unit: "currency",
      delta: 5.2,
      deltaLabel: "vs prior month",
      status: "green",
      sparklineData: [420, 435, 450, 462, 475, 480, 485],
    },
    {
      id: "headcount-util",
      label: "Utilization Rate",
      value: 78.5,
      unit: "percent",
      delta: -1.5,
      deltaLabel: "vs target 80%",
      status: "yellow",
      sparklineData: [80.2, 79.8, 79.2, 78.9, 78.6, 78.5, 78.5],
    },
    {
      id: "opex-ratio",
      label: "Operating Expense Ratio",
      value: 18.2,
      unit: "percent",
      delta: 0.4,
      deltaLabel: "vs forecast",
      status: "green",
      sparklineData: [17.8, 17.9, 18.0, 18.1, 18.1, 18.2, 18.2],
    },
    {
      id: "indirect-rate",
      label: "Indirect Cost Rate",
      value: 42.8,
      unit: "percent",
      delta: 0.3,
      deltaLabel: "vs sponsor cap 43%",
      status: "yellow",
      sparklineData: [41.5, 42.0, 42.2, 42.4, 42.6, 42.7, 42.8],
    },
  ],
  revenueBudget: [
    { ffrdcId: "cems", ffrdcName: "CEM", actual: 520000000, budget: 505000000, variance: 15000000, variancePercent: 3.0 },
    { ffrdcId: "cve", ffrdcName: "CVE", actual: 168000000, budget: 190000000, variance: -22000000, variancePercent: -11.6 }, // Red: significantly below budget
    { ffrdcId: "hssedi", ffrdcName: "HSSEDI", actual: 445000000, budget: 430000000, variance: 15000000, variancePercent: 3.5 },
    { ffrdcId: "jsac", ffrdcName: "JEMC", actual: 125000000, budget: 120000000, variance: 5000000, variancePercent: 4.2 },
    { ffrdcId: "nsc", ffrdcName: "NSEC", actual: 1285000000, budget: 1300000000, variance: -15000000, variancePercent: -1.2 },
    { ffrdcId: "cms", ffrdcName: "CAMH", actual: 270000000, budget: 280000000, variance: -10000000, variancePercent: -3.6 }, // Yellow: slightly below budget
  ],
  marginTrend: [
    // More varied margin data - each FFRDC has distinct trajectory and level
    { month: "Jul", cems: 32.5, cve: 18.2, hssedi: 28.0, jsac: 12.5, nsc: 38.5, cms: 22.0 },
    { month: "Aug", cems: 31.0, cve: 15.8, hssedi: 30.5, jsac: 14.2, nsc: 40.2, cms: 20.5 },
    { month: "Sep", cems: 28.5, cve: 19.5, hssedi: 26.0, jsac: 10.8, nsc: 35.8, cms: 24.2 },
    { month: "Oct", cems: 30.2, cve: 12.5, hssedi: 32.8, jsac: 16.5, nsc: 42.5, cms: 18.5 },
    { month: "Nov", cems: 33.8, cve: 20.2, hssedi: 24.5, jsac: 8.2, nsc: 36.0, cms: 26.8 },
    { month: "Dec", cems: 29.5, cve: 16.8, hssedi: 29.2, jsac: 14.8, nsc: 39.5, cms: 21.5 },
  ],
  marginByFFRDC: [
    {
      ffrdcId: "cems",
      ffrdcName: "CEM",
      currentMargin: 28.5,
      priorMargin: 29.5,
      change: -1.0,
      trend: [
        { date: "2024-07", value: 29.5 },
        { date: "2024-08", value: 29.3 },
        { date: "2024-09", value: 29.1 },
        { date: "2024-10", value: 28.9 },
        { date: "2024-11", value: 28.7 },
        { date: "2024-12", value: 28.5 },
      ],
    },
    {
      ffrdcId: "cve",
      ffrdcName: "CVE",
      currentMargin: 26.4,
      priorMargin: 27.2,
      change: -0.8,
      trend: [
        { date: "2024-07", value: 27.2 },
        { date: "2024-08", value: 27.0 },
        { date: "2024-09", value: 26.8 },
        { date: "2024-10", value: 26.6 },
        { date: "2024-11", value: 26.5 },
        { date: "2024-12", value: 26.4 },
      ],
    },
    {
      ffrdcId: "hssedi",
      ffrdcName: "HSSEDI",
      currentMargin: 28.0,
      priorMargin: 28.8,
      change: -0.8,
      trend: [
        { date: "2024-07", value: 28.8 },
        { date: "2024-08", value: 28.6 },
        { date: "2024-09", value: 28.4 },
        { date: "2024-10", value: 28.2 },
        { date: "2024-11", value: 28.1 },
        { date: "2024-12", value: 28.0 },
      ],
    },
    {
      ffrdcId: "jsac",
      ffrdcName: "JEMC",
      currentMargin: 25.8,
      priorMargin: 26.5,
      change: -0.7,
      trend: [
        { date: "2024-07", value: 26.5 },
        { date: "2024-08", value: 26.3 },
        { date: "2024-09", value: 26.2 },
        { date: "2024-10", value: 26.0 },
        { date: "2024-11", value: 25.9 },
        { date: "2024-12", value: 25.8 },
      ],
    },
    {
      ffrdcId: "nsc",
      ffrdcName: "NSEC",
      currentMargin: 29.4,
      priorMargin: 30.2,
      change: -0.8,
      trend: [
        { date: "2024-07", value: 30.2 },
        { date: "2024-08", value: 30.0 },
        { date: "2024-09", value: 29.8 },
        { date: "2024-10", value: 29.6 },
        { date: "2024-11", value: 29.5 },
        { date: "2024-12", value: 29.4 },
      ],
    },
    {
      ffrdcId: "cms",
      ffrdcName: "CAMH",
      currentMargin: 27.1,
      priorMargin: 27.8,
      change: -0.7,
      trend: [
        { date: "2024-07", value: 27.8 },
        { date: "2024-08", value: 27.6 },
        { date: "2024-09", value: 27.5 },
        { date: "2024-10", value: 27.3 },
        { date: "2024-11", value: 27.2 },
        { date: "2024-12", value: 27.1 },
      ],
    },
  ],
  cashPosition: {
    cashBalance: 485000000,
    workingCapital: 312000000,
    dso: 52,
    dpo: 38,
    agingBuckets: [
      { label: "0-30 days", ar: 145000000, ap: 82000000 },
      { label: "31-60 days", ar: 68000000, ap: 45000000 },
      { label: "61-90 days", ar: 32000000, ap: 18000000 },
      { label: "90+ days", ar: 15000000, ap: 8000000 },
    ],
  },
  headcountUtil: [
    { ffrdcId: "cems", ffrdcName: "CEM", headcount: 2450, utilizationPct: 82.5, billableHours: 4042500, totalHours: 4900000 }, // Green: above target
    { ffrdcId: "cve", ffrdcName: "CVE", headcount: 820, utilizationPct: 68.2, billableHours: 1118480, totalHours: 1640000 }, // Red: significantly below target
    { ffrdcId: "hssedi", ffrdcName: "HSSEDI", headcount: 1980, utilizationPct: 81.5, billableHours: 3227400, totalHours: 3960000 }, // Green: above target
    { ffrdcId: "jsac", ffrdcName: "JEMC", headcount: 580, utilizationPct: 72.1, billableHours: 836360, totalHours: 1160000 }, // Red: significantly below target
    { ffrdcId: "nsc", ffrdcName: "NSEC", headcount: 5820, utilizationPct: 84.8, billableHours: 9870720, totalHours: 11640000 }, // Green: above target
    { ffrdcId: "cms", ffrdcName: "CAMH", headcount: 1350, utilizationPct: 76.2, billableHours: 2057400, totalHours: 2700000 }, // Yellow: slightly below target
  ],
  opexTrend: [
    // Varied actual vs budget - some over, some under
    { month: "Jul", actual: 50.5, budget: 52.0 }, // Under budget (green)
    { month: "Aug", actual: 53.2, budget: 51.5 }, // Over budget (red)
    { month: "Sep", actual: 51.0, budget: 52.0 }, // Under budget (green)
    { month: "Oct", actual: 54.5, budget: 52.5 }, // Over budget (red)
    { month: "Nov", actual: 51.2, budget: 52.0 }, // Under budget (green)
    { month: "Dec", actual: 55.8, budget: 53.0 }, // Over budget (red)
  ],
  indirectRates: [
    { ffrdcId: "cems", ffrdcName: "CEM", actualRate: 41.5, capRate: 43.0, variance: -1.5 },
    { ffrdcId: "cve", ffrdcName: "CVE", actualRate: 44.2, capRate: 43.0, variance: 1.2 },
    { ffrdcId: "hssedi", ffrdcName: "HSSEDI", actualRate: 42.8, capRate: 44.0, variance: -1.2 },
    { ffrdcId: "jsac", ffrdcName: "JEMC", actualRate: 43.5, capRate: 44.5, variance: -1.0 },
    { ffrdcId: "nsc", ffrdcName: "NSEC", actualRate: 42.2, capRate: 43.5, variance: -1.3 },
    { ffrdcId: "cms", ffrdcName: "CAMH", actualRate: 43.8, capRate: 43.5, variance: 0.3 },
  ],
  signals: [
    {
      id: "signal-1",
      type: "critical",
      message: "CVE indirect cost rate exceeds sponsor cap by 1.2%",
      kpiId: "indirect-rate",
      ffrdcId: "cve",
      value: 44.2,
      threshold: 43.0,
    },
    {
      id: "signal-2",
      type: "warning",
      message: "CAMH indirect cost rate approaching cap (0.3% margin)",
      kpiId: "indirect-rate",
      ffrdcId: "cms",
      value: 43.8,
      threshold: 43.5,
    },
    {
      id: "signal-3",
      type: "warning",
      message: "JEMC utilization below 75% target",
      kpiId: "headcount-util",
      ffrdcId: "jsac",
      value: 74.8,
      threshold: 75.0,
    },
    {
      id: "signal-4",
      type: "warning",
      message: "DSO trending above 50-day target",
      kpiId: "cash-position",
      value: 52,
      threshold: 50,
    },
    {
      id: "signal-5",
      type: "warning",
      message: "CVE revenue 2.6% below budget YTD",
      kpiId: "ytd-revenue",
      ffrdcId: "cve",
      value: -2.6,
      threshold: -2.0,
    },
  ],
};


