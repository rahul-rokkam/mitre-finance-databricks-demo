import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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

interface BenchTrendChartProps {
  efficiency: FfrdcEfficiency[];
  selectedFfrdc?: string;
}

export function BenchTrendChart({
  efficiency,
  selectedFfrdc,
}: BenchTrendChartProps) {
  // Get months from first FFRDC
  const months = efficiency[0]?.benchTrend.map((t) => t.month) || [];

  // Create chart data with all FFRDCs
  const chartData = months.map((month) => {
    const dataPoint: Record<string, string | number> = { month };
    efficiency.forEach((ffrdc) => {
      const trend = ffrdc.benchTrend.find((t) => t.month === month);
      dataPoint[ffrdc.ffrdcId] = trend?.benchPct || 0;
    });
    return dataPoint;
  });

  // Filter FFRDCs to display
  const displayedFfrdcs =
    selectedFfrdc && selectedFfrdc !== "all"
      ? efficiency.filter((e) => e.ffrdcId === selectedFfrdc)
      : efficiency;

  // Calculate average bench percentage
  const avgBench =
    efficiency.reduce((sum, e) => sum + e.benchPct, 0) / efficiency.length;

  // Find highest bench (worst)
  const highestBench = [...efficiency].sort((a, b) => b.benchPct - a.benchPct)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Bench Time Trends
            </CardTitle>
            <CardDescription>
              Unallocated talent % (lower is better, target &lt;10%)
            </CardDescription>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                avgBench > 10 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {avgBench.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg bench</div>
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
              domain={[0, 15]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const ffrdc = efficiency.find((e) => e.ffrdcId === name);
                return [`${value.toFixed(1)}%`, ffrdc?.ffrdcName || name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Target reference line */}
            <ReferenceLine
              y={10}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Target 10%",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const ffrdc = efficiency.find((e) => e.ffrdcId === value);
                return ffrdc?.ffrdcName || value;
              }}
            />
            {displayedFfrdcs.map((ffrdc) => (
              <Line
                key={ffrdc.ffrdcId}
                type="monotone"
                dataKey={ffrdc.ffrdcId}
                stroke={FFRDC_COLORS[ffrdc.ffrdcId as keyof typeof FFRDC_COLORS] || "hsl(var(--primary))"}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* Alert for high bench */}
        {highestBench && highestBench.benchPct > 10 && (
          <div className="mt-4 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 text-xs">
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Staffing Alert:
            </span>
            <span className="text-muted-foreground ml-2">
              {highestBench.ffrdcName} has {highestBench.benchPct.toFixed(1)}% bench time.
              Consider rebalancing or targeted hiring freeze.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

