import {
  BarChart,
  Bar,
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
import type { MissionAreaMarketShare } from "../types";
import { chartConfig, formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface MarketShareByMissionAreaChartProps {
  marketShare: MissionAreaMarketShare[];
  selectedMissionArea?: string;
  onBarClick?: (missionAreaId: string) => void;
}

// Distinct colors for MITRE and competitors
const COLORS = {
  mitre: "hsl(221, 83%, 53%)", // Blue - MITRE
  lincoln: "hsl(142, 71%, 45%)", // Green
  rand: "hsl(262, 83%, 58%)", // Purple
  aerospace: "hsl(24, 94%, 50%)", // Orange
  ida: "hsl(346, 77%, 49%)", // Rose
  other: "hsl(199, 89%, 48%)", // Cyan
};

export function MarketShareByMissionAreaChart({
  marketShare,
  selectedMissionArea,
  onBarClick,
}: MarketShareByMissionAreaChartProps) {
  // Filter by selected mission area or show all
  const filteredData =
    selectedMissionArea && selectedMissionArea !== "all"
      ? marketShare.filter((m) => m.missionAreaId === selectedMissionArea)
      : marketShare;

  // Prepare chart data - stacked bar showing MITRE vs competitors
  const chartData = filteredData.map((m) => {
    const competitorTotal = m.competitorShares.reduce((sum, c) => sum + c.share, 0);
    const otherShare = Math.max(0, 100 - m.mitreShare - competitorTotal);

    return {
      name: m.missionAreaName,
      missionAreaId: m.missionAreaId,
      mitre: m.mitreShare,
      tam: m.totalAvailableMarket,
      mitreRevenue: m.mitreRevenue,
      ...m.competitorShares.reduce(
        (acc, c) => ({
          ...acc,
          [c.competitorAbbreviation.toLowerCase().replace(/\s+/g, "_")]: c.share,
        }),
        {}
      ),
      other: otherShare,
    };
  });

  // Get unique competitors across all mission areas
  const allCompetitors = new Set<string>();
  filteredData.forEach((m) => {
    m.competitorShares.forEach((c) => {
      allCompetitors.add(c.competitorAbbreviation);
    });
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Market Share by Mission Area
            </CardTitle>
            <CardDescription>
              MITRE vs competitor share of Total Addressable Market
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} horizontal={true} vertical={false} />
            <XAxis
              type="number"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const displayName = name === "mitre" ? "MITRE" : name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
                return [`${value.toFixed(1)}%`, displayName];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${label} (TAM: ${formatCurrency(data.tam)})`;
                }
                return label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => {
                if (value === "mitre") return "MITRE";
                return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
              }}
            />
            <Bar
              dataKey="mitre"
              stackId="share"
              fill={COLORS.mitre}
              radius={[0, 0, 0, 0]}
              cursor={onBarClick ? "pointer" : undefined}
              onClick={(data) => onBarClick?.(data.missionAreaId)}
            />
            <Bar
              dataKey="lincoln_labs"
              stackId="share"
              fill={COLORS.lincoln}
            />
            <Bar
              dataKey="rand"
              stackId="share"
              fill={COLORS.rand}
            />
            <Bar
              dataKey="aerospace"
              stackId="share"
              fill={COLORS.aerospace}
            />
            <Bar
              dataKey="ida"
              stackId="share"
              fill={COLORS.ida}
            />
            <Bar
              dataKey="other"
              stackId="share"
              fill="hsl(var(--muted))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

