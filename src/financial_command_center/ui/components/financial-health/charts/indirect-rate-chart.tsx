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
import type { IndirectRateByFFRDC } from "../types";
import { formatPercent, CHART_COLORS, chartConfig } from "./chart-utils";
import { getIndirectRateStatus, getStatusColorClasses } from "../status-rules";

interface IndirectRateChartProps {
  data: IndirectRateByFFRDC[];
  onBarClick?: (ffrdcId: string) => void;
}

export function IndirectRateChart({ data, onBarClick }: IndirectRateChartProps) {
  const avgActualRate = data.reduce((sum, item) => sum + item.actualRate, 0) / data.length;
  const avgCapRate = data.reduce((sum, item) => sum + item.capRate, 0) / data.length;

  const chartData = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    status: getIndirectRateStatus(item.actualRate, item.capRate),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Indirect Cost Rate vs Caps</CardTitle>
            <CardDescription>Actual indirect rates vs sponsor-negotiated caps</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(avgActualRate)}</div>
            <div className="text-sm text-muted-foreground">
              Avg. cap: {formatPercent(avgCapRate)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            layout="vertical"
          >
            <CartesianGrid {...chartConfig.gridStyle} horizontal={false} />
            <XAxis
              type="number"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[38, 48]}
            />
            <YAxis
              type="category"
              dataKey="ffrdcName"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => [
                formatPercent(value),
                name === "actualRate" ? "Actual Rate" : "Cap Rate",
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar
              dataKey="actualRate"
              radius={[0, 4, 4, 0]}
              onClick={(data) => onBarClick?.(data.ffrdcId)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => {
                const colors = getStatusColorClasses(entry.status);
                const fillColor =
                  entry.status === "green"
                    ? "hsl(142, 71%, 45%)"
                    : entry.status === "yellow"
                    ? "hsl(45, 93%, 47%)"
                    : "hsl(0, 84%, 60%)";
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </Bar>
            {/* Render cap markers */}
            {chartData.map((entry, index) => (
              <ReferenceLine
                key={`cap-${index}`}
                x={entry.capRate}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                strokeDasharray="none"
                ifOverflow="extendDomain"
                segment={[
                  { x: entry.capRate, y: index - 0.3 },
                  { x: entry.capRate, y: index + 0.3 },
                ]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {chartData.map((item) => {
            const colors = getStatusColorClasses(item.status);
            return (
              <div
                key={item.ffrdcId}
                className={`flex items-center justify-between p-2 rounded-md ${colors.bg} cursor-pointer hover:opacity-80`}
                onClick={() => onBarClick?.(item.ffrdcId)}
              >
                <span className="font-medium">{item.ffrdcName}</span>
                <span className={colors.text}>
                  {formatPercent(item.actualRate)} / {formatPercent(item.capRate)} cap
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Below Cap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Near Cap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Exceeds Cap</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


