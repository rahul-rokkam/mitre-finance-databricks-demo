import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SponsorHealth, SponsorRef } from "../types";
import { formatCurrency, chartConfig } from "@/components/financial-health/charts/chart-utils";

interface SponsorHealthScatterChartProps {
  healthData: SponsorHealth[];
  sponsors: SponsorRef[];
  selectedSponsor?: string;
}

// Get color based on utilization
function getUtilizationColor(utilizationPct: number): string {
  if (utilizationPct >= 80) return "hsl(142, 71%, 45%)"; // Green - good
  if (utilizationPct >= 70) return "hsl(45, 93%, 47%)"; // Yellow - attention
  return "hsl(0, 84%, 60%)"; // Red - critical
}

// Get color based on status
function getStatusColor(status: string): string {
  switch (status) {
    case "healthy":
      return "hsl(142, 71%, 45%)";
    case "attention":
      return "hsl(45, 93%, 47%)";
    case "critical":
      return "hsl(0, 84%, 60%)";
    default:
      return "hsl(var(--muted-foreground))";
  }
}

export function SponsorHealthScatterChart({
  healthData,
  sponsors,
  selectedSponsor,
}: SponsorHealthScatterChartProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? healthData.filter((h) => h.sponsorId === selectedSponsor)
      : healthData;

  // Prepare chart data
  const chartData = filteredData.map((health) => {
    const sponsor = sponsors.find((s) => s.id === health.sponsorId);
    return {
      ...health,
      name: sponsor?.abbreviation || health.sponsorId,
      fullName: sponsor?.name || health.sponsorName,
      x: health.fundingVolume / 1_000_000, // Convert to millions
      y: health.cpi,
      z: Math.max(health.runwayMonths * 3, 10), // Scale for visibility
      color: getStatusColor(health.status),
    };
  });

  // Calculate averages
  const avgFunding =
    filteredData.reduce((sum, h) => sum + h.fundingVolume, 0) /
    filteredData.length /
    1_000_000;
  const avgCpi =
    filteredData.reduce((sum, h) => sum + h.cpi, 0) / filteredData.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Sponsor Health Matrix
            </CardTitle>
            <CardDescription>
              Funding volume vs CPI performance (bubble size = runway months)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid {...chartConfig.gridStyle} />
            <XAxis
              type="number"
              dataKey="x"
              name="Funding"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}M`}
              domain={["dataMin - 50", "dataMax + 100"]}
              label={{
                value: "Funding Volume ($M)",
                position: "bottom",
                offset: -5,
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="CPI"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[0.85, 1.15]}
              label={{
                value: "Cost Performance Index",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 600]} />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value: number, name: string) => {
                if (name === "Funding") return [`$${value.toFixed(0)}M`, "Funding"];
                if (name === "CPI") return [value.toFixed(2), "CPI"];
                return [value, name];
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${data.fullName} (${data.runwayMonths} months runway)`;
                }
                return "";
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Reference lines for quadrant analysis */}
            <ReferenceLine
              y={1.0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "CPI = 1.0 (On Budget)",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
            <ReferenceLine
              x={avgFunding}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
            />
            <Scatter name="Sponsors" data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        {/* Quadrant legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500">
            <span className="font-medium">Top Right:</span>{" "}
            <span className="text-muted-foreground">
              High funding, under budget - Priority partners
            </span>
          </div>
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500">
            <span className="font-medium">Top Left:</span>{" "}
            <span className="text-muted-foreground">
              Lower funding, under budget - Growth potential
            </span>
          </div>
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500">
            <span className="font-medium">Bottom Right:</span>{" "}
            <span className="text-muted-foreground">
              High funding, over budget - Cost control needed
            </span>
          </div>
          <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/30 border-l-2 border-rose-500">
            <span className="font-medium">Bottom Left:</span>{" "}
            <span className="text-muted-foreground">
              Lower funding, over budget - Risk assessment needed
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

