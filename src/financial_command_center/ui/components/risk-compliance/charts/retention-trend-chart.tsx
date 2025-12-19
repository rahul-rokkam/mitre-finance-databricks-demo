import {
  ComposedChart,
  Bar,
  Line,
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
import type { RetentionDataPoint } from "../types";
import { chartConfig, formatPercent } from "@/components/financial-health/charts/chart-utils";

interface RetentionTrendChartProps {
  data: RetentionDataPoint[];
}

export function RetentionTrendChart({ data }: RetentionTrendChartProps) {
  const latestData = data[data.length - 1];
  const avgRetention = data.reduce((sum, d) => sum + d.retentionRate, 0) / data.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Sponsor Retention Trend
            </CardTitle>
            <CardDescription>
              Year-over-year sponsor retention and churn
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {latestData ? formatPercent(latestData.retentionRate) : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">
              Current Retention Rate
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="year"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Sponsors",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[80, 100]}
              label={{
                value: "Retention %",
                angle: 90,
                position: "insideRight",
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  retainedSponsors: "Retained",
                  newSponsors: "New",
                  churnedSponsors: "Churned",
                  retentionRate: "Retention Rate",
                };
                if (name === "retentionRate") return [formatPercent(value), labels[name]];
                return [value, labels[name] || name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  retainedSponsors: "Retained",
                  newSponsors: "New",
                  churnedSponsors: "Churned",
                  retentionRate: "Retention %",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar
              yAxisId="left"
              dataKey="retainedSponsors"
              fill="hsl(221, 83%, 53%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="newSponsors"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="churnedSponsors"
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="retentionRate"
              stroke="hsl(24, 94%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500">
            <span className="font-medium">Avg Retention:</span>{" "}
            <span className="text-muted-foreground">
              {formatPercent(avgRetention)} over {data.length} years
            </span>
          </div>
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500">
            <span className="font-medium">Net Growth:</span>{" "}
            <span className="text-muted-foreground">
              +{data.reduce((sum, d) => sum + d.newSponsors - d.churnedSponsors, 0)} sponsors
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

