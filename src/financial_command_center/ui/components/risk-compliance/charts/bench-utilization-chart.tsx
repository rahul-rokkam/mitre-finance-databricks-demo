import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BenchUtilization } from "../types";
import { chartConfig, formatPercent } from "@/components/financial-health/charts/chart-utils";

interface BenchUtilizationChartProps {
  data: BenchUtilization[];
  avgBenchUtil: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "healthy":
      return "hsl(142, 71%, 45%)";
    case "attention":
      return "hsl(45, 93%, 47%)";
    case "critical":
      return "hsl(0, 84%, 60%)";
    default:
      return "hsl(var(--muted-foreground))";
  }
};

export function BenchUtilizationChart({ data, avgBenchUtil }: BenchUtilizationChartProps) {
  const criticalCount = data.filter((d) => d.status === "critical").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Bench Utilization by FFRDC
            </CardTitle>
            <CardDescription>
              Staff on bench as % of headcount (threshold: 20%)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(avgBenchUtil)}</div>
            <div className="text-sm text-muted-foreground">Avg Bench Rate</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
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
              domain={[0, 35]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "benchPercent") return [formatPercent(value), "Bench Rate"];
                if (name === "benchCount") return [value, "On Bench"];
                if (name === "totalHeadcount") return [value, "Total HC"];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload as BenchUtilization;
                  return `${item.ffrdcName} (${item.benchCount} of ${item.totalHeadcount})`;
                }
                return label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <ReferenceLine
              y={20}
              stroke="hsl(0, 84%, 60%)"
              strokeDasharray="5 5"
              label={{
                value: "20% Threshold",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            <Bar dataKey="benchPercent" name="benchPercent" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {criticalCount > 0 && (
          <div className="mt-3 p-2 rounded-md bg-rose-50 dark:bg-rose-950/30 border-l-2 border-rose-500 text-xs">
            <span className="font-medium">Alert:</span>{" "}
            <span className="text-muted-foreground">
              {criticalCount} FFRDC{criticalCount > 1 ? "s" : ""} above 20% bench threshold
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

