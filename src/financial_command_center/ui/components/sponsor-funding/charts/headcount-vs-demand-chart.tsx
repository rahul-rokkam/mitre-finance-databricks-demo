import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FfrdcEfficiency } from "../types";
import {
  FFRDC_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface HeadcountVsDemandChartProps {
  efficiency: FfrdcEfficiency[];
  selectedFfrdc?: string;
}

export function HeadcountVsDemandChart({
  efficiency,
  selectedFfrdc,
}: HeadcountVsDemandChartProps) {
  // Get the selected FFRDC or the one with the biggest gap
  const selectedEfficiency =
    selectedFfrdc && selectedFfrdc !== "all"
      ? efficiency.find((e) => e.ffrdcId === selectedFfrdc)
      : [...efficiency].sort(
          (a, b) =>
            Math.abs(b.currentHeadcount - b.currentDemand) -
            Math.abs(a.currentHeadcount - a.currentDemand)
        )[0];

  if (!selectedEfficiency) {
    return null;
  }

  const gap = selectedEfficiency.currentHeadcount - selectedEfficiency.currentDemand;
  const isOverstaffed = gap > 0;
  const gapPercent = ((gap / selectedEfficiency.currentDemand) * 100).toFixed(1);

  const chartData = selectedEfficiency.headcountVsDemand;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Headcount vs Sponsor Demand
            </CardTitle>
            <CardDescription>
              {selectedEfficiency.ffrdcName} staffing alignment
            </CardDescription>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                Math.abs(gap) > 50
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isOverstaffed ? "+" : ""}{gap}
            </div>
            <div className="text-sm text-muted-foreground">
              {isOverstaffed ? "Over" : "Under"}staffed ({gapPercent}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              tickFormatter={(value) => value.toLocaleString()}
              domain={["dataMin - 100", "dataMax + 100"]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const label = name === "headcount" ? "Headcount" : "Demand";
                return [value.toLocaleString(), label];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Line
              type="monotone"
              dataKey="headcount"
              name="Headcount"
              stroke={FFRDC_COLORS[selectedEfficiency.ffrdcId as keyof typeof FFRDC_COLORS] || "hsl(var(--primary))"}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="demand"
              name="Demand"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Gap analysis */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
          <div className="p-2 rounded-md bg-muted/50">
            <div className="text-lg font-semibold">
              {selectedEfficiency.currentHeadcount.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Current Headcount</div>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <div className="text-lg font-semibold">
              {selectedEfficiency.currentDemand.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Sponsor Demand</div>
          </div>
          <div
            className={`p-2 rounded-md ${
              Math.abs(gap) > 50
                ? "bg-amber-50 dark:bg-amber-950/30"
                : "bg-emerald-50 dark:bg-emerald-950/30"
            }`}
          >
            <div
              className={`text-lg font-semibold ${
                Math.abs(gap) > 50
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {isOverstaffed ? "+" : ""}{gap}
            </div>
            <div className="text-muted-foreground">Gap</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

