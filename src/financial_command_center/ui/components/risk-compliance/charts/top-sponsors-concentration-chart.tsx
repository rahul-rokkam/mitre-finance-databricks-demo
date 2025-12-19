import {
  ComposedChart,
  Bar,
  Line,
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
import type { SponsorConcentration } from "../types";
import { chartConfig, formatCurrency, formatPercent } from "@/components/financial-health/charts/chart-utils";

interface TopSponsorsConcentrationChartProps {
  data: SponsorConcentration[];
  top3Percent: number;
  top10Percent: number;
}

export function TopSponsorsConcentrationChart({
  data,
  top3Percent,
  top10Percent,
}: TopSponsorsConcentrationChartProps) {
  // Get color based on YoY change
  const getBarColor = (yoyChange: number) => {
    if (yoyChange >= 5) return "hsl(142, 71%, 45%)"; // Green - growing
    if (yoyChange >= 0) return "hsl(221, 83%, 53%)"; // Blue - stable
    if (yoyChange >= -5) return "hsl(45, 93%, 47%)"; // Yellow - slight decline
    return "hsl(0, 84%, 60%)"; // Red - significant decline
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Top 10 Sponsor Revenue Concentration
            </CardTitle>
            <CardDescription>
              Revenue share with cumulative Pareto line (color indicates YoY trend)
            </CardDescription>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-xl font-bold">{formatPercent(top3Percent)}</div>
              <div className="text-xs text-muted-foreground">Top 3 Share</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{formatPercent(top10Percent)}</div>
              <div className="text-xs text-muted-foreground">Top 10 Share</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="abbreviation"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="left"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 30]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "revenuePercent") return [formatPercent(value), "Revenue Share"];
                if (name === "cumulativePercent") return [formatPercent(value), "Cumulative"];
                if (name === "revenueAmount") return [formatCurrency(value), "Revenue"];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload as SponsorConcentration;
                  return `${item.sponsorName} (YoY: ${item.yoyChange >= 0 ? "+" : ""}${item.yoyChange.toFixed(1)}%)`;
                }
                return label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar
              yAxisId="left"
              dataKey="revenuePercent"
              name="revenuePercent"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.yoyChange)} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercent"
              name="cumulativePercent"
              stroke="hsl(346, 77%, 49%)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
            <span className="text-muted-foreground">Growing (≥5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(221, 83%, 53%)" }} />
            <span className="text-muted-foreground">Stable (0-5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} />
            <span className="text-muted-foreground">Slight Decline (0 to -5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
            <span className="text-muted-foreground">Declining (&lt;-5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded" style={{ backgroundColor: "hsl(346, 77%, 49%)" }} />
            <span className="text-muted-foreground">Cumulative %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

