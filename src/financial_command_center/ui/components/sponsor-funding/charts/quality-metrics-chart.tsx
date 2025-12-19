import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SponsorHealth } from "../types";
import { chartConfig } from "@/components/financial-health/charts/chart-utils";

interface QualityMetricsChartProps {
  health: SponsorHealth[];
  selectedSponsor?: string;
}

function getDefectColor(rate: number): string {
  if (rate <= 2) return "hsl(142, 71%, 45%)"; // Green - excellent
  if (rate <= 3) return "hsl(199, 89%, 48%)"; // Blue - good
  if (rate <= 4) return "hsl(45, 93%, 47%)"; // Yellow - attention
  return "hsl(0, 84%, 60%)"; // Red - critical
}

function getOnTimeColor(pct: number): string {
  if (pct >= 95) return "hsl(142, 71%, 45%)"; // Green - excellent
  if (pct >= 90) return "hsl(199, 89%, 48%)"; // Blue - good
  if (pct >= 85) return "hsl(45, 93%, 47%)"; // Yellow - attention
  return "hsl(0, 84%, 60%)"; // Red - critical
}

export function QualityMetricsChart({
  health,
  selectedSponsor,
}: QualityMetricsChartProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? health.filter((h) => h.sponsorId === selectedSponsor)
      : health;

  // Sort by on-time delivery descending
  const sortedData = [...filteredData].sort(
    (a, b) => b.onTimeDeliveryPct - a.onTimeDeliveryPct
  );

  // Prepare chart data for on-time delivery
  const onTimeData = sortedData.map((s) => ({
    name: s.sponsorAbbreviation,
    sponsorId: s.sponsorId,
    onTime: s.onTimeDeliveryPct,
    color: getOnTimeColor(s.onTimeDeliveryPct),
  }));

  // Prepare chart data for defect rate
  const defectData = [...filteredData]
    .sort((a, b) => a.defectRate - b.defectRate)
    .map((s) => ({
      name: s.sponsorAbbreviation,
      sponsorId: s.sponsorId,
      defectRate: s.defectRate,
      reworkPct: s.reworkPct,
      color: getDefectColor(s.defectRate),
    }));

  // Calculate averages
  const avgOnTime =
    filteredData.reduce((sum, h) => sum + h.onTimeDeliveryPct, 0) / filteredData.length;
  const avgDefect =
    filteredData.reduce((sum, h) => sum + h.defectRate, 0) / filteredData.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Quality & Schedule Performance
            </CardTitle>
            <CardDescription>
              On-time delivery and defect rates by sponsor
            </CardDescription>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div
                className="text-xl font-bold"
                style={{ color: getOnTimeColor(avgOnTime) }}
              >
                {avgOnTime.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg on-time</div>
            </div>
            <div className="text-right">
              <div
                className="text-xl font-bold"
                style={{ color: getDefectColor(avgDefect) }}
              >
                {avgDefect.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg defect</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* On-Time Delivery Chart */}
          <div>
            <h4 className="text-sm font-medium mb-2">On-Time Delivery %</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={onTimeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
              >
                <CartesianGrid {...chartConfig.gridStyle} horizontal={false} />
                <XAxis
                  type="number"
                  {...chartConfig.axisStyle}
                  tickLine={false}
                  axisLine={false}
                  domain={[70, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...chartConfig.axisStyle}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={chartConfig.tooltipStyle}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "On-Time"]}
                />
                <Bar dataKey="onTime" radius={[0, 4, 4, 0]}>
                  {onTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Defect Rate Chart */}
          <div>
            <h4 className="text-sm font-medium mb-2">Defect & Rework Rates %</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={defectData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
              >
                <CartesianGrid {...chartConfig.gridStyle} horizontal={false} />
                <XAxis
                  type="number"
                  {...chartConfig.axisStyle}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 12]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...chartConfig.axisStyle}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={chartConfig.tooltipStyle}
                  formatter={(value: number, name: string) => {
                    const label = name === "defectRate" ? "Defect Rate" : "Rework %";
                    return [`${value.toFixed(1)}%`, label];
                  }}
                />
                <Legend verticalAlign="top" height={24} />
                <Bar dataKey="defectRate" name="Defect Rate" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="reworkPct" name="Rework %" fill="hsl(45, 93%, 47%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

