import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueBudgetByFFRDC } from "../types";
import { formatCurrency, chartConfig } from "./chart-utils";
import { getStatusColorClasses } from "../status-rules";

interface RevenueVsBudgetChartProps {
  data: RevenueBudgetByFFRDC[];
  onBarClick?: (ffrdcId: string) => void;
}

// Get bar fill color based on variance: green if >= 0, yellow if -5% to 0%, red if < -5%
function getVarianceBarColor(variancePercent: number): string {
  if (variancePercent >= 0) {
    return "hsl(142, 71%, 45%)"; // Green - above budget
  } else if (variancePercent >= -5) {
    return "hsl(45, 93%, 47%)"; // Yellow - slightly below budget
  } else {
    return "hsl(0, 84%, 60%)"; // Red - significantly below budget
  }
}

// Get status for variance: green if >= 0, yellow if -5% to 0%, red if < -5%
function getRevenueVarianceStatus(variancePercent: number): "green" | "yellow" | "red" {
  if (variancePercent >= 0) return "green";
  if (variancePercent >= -5) return "yellow";
  return "red";
}

export function RevenueVsBudgetChart({ data, onBarClick }: RevenueVsBudgetChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    barColor: getVarianceBarColor(item.variancePercent),
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
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.5}
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
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {data.map((item) => {
            const status = getRevenueVarianceStatus(item.variancePercent);
            const colors = getStatusColorClasses(status);
            const barColor = getVarianceBarColor(item.variancePercent);
            return (
              <div
                key={item.ffrdcId}
                className={`flex items-center gap-2 p-2 rounded-md ${colors.bg} cursor-pointer hover:opacity-80`}
                onClick={() => onBarClick?.(item.ffrdcId)}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: barColor }}
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
