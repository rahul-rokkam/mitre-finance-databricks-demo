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
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { SponsorFundingAllocation, SponsorRef } from "../types";
import {
  formatCurrency,
  CHART_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface SponsorYtdBudgetTrendChartProps {
  allocations: SponsorFundingAllocation[];
  sponsors: SponsorRef[];
  selectedSponsor?: string;
}

export function SponsorYtdBudgetTrendChart({
  allocations,
  sponsors,
  selectedSponsor,
}: SponsorYtdBudgetTrendChartProps) {
  // Filter to selected sponsor or show top 6 by funding
  const filteredAllocations =
    selectedSponsor && selectedSponsor !== "all"
      ? allocations.filter((a) => a.sponsorId === selectedSponsor)
      : [...allocations]
          .sort((a, b) => b.totalFunding - a.totalFunding)
          .slice(0, 6);

  // Prepare chart data
  const chartData = filteredAllocations.map((alloc, index) => {
    const sponsor = sponsors.find((s) => s.id === alloc.sponsorId);
    const budgetPct = (alloc.ytdFunding / alloc.annualBudget) * 100;
    return {
      name: sponsor?.abbreviation || alloc.sponsorId,
      sponsorId: alloc.sponsorId,
      ytdFunding: alloc.ytdFunding,
      annualBudget: alloc.annualBudget,
      budgetPct,
      growthPct: alloc.growthPct,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });

  // Calculate overall YTD vs budget
  const totalYtd = filteredAllocations.reduce((sum, a) => sum + a.ytdFunding, 0);
  const totalBudget = filteredAllocations.reduce(
    (sum, a) => sum + a.annualBudget,
    0
  );
  const overallPct = ((totalYtd / totalBudget) * 100).toFixed(1);

  // Find top growing and declining sponsors
  const sortedByGrowth = [...filteredAllocations].sort(
    (a, b) => b.growthPct - a.growthPct
  );
  const topGrowing = sortedByGrowth[0];
  const topDeclining = sortedByGrowth[sortedByGrowth.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              YTD Funding vs Annual Budget
            </CardTitle>
            <CardDescription>
              {selectedSponsor && selectedSponsor !== "all"
                ? "Selected sponsor progress"
                : "Top sponsors by funding volume"}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{overallPct}%</div>
            <div className="text-sm text-muted-foreground">of budget YTD</div>
          </div>
        </div>
        {/* Growth indicators */}
        <div className="flex gap-2 mt-2">
          {topGrowing && topGrowing.growthPct > 0 && (
            <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {sponsors.find((s) => s.id === topGrowing.sponsorId)?.abbreviation}{" "}
              +{topGrowing.growthPct.toFixed(1)}%
            </Badge>
          )}
          {topDeclining && topDeclining.growthPct < 0 && (
            <Badge variant="outline" className="gap-1 text-red-600 dark:text-red-400">
              <TrendingDown className="h-3 w-3" />
              {sponsors.find((s) => s.id === topDeclining.sponsorId)?.abbreviation}{" "}
              {topDeclining.growthPct.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="name"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[-15, 20]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "ytdFunding") return [formatCurrency(value, false), "YTD Funding"];
                if (name === "annualBudget") return [formatCurrency(value, false), "Annual Budget"];
                if (name === "growthPct") return [`${value.toFixed(1)}%`, "3-Year Growth"];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const sponsor = sponsors.find((s) => s.abbreviation === label);
                return sponsor?.name || label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => {
                if (value === "ytdFunding") return "YTD Funding";
                if (value === "annualBudget") return "Annual Budget";
                if (value === "growthPct") return "3-Year Growth %";
                return value;
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="annualBudget"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.25}
              radius={[4, 4, 0, 0]}
            />
            <Bar yAxisId="left" dataKey="ytdFunding" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growthPct"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

