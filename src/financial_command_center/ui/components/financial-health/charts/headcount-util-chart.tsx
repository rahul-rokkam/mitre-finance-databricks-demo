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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeadcountUtilByFFRDC } from "../types";
import { formatPercent, chartConfig } from "./chart-utils";
import { UTILIZATION_THRESHOLDS } from "../status-rules";

interface HeadcountUtilChartProps {
  data: HeadcountUtilByFFRDC[];
  onBarClick?: (ffrdcId: string) => void;
}

// Get bar color based on utilization: green if >= 80%, yellow if 75-80%, red if < 75%
function getUtilizationBarColor(utilization: number): string {
  if (utilization >= UTILIZATION_THRESHOLDS.green) {
    return "hsl(142, 71%, 45%)"; // Green - at or above target
  } else if (utilization >= UTILIZATION_THRESHOLDS.yellow) {
    return "hsl(45, 93%, 47%)"; // Yellow - slightly below target
  } else {
    return "hsl(0, 84%, 60%)"; // Red - significantly below target
  }
}

export function HeadcountUtilChart({ data, onBarClick }: HeadcountUtilChartProps) {
  const totalHeadcount = data.reduce((sum, item) => sum + item.headcount, 0);
  const avgUtilization =
    data.reduce((sum, item) => sum + item.utilizationPct * item.headcount, 0) / totalHeadcount;

  const chartData = data.map((item) => ({
    ...item,
    barColor: getUtilizationBarColor(item.utilizationPct),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Utilization by FFRDC</CardTitle>
            <CardDescription>Billable utilization rate vs 80% target</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(avgUtilization)}</div>
            <div className="text-sm text-muted-foreground">
              avg. utilization
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value) => {
                if (typeof value !== "number") return null;
                return [formatPercent(value), "Utilization"];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <ReferenceLine
              y={UTILIZATION_THRESHOLDS.green}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              label={{
                value: "Target 80%",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            <Bar
              dataKey="utilizationPct"
              radius={[4, 4, 0, 0]}
              onClick={(data) => onBarClick?.((data as unknown as { ffrdcId: string }).ffrdcId)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.barColor}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
            <span>≥ 80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} />
            <span>75-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
            <span>&lt; 75%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


