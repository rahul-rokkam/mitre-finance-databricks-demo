import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SponsorHealth } from "../types";
import {
  CHART_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface NpsTrendChartProps {
  health: SponsorHealth[];
  selectedSponsor?: string;
}

function getNpsColor(nps: number): string {
  if (nps >= 70) return "hsl(142, 71%, 45%)"; // Green - excellent
  if (nps >= 50) return "hsl(199, 89%, 48%)"; // Blue - good
  if (nps >= 30) return "hsl(45, 93%, 47%)"; // Yellow - attention
  return "hsl(0, 84%, 60%)"; // Red - critical
}

export function NpsTrendChart({
  health,
  selectedSponsor,
}: NpsTrendChartProps) {
  // Get months from first sponsor
  const months = health[0]?.npsTrend.map((t) => t.month) || [];

  // Create chart data with all sponsors
  const chartData = months.map((month) => {
    const dataPoint: Record<string, string | number> = { month };
    health.forEach((sponsor) => {
      const trend = sponsor.npsTrend.find((t) => t.month === month);
      dataPoint[sponsor.sponsorId] = trend?.value || 0;
    });
    return dataPoint;
  });

  // Filter sponsors to display
  const displayedSponsors =
    selectedSponsor && selectedSponsor !== "all"
      ? health.filter((h) => h.sponsorId === selectedSponsor)
      : health;

  // Calculate average NPS
  const avgNps =
    health.reduce((sum, h) => sum + h.npsScore, 0) / health.length;

  // Find lowest NPS
  const lowestNps = [...health].sort((a, b) => a.npsScore - b.npsScore)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Sponsor NPS Trends
            </CardTitle>
            <CardDescription>
              Net Promoter Score by sponsor over time (Range: -100 to 100)
            </CardDescription>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: getNpsColor(avgNps) }}
            >
              {avgNps.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Avg NPS</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
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
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const sponsor = health.find((h) => h.sponsorId === name);
                return [value, sponsor?.sponsorAbbreviation || name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Benchmark reference lines */}
            <ReferenceLine
              y={70}
              stroke="hsl(142, 71%, 45%)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={50}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Good (50)",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const sponsor = health.find((h) => h.sponsorId === value);
                return sponsor?.sponsorAbbreviation || value;
              }}
            />
            {displayedSponsors.map((sponsor, index) => (
              <Line
                key={sponsor.sponsorId}
                type="monotone"
                dataKey={sponsor.sponsorId}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* Alert for low NPS */}
        {lowestNps && lowestNps.npsScore < 50 && (
          <div className="mt-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 text-xs">
            <span className="font-medium text-rose-700 dark:text-rose-400">
              Attention Required:
            </span>
            <span className="text-muted-foreground ml-2">
              {lowestNps.sponsorAbbreviation} NPS ({lowestNps.npsScore}) is below target.
              Schedule executive engagement.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

