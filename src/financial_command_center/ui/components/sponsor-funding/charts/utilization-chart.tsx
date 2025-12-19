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
import { chartConfig } from "@/components/financial-health/charts/chart-utils";

interface UtilizationChartProps {
  stewardship: SponsorStewardship[];
  selectedSponsor?: string;
  onBarClick?: (sponsorId: string) => void;
}

function getUtilizationColor(util: number): string {
  if (util >= 82) return "hsl(142, 71%, 45%)"; // Green - excellent
  if (util >= 78) return "hsl(199, 89%, 48%)"; // Blue - good
  if (util >= 75) return "hsl(45, 93%, 47%)"; // Yellow - attention
  return "hsl(0, 84%, 60%)"; // Red - critical
}

export function UtilizationChart({
  stewardship,
  selectedSponsor,
  onBarClick,
}: UtilizationChartProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? stewardship.filter((s) => s.sponsorId === selectedSponsor)
      : stewardship;

  // Sort by utilization descending (higher is better)
  const sortedData = [...filteredData].sort(
    (a, b) => b.billableUtilizationPct - a.billableUtilizationPct
  );

  // Prepare chart data
  const chartData = sortedData.map((s) => ({
    name: s.sponsorAbbreviation,
    sponsorId: s.sponsorId,
    utilization: s.billableUtilizationPct,
    statusColor: getUtilizationColor(s.billableUtilizationPct),
  }));

  // Calculate average
  const avgUtilization =
    filteredData.reduce((sum, s) => sum + s.billableUtilizationPct, 0) /
    filteredData.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Billable Utilization by Sponsor
            </CardTitle>
            <CardDescription>
              Sponsor-funded work vs admin/overhead (Target: &ge;80%)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{avgUtilization.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Avg utilization</div>
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
              domain={[60, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Utilization"]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Target reference line */}
            <ReferenceLine
              y={80}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Target 80%",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="utilization"
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
      </CardContent>
    </Card>
  );
}

