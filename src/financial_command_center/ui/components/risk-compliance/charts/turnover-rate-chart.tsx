import {
  BarChart,
  Bar,
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
import type { TurnoverDataPoint } from "../types";
import { chartConfig, formatPercent } from "@/components/financial-health/charts/chart-utils";

interface TurnoverRateChartProps {
  data: TurnoverDataPoint[];
  avgTurnoverRate: number;
}

export function TurnoverRateChart({ data, avgTurnoverRate }: TurnoverRateChartProps) {
  const industryBenchmark = data[0]?.industryBenchmark || 13.5;
  const aboveBenchmark = data.filter((d) => d.turnoverRate > industryBenchmark).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Turnover Rate by FFRDC
            </CardTitle>
            <CardDescription>
              Voluntary vs involuntary turnover (industry benchmark: {industryBenchmark}%)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(avgTurnoverRate)}</div>
            <div className="text-sm text-muted-foreground">Avg Turnover</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="ffrdcName"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 25]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  voluntaryRate: "Voluntary",
                  involuntaryRate: "Involuntary",
                };
                return [formatPercent(value), labels[name] || name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload as TurnoverDataPoint;
                  return `${item.ffrdcName} - Total: ${formatPercent(item.turnoverRate)}`;
                }
                return label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  voluntaryRate: "Voluntary",
                  involuntaryRate: "Involuntary",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <ReferenceLine
              y={industryBenchmark}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              label={{
                value: `Industry: ${industryBenchmark}%`,
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            <Bar
              dataKey="voluntaryRate"
              stackId="a"
              fill="hsl(24, 94%, 50%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="involuntaryRate"
              stackId="a"
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        {aboveBenchmark > 0 && (
          <div className="mt-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500 text-xs">
            <span className="font-medium">Attention:</span>{" "}
            <span className="text-muted-foreground">
              {aboveBenchmark} FFRDC{aboveBenchmark > 1 ? "s" : ""} above industry benchmark
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

