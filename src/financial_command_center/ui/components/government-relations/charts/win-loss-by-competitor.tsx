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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WinLossRecord } from "../types";
import { chartConfig } from "@/components/financial-health/charts/chart-utils";

interface WinLossByCompetitorChartProps {
  winLossRecords: WinLossRecord[];
  onBarClick?: (competitorId: string) => void;
}

function getNetWinsColor(netWins: number): string {
  if (netWins >= 5) return "hsl(142, 71%, 45%)"; // Green - strong
  if (netWins > 0) return "hsl(199, 89%, 48%)"; // Blue - positive
  if (netWins >= -5) return "hsl(45, 93%, 47%)"; // Yellow - slight negative
  return "hsl(0, 84%, 60%)"; // Red - concerning
}

function getTrendBadge(trend: "improving" | "stable" | "declining") {
  const variants = {
    improving: { variant: "default" as const, label: "Improving" },
    stable: { variant: "secondary" as const, label: "Stable" },
    declining: { variant: "destructive" as const, label: "Declining" },
  };
  return variants[trend];
}

export function WinLossByCompetitorChart({
  winLossRecords,
  onBarClick,
}: WinLossByCompetitorChartProps) {
  // Sort by net wins descending
  const sortedData = [...winLossRecords].sort((a, b) => b.netWins - a.netWins);

  // Prepare chart data
  const chartData = sortedData.map((record) => ({
    name: record.competitorAbbreviation,
    competitorId: record.competitorId,
    wins: record.wins,
    losses: -record.losses, // Negative for stacked bar effect
    netWins: record.netWins,
    winRate: record.winRate,
    trend: record.recentTrend,
    color: getNetWinsColor(record.netWins),
  }));

  // Calculate overall stats
  const totalWins = winLossRecords.reduce((sum, r) => sum + r.wins, 0);
  const totalLosses = winLossRecords.reduce((sum, r) => sum + r.losses, 0);
  const overallWinRate = ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Win/Loss Record by Competitor
            </CardTitle>
            <CardDescription>
              Competitive head-to-head performance (net wins)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {overallWinRate}%
            </div>
            <div className="text-sm text-muted-foreground">Overall Win Rate</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="name"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[-25, 25]}
              tickFormatter={(value) => Math.abs(value).toString()}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "wins") return [Math.abs(value), "Wins"];
                if (name === "losses") return [Math.abs(value), "Losses"];
                return [value, name];
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `vs ${data.name} (Win Rate: ${data.winRate.toFixed(1)}%)`;
                }
                return "";
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
            />
            <Bar
              dataKey="wins"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
              cursor={onBarClick ? "pointer" : undefined}
              onClick={(data) => onBarClick?.(data.competitorId)}
            />
            <Bar
              dataKey="losses"
              fill="hsl(0, 84%, 60%)"
              radius={[0, 0, 4, 4]}
              cursor={onBarClick ? "pointer" : undefined}
              onClick={(data) => onBarClick?.(data.competitorId)}
            />
          </BarChart>
        </ResponsiveContainer>
        {/* Trend indicators */}
        <div className="mt-4 flex flex-wrap gap-3">
          {sortedData.slice(0, 4).map((record) => {
            const badgeInfo = getTrendBadge(record.recentTrend);
            return (
              <div key={record.competitorId} className="flex items-center gap-2 text-xs">
                <span className="font-medium">{record.competitorAbbreviation}:</span>
                <Badge variant={badgeInfo.variant} className="text-xs">
                  {badgeInfo.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

