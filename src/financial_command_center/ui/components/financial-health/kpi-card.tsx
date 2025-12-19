import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import type { KpiMetric } from "./types";
import { StatusPill } from "./status-pill";
import { formatCurrency, formatPercent } from "./charts/chart-utils";

// Simple inline sparkline using SVG (no extra dependency)
function MiniSparkline({ data, status }: { data: number[]; status: KpiMetric["status"] }) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor =
    status === "green"
      ? "hsl(142, 71%, 45%)"
      : status === "yellow"
      ? "hsl(45, 93%, 47%)"
      : "hsl(0, 84%, 60%)";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

interface KpiCardProps {
  kpi: KpiMetric;
  onClick?: () => void;
  className?: string;
}

export function KpiCard({ kpi, onClick, className }: KpiCardProps) {
  const { label, value, unit, delta, deltaLabel, status, sparklineData } = kpi;

  // Format the value based on unit
  const formattedValue = (() => {
    switch (unit) {
      case "currency":
        return formatCurrency(value);
      case "percent":
        return formatPercent(value);
      case "days":
        return `${value} days`;
      case "count":
        return value.toLocaleString();
      case "ratio":
        return value.toFixed(2);
      default:
        return value.toString();
    }
  })();

  // Format delta
  const formattedDelta = (() => {
    const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
    if (unit === "percent" || unit === "ratio") {
      return `${sign}${Math.abs(delta).toFixed(1)}%`;
    }
    if (unit === "currency") {
      return `${sign}${formatCurrency(Math.abs(delta))}`;
    }
    if (unit === "days") {
      return `${sign}${Math.abs(delta)} days`;
    }
    return `${sign}${Math.abs(delta)}`;
  })();

  // Delta trend icon
  const DeltaIcon =
    delta > 0.1 ? TrendingUp : delta < -0.1 ? TrendingDown : Minus;

  // Delta color based on context (some KPIs are better when lower)
  const isPositiveGood = !["indirect-rate", "opex-ratio"].includes(kpi.id);
  const deltaColor =
    delta === 0
      ? "text-muted-foreground"
      : (delta > 0) === isPositiveGood
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate mb-1">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {formattedValue}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn("flex items-center gap-1 text-sm", deltaColor)}>
                <DeltaIcon className="h-3.5 w-3.5" />
                <span className="font-medium">{formattedDelta}</span>
              </div>
              <span className="text-xs text-muted-foreground">{deltaLabel}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusPill status={status} showLabel={false} />
            {sparklineData && sparklineData.length > 0 && (
              <MiniSparkline data={sparklineData} status={status} />
            )}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}


