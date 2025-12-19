import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeadcountUtilByFFRDC } from "../types";
import { formatPercent, CHART_COLORS, chartConfig } from "./chart-utils";
import { getUtilizationStatus, getStatusColorClasses, UTILIZATION_THRESHOLDS } from "../status-rules";

interface HeadcountUtilChartProps {
  data: HeadcountUtilByFFRDC[];
  onBarClick?: (ffrdcId: string) => void;
}

export function HeadcountUtilChart({ data, onBarClick }: HeadcountUtilChartProps) {
  const totalHeadcount = data.reduce((sum, item) => sum + item.headcount, 0);
  const avgUtilization =
    data.reduce((sum, item) => sum + item.utilizationPct * item.headcount, 0) / totalHeadcount;

  const chartData = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Headcount & Utilization</CardTitle>
            <CardDescription>Staff count and billable utilization by FFRDC</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalHeadcount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {formatPercent(avgUtilization)} avg. utilization
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="ffrdcName"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="headcount"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              yAxisId="utilization"
              orientation="right"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[60, 90]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "headcount") return [value.toLocaleString(), "Headcount"];
                return [formatPercent(value), "Utilization"];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <ReferenceLine
              yAxisId="utilization"
              y={UTILIZATION_THRESHOLDS.green}
              stroke="hsl(142, 71%, 45%)"
              strokeDasharray="5 5"
              label={{
                value: "Target 80%",
                position: "right",
                fill: "hsl(142, 71%, 45%)",
                fontSize: 10,
              }}
            />
            <Bar
              yAxisId="headcount"
              dataKey="headcount"
              radius={[4, 4, 0, 0]}
              onClick={(data) => onBarClick?.(data.ffrdcId)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
            <Line
              yAxisId="utilization"
              type="monotone"
              dataKey="utilizationPct"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={(props) => {
                const status = getUtilizationStatus(props.payload.utilizationPct);
                const colors = getStatusColorClasses(status);
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill={colors.dot.replace("bg-", "").includes("emerald") ? "hsl(142, 71%, 45%)" :
                          colors.dot.replace("bg-", "").includes("amber") ? "hsl(45, 93%, 47%)" :
                          "hsl(0, 84%, 60%)"}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Headcount</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-foreground" />
            <span>Utilization %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


