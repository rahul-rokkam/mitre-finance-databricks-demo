import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ControlExceptionTrend } from "../types";
import { chartConfig } from "@/components/financial-health/charts/chart-utils";

interface ControlExceptionsTrendChartProps {
  data: ControlExceptionTrend[];
  totalOpenExceptions: number;
}

export function ControlExceptionsTrendChart({
  data,
  totalOpenExceptions,
}: ControlExceptionsTrendChartProps) {
  // Calculate net exceptions (new - resolved)
  const totalNew = data.reduce((sum, d) => sum + d.unusualEntries + d.failedTests, 0);
  const totalResolved = data.reduce((sum, d) => sum + d.resolved, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Control Exceptions Trend
            </CardTitle>
            <CardDescription>
              Unusual entries, failed tests, and resolutions over time
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalOpenExceptions}</div>
            <div className="text-sm text-muted-foreground">Open Exceptions</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  unusualEntries: "Unusual Entries",
                  failedTests: "Failed Tests",
                  resolved: "Resolved",
                };
                return [value, labels[name] || name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  unusualEntries: "Unusual Entries",
                  failedTests: "Failed Tests",
                  resolved: "Resolved",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar
              dataKey="unusualEntries"
              fill="hsl(24, 94%, 50%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="failedTests"
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="resolved"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500">
            <span className="font-medium">New (6 mo):</span>{" "}
            <span className="text-muted-foreground">{totalNew} exceptions identified</span>
          </div>
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500">
            <span className="font-medium">Resolved (6 mo):</span>{" "}
            <span className="text-muted-foreground">{totalResolved} exceptions closed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

