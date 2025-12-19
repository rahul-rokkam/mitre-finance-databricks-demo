import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OpexData } from "../types";
import { chartConfig } from "./chart-utils";

interface OpexRatioChartProps {
  data: OpexData[];
}

export function OpexRatioChart({ data }: OpexRatioChartProps) {
  const latestData = data[data.length - 1];
  const varianceVsBudget = latestData
    ? ((latestData.actual - latestData.budget) / latestData.budget) * 100
    : 0;

  // Expenses: over-budget should read as "bad" (red) in the UI.
  const varianceColor =
    varianceVsBudget <= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Operating Expense Trend</CardTitle>
            <CardDescription>Actual vs budget operating expenses ($M)</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${latestData?.actual.toFixed(1)}M</div>
            <div className={`text-sm ${varianceColor}`}>
              {varianceVsBudget > 0 ? "+" : ""}{varianceVsBudget.toFixed(1)}% vs budget
            </div>
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
              tickFormatter={(value) => `$${value}M`}
              domain={[0, "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value, name) => {
                if (typeof value !== "number") return null;
                const label = name === "budget" ? "Budget" : "Actual";
                return [`$${value.toFixed(1)}M`, label];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Budget line - gray dotted */}
            <Line
              type="monotone"
              dataKey="budget"
              stroke="#888888"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              name="budget"
            />
            {/* Actual line - solid blue */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(221, 83%, 53%)"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(221, 83%, 53%)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="actual"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#888888" }} />
            <span>Budget</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
