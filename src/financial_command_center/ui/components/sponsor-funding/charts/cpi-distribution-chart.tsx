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
import type { SponsorStewardship } from "../types";
import {
  CHART_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface CpiDistributionChartProps {
  stewardship: SponsorStewardship[];
  selectedSponsor?: string;
  onBarClick?: (sponsorId: string) => void;
}

function getCpiColor(cpi: number): string {
  if (cpi >= 1.03) return "hsl(142, 71%, 45%)"; // Green - excellent
  if (cpi >= 1.0) return "hsl(199, 89%, 48%)"; // Blue - good
  if (cpi >= 0.95) return "hsl(45, 93%, 47%)"; // Yellow - attention
  return "hsl(0, 84%, 60%)"; // Red - critical
}

export function CpiDistributionChart({
  stewardship,
  selectedSponsor,
  onBarClick,
}: CpiDistributionChartProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? stewardship.filter((s) => s.sponsorId === selectedSponsor)
      : stewardship;

  // Sort by CPI descending (higher is better)
  const sortedData = [...filteredData].sort((a, b) => b.cpi - a.cpi);

  // Prepare chart data
  const chartData = sortedData.map((s, index) => ({
    name: s.sponsorAbbreviation,
    sponsorId: s.sponsorId,
    cpi: s.cpi,
    color: CHART_COLORS[index % CHART_COLORS.length],
    statusColor: getCpiColor(s.cpi),
  }));

  // Calculate average CPI
  const avgCpi =
    filteredData.reduce((sum, s) => sum + s.cpi, 0) / filteredData.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Cost Performance Index by Sponsor
            </CardTitle>
            <CardDescription>
              CPI &gt; 1.0 = under budget, CPI &lt; 1.0 = over budget
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{avgCpi.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Avg CPI</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
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
              domain={[0.85, 1.15]}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number) => [value.toFixed(2), "CPI"]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Target reference line */}
            <ReferenceLine
              y={1.0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Target (1.0)",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="cpi"
              radius={[4, 4, 0, 0]}
              cursor={onBarClick ? "pointer" : undefined}
              onClick={(data) => onBarClick?.(data.sponsorId)}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.statusColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
            <span className="text-muted-foreground">Excellent (&ge;1.03)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(199, 89%, 48%)" }} />
            <span className="text-muted-foreground">Good (1.0-1.03)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 93%, 47%)" }} />
            <span className="text-muted-foreground">Attention (0.95-1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
            <span className="text-muted-foreground">Critical (&lt;0.95)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

