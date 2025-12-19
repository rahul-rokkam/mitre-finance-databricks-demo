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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FailedAuditTest } from "../types";
import { chartConfig, formatPercent } from "@/components/financial-health/charts/chart-utils";

interface FailedAuditTestsChartProps {
  data: FailedAuditTest[];
}

const getPassRateColor = (passRate: number) => {
  if (passRate >= 95) return "hsl(142, 71%, 45%)"; // Green
  if (passRate >= 85) return "hsl(45, 93%, 47%)"; // Yellow
  return "hsl(0, 84%, 60%)"; // Red
};

export function FailedAuditTestsChart({ data }: FailedAuditTestsChartProps) {
  const totalTests = data.reduce((sum, d) => sum + d.testCount, 0);
  const totalFailed = data.reduce((sum, d) => sum + d.failedCount, 0);
  const overallPassRate = ((totalTests - totalFailed) / totalTests) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Audit Test Results by Domain
            </CardTitle>
            <CardDescription>
              Pass rate across control domains
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(overallPassRate)}</div>
            <div className="text-sm text-muted-foreground">Overall Pass Rate</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} horizontal={true} vertical={false} />
            <XAxis
              type="number"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <YAxis
              type="category"
              dataKey="controlDomain"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "passRate") return [formatPercent(value), "Pass Rate"];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload as FailedAuditTest;
                  return `${label} (${item.testCount - item.failedCount}/${item.testCount} passed)`;
                }
                return label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar dataKey="passRate" name="passRate" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPassRateColor(entry.passRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
            <span className="text-muted-foreground">≥95% (Excellent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} />
            <span className="text-muted-foreground">85-95% (Acceptable)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
            <span className="text-muted-foreground">&lt;85% (Needs Attention)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

