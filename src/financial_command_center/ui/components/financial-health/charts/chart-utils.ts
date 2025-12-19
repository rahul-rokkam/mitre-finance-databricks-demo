/**
 * Chart utilities for consistent styling across Recharts components
 * Uses shadcn/ui color tokens for theming
 */

// Color palette for FFRDCs - distinct colors that work in both light and dark mode
export const FFRDC_COLORS = {
  cems: "hsl(221, 83%, 53%)", // Blue
  cve: "hsl(142, 71%, 45%)", // Green
  hssedi: "hsl(262, 83%, 58%)", // Purple
  jsac: "hsl(24, 94%, 50%)", // Orange
  nsc: "hsl(346, 77%, 49%)", // Rose
  cms: "hsl(199, 89%, 48%)", // Cyan
} as const;

// Chart color array for iteration
export const CHART_COLORS = [
  "hsl(221, 83%, 53%)", // Blue
  "hsl(142, 71%, 45%)", // Green
  "hsl(262, 83%, 58%)", // Purple
  "hsl(24, 94%, 50%)", // Orange
  "hsl(346, 77%, 49%)", // Rose
  "hsl(199, 89%, 48%)", // Cyan
];

// Semantic colors for status
export const STATUS_COLORS = {
  green: "hsl(142, 71%, 45%)",
  yellow: "hsl(45, 93%, 47%)",
  red: "hsl(0, 84%, 60%)",
};

// Common chart styling
export const chartConfig = {
  // Axis styling
  axisStyle: {
    fontSize: 12,
    fill: "hsl(var(--muted-foreground))",
  },
  // Grid styling
  gridStyle: {
    stroke: "hsl(var(--border))",
    strokeDasharray: "3 3",
  },
  // Tooltip styling
  tooltipStyle: {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--popover-foreground))",
  },
  // Legend styling
  legendStyle: {
    fontSize: 12,
    color: "hsl(var(--muted-foreground))",
  },
};

// Format currency values
export function formatCurrency(value: number, compact = true): string {
  if (compact) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage values
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format delta values with +/- sign
export function formatDelta(value: number, unit: "percent" | "currency" | "days" = "percent"): string {
  const sign = value >= 0 ? "+" : "";
  switch (unit) {
    case "percent":
      return `${sign}${value.toFixed(1)}%`;
    case "currency":
      return `${sign}${formatCurrency(value)}`;
    case "days":
      return `${sign}${value} days`;
    default:
      return `${sign}${value}`;
  }
}

// Get color for FFRDC by ID
export function getFFRDCColor(ffrdcId: string): string {
  return FFRDC_COLORS[ffrdcId as keyof typeof FFRDC_COLORS] || CHART_COLORS[0];
}

// Responsive container defaults
export const responsiveContainerDefaults = {
  width: "100%",
  height: 300,
};


