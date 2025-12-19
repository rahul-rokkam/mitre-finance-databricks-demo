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
import type { RevenueBudgetByFFRDC } from "../types";
import { formatCurrency, CHART_COLORS, chartConfig } from "./chart-utils";
import { getBudgetVarianceStatus, getStatusColorClasses } from "../status-rules";

interface RevenueVsBudgetChartProps {
  data: RevenueBudgetByFFRDC[];
  onBarClick?: (ffrdcId: string) => void;
}

export function RevenueVsBudgetChart({ data, onBarClick }: RevenueVsBudgetChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0);
  const totalVariancePercent = ((totalActual - totalBudget) / totalBudget) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Revenue vs Budget by FFRDC</CardTitle>
            <CardDescription>YTD actual vs budgeted revenue</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
            <div className={`text-sm ${totalVariancePercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {totalVariancePercent >= 0 ? "+" : ""}{totalVariancePercent.toFixed(1)}% vs budget
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
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => [
                formatCurrency(value, false),
                name === "actual" ? "Actual" : "Budget",
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar
              dataKey="budget"
              fill="hsl(var(--muted))"
              radius={[4, 4, 0, 0]}
              name="budget"
            />
            <Bar
              dataKey="actual"
              radius={[4, 4, 0, 0]}
              name="actual"
              onClick={(data) => onBarClick?.(data.ffrdcId)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => {
                const status = getBudgetVarianceStatus(entry.variancePercent);
                const colors = getStatusColorClasses(status);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {data.map((item, index) => {
            const status = getBudgetVarianceStatus(item.variancePercent);
            const colors = getStatusColorClasses(status);
            return (
              <div
                key={item.ffrdcId}
                className={`flex items-center gap-2 p-2 rounded-md ${colors.bg} cursor-pointer hover:opacity-80`}
                onClick={() => onBarClick?.(item.ffrdcId)}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="font-medium">{item.ffrdcName}</span>
                <span className={colors.text}>
                  {item.variancePercent >= 0 ? "+" : ""}{item.variancePercent.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


