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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarginDataPoint, FFRDC } from "../types";
import { formatPercent, FFRDC_COLORS, chartConfig } from "./chart-utils";

interface GrossMarginChartProps {
  data: MarginDataPoint[];
  ffrdcs: FFRDC[];
  onLineClick?: (ffrdcId: string) => void;
}

export function GrossMarginChart({ data, ffrdcs, onLineClick }: GrossMarginChartProps) {
  // Calculate average margin
  const latestData = data[data.length - 1];
  const avgMargin =
    ffrdcs.reduce((sum, ffrdc) => sum + (Number(latestData?.[ffrdc.id]) || 0), 0) / ffrdcs.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Gross Margin % Trend</CardTitle>
            <CardDescription>Margin performance by FFRDC over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(avgMargin)}</div>
            <div className="text-sm text-muted-foreground">Avg. across FFRDCs</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(value) => `${value}%`}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => [
                formatPercent(value),
                ffrdcs.find((f) => f.id === name)?.shortName || name,
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => ffrdcs.find((f) => f.id === value)?.shortName || value}
              wrapperStyle={{ fontSize: 12 }}
            />
            {ffrdcs.map((ffrdc) => (
              <Line
                key={ffrdc.id}
                type="monotone"
                dataKey={ffrdc.id}
                name={ffrdc.id}
                stroke={FFRDC_COLORS[ffrdc.id as keyof typeof FFRDC_COLORS]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{
                  r: 5,
                  onClick: () => onLineClick?.(ffrdc.id),
                  className: "cursor-pointer",
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


