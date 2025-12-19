import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OpexData } from "../types";
import { formatCurrency, chartConfig } from "./chart-utils";

interface OpexRatioChartProps {
  data: OpexData[];
}

export function OpexRatioChart({ data }: OpexRatioChartProps) {
  const latestData = data[data.length - 1];
  const varianceVsForecast = latestData
    ? ((latestData.actual - latestData.forecast) / latestData.forecast) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Operating Expense Trend</CardTitle>
            <CardDescription>Actual vs forecast operating expenses ($M)</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${latestData?.actual.toFixed(1)}M</div>
            <div className={`text-sm ${varianceVsForecast <= 2 ? "text-emerald-600 dark:text-emerald-400" : varianceVsForecast <= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
              {varianceVsForecast >= 0 ? "+" : ""}{varianceVsForecast.toFixed(1)}% vs forecast
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `$${value}M`}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(1)}M`,
                name === "actual" ? "Actual" : name === "forecast" ? "Forecast" : "Budget",
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="budget"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeDasharray="5 5"
              fill="none"
              name="budget"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              fill="url(#forecastGradient)"
              name="forecast"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="hsl(221, 83%, 53%)"
              strokeWidth={2}
              fill="url(#actualGradient)"
              name="actual"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-muted-foreground" />
            <span>Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t border-dashed border-muted-foreground" />
            <span>Budget</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


