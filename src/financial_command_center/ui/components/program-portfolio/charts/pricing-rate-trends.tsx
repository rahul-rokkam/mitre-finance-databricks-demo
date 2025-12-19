import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { FfrdcCostEffectiveness } from "../types";
import { chartConfig } from "@/components/financial-health/charts/chart-utils";

interface PricingRateTrendsChartProps {
  economics: FfrdcCostEffectiveness[];
  selectedFfrdc?: string;
}

export function PricingRateTrendsChart({
  economics,
  selectedFfrdc,
}: PricingRateTrendsChartProps) {
  // Select the FFRDC to show (default to first one or selected)
  const targetFfrdc =
    selectedFfrdc && selectedFfrdc !== "all"
      ? economics.find((e) => e.ffrdcId === selectedFfrdc)
      : economics[0]; // Default to NSEC as it has the most data

  if (!targetFfrdc) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No FFRDC selected</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = targetFfrdc.rateTrend;

  // Calculate rate gap (are negotiated rates keeping up with costs?)
  const latestData = chartData[chartData.length - 1];
  const rateGap = latestData.negotiatedRate - latestData.laborCost;
  const isRateKeepingUp = rateGap >= -5; // Within 5 points is acceptable

  // Calculate average gap across all months
  const avgGap =
    chartData.reduce((sum, d) => sum + (d.negotiatedRate - d.laborCost), 0) /
    chartData.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Rate vs Cost Trends - {targetFfrdc.ffrdcName}
            </CardTitle>
            <CardDescription>
              Are negotiated rates keeping pace with inflation and labor costs?
            </CardDescription>
          </div>
          <Badge
            variant={isRateKeepingUp ? "outline" : "destructive"}
            className="gap-1"
          >
            {isRateKeepingUp ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Rates Aligned
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Rate Gap Alert
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="month"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[95, 115]}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  negotiatedRate: "Negotiated Rate Index",
                  inflation: "Inflation Index",
                  laborCost: "Labor Cost Index",
                };
                return [value.toFixed(1), labels[name] || name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  negotiatedRate: "Negotiated Rate",
                  inflation: "Inflation",
                  laborCost: "Labor Cost",
                };
                return labels[value] || value;
              }}
            />
            {/* Baseline reference */}
            <ReferenceLine
              y={100}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Baseline (Jul)",
                position: "left",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            {/* Negotiated Rate - primary line */}
            <Line
              type="monotone"
              dataKey="negotiatedRate"
              stroke="hsl(221, 83%, 53%)"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
            />
            {/* Inflation Index */}
            <Line
              type="monotone"
              dataKey="inflation"
              stroke="hsl(45, 93%, 47%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
            {/* Labor Cost Index */}
            <Line
              type="monotone"
              dataKey="laborCost"
              stroke="hsl(346, 77%, 49%)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Summary metrics */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30">
            <div className="font-medium text-blue-700 dark:text-blue-400">
              Rate Index
            </div>
            <div className="text-lg font-bold">
              {latestData.negotiatedRate.toFixed(1)}
            </div>
          </div>
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30">
            <div className="font-medium text-amber-700 dark:text-amber-400">
              Inflation Index
            </div>
            <div className="text-lg font-bold">
              {latestData.inflation.toFixed(1)}
            </div>
          </div>
          <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/30">
            <div className="font-medium text-rose-700 dark:text-rose-400">
              Labor Cost Index
            </div>
            <div className="text-lg font-bold">
              {latestData.laborCost.toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

