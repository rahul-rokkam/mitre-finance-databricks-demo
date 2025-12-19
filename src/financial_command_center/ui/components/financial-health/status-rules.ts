/**
 * Status Rules for Financial Health Indicators
 * 
 * Centralized R/Y/G thresholds for consistent status indicators
 * across KPI cards, charts, and the Signals list.
 */

import type { Status, Signal } from "./types";

// Budget variance thresholds (Revenue, Opex)
export const BUDGET_VARIANCE_THRESHOLDS = {
  green: 2, // |variance| <= 2%
  yellow: 5, // 2% < |variance| <= 5%
  // red: > 5%
};

// Gross margin change thresholds (percentage points)
export const MARGIN_CHANGE_THRESHOLDS = {
  green: -0.5, // delta >= -0.5pp
  yellow: -2.0, // -2pp <= delta < -0.5pp
  // red: delta < -2pp
};

// DSO thresholds (days)
export const DSO_THRESHOLDS = {
  green: 45, // <= 45 days
  yellow: 60, // 46-60 days
  // red: > 60 days
};

// Utilization thresholds
export const UTILIZATION_THRESHOLDS = {
  green: 80, // >= 80%
  yellow: 70, // 70-79%
  // red: < 70%
};

// Indirect cost cap thresholds (percentage points from cap)
export const INDIRECT_CAP_THRESHOLDS = {
  green: 0, // actual <= cap
  yellow: 0.5, // within 0.5pp of cap
  // red: exceeds cap
};

/**
 * Get status color for budget variance
 */
export function getBudgetVarianceStatus(variancePercent: number): Status {
  const absVariance = Math.abs(variancePercent);
  if (absVariance <= BUDGET_VARIANCE_THRESHOLDS.green) return "green";
  if (absVariance <= BUDGET_VARIANCE_THRESHOLDS.yellow) return "yellow";
  return "red";
}

/**
 * Get status color for margin change
 */
export function getMarginChangeStatus(changePercent: number): Status {
  if (changePercent >= MARGIN_CHANGE_THRESHOLDS.green) return "green";
  if (changePercent >= MARGIN_CHANGE_THRESHOLDS.yellow) return "yellow";
  return "red";
}

/**
 * Get status color for DSO
 */
export function getDsoStatus(dso: number): Status {
  if (dso <= DSO_THRESHOLDS.green) return "green";
  if (dso <= DSO_THRESHOLDS.yellow) return "yellow";
  return "red";
}

/**
 * Get status color for utilization
 */
export function getUtilizationStatus(utilizationPct: number): Status {
  if (utilizationPct >= UTILIZATION_THRESHOLDS.green) return "green";
  if (utilizationPct >= UTILIZATION_THRESHOLDS.yellow) return "yellow";
  return "red";
}

/**
 * Get status color for indirect cost rate vs cap
 */
export function getIndirectRateStatus(actualRate: number, capRate: number): Status {
  const diff = actualRate - capRate;
  if (diff < 0) return "green";
  if (diff <= INDIRECT_CAP_THRESHOLDS.yellow) return "yellow";
  return "red";
}

/**
 * Get status color classes for Tailwind
 */
export function getStatusColorClasses(status: Status): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case "green":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500",
      };
    case "yellow":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
        dot: "bg-amber-500",
      };
    case "red":
      return {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-500/20",
        dot: "bg-red-500",
      };
  }
}

/**
 * Get status label text
 */
export function getStatusLabel(status: Status): string {
  switch (status) {
    case "green":
      return "On Track";
    case "yellow":
      return "Monitor";
    case "red":
      return "Action Required";
  }
}

/**
 * Get signal priority for sorting
 */
export function getSignalPriority(signal: Signal): number {
  switch (signal.type) {
    case "critical":
      return 0;
    case "warning":
      return 1;
    case "info":
      return 2;
  }
}

/**
 * Sort signals by priority (critical first)
 */
export function sortSignalsByPriority(signals: Signal[]): Signal[] {
  return [...signals].sort((a, b) => getSignalPriority(a) - getSignalPriority(b));
}

/**
 * Get signal type color classes
 */
export function getSignalTypeClasses(type: Signal["type"]): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (type) {
    case "critical":
      return {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        icon: "text-red-500",
      };
    case "warning":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        icon: "text-amber-500",
      };
    case "info":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        icon: "text-blue-500",
      };
  }
}


