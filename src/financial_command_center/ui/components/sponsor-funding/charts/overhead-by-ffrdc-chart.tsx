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
  FFRDC_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface OverheadByFfrdcChartProps {
  stewardship: SponsorStewardship[];
  selectedSponsor?: string;
}

export function OverheadByFfrdcChart({
  stewardship,
  selectedSponsor,
}: OverheadByFfrdcChartProps) {
  // Get the selected sponsor data or aggregate all
  const sponsorData =
    selectedSponsor && selectedSponsor !== "all"
      ? stewardship.find((s) => s.sponsorId === selectedSponsor)
      : null;

  // If single sponsor selected, show their FFRDC breakdown
  if (sponsorData) {
    const chartData = sponsorData.overheadByFfrdc.map((o) => ({
      name: o.ffrdcName,
      ffrdcId: o.ffrdcId,
      overhead: o.overheadRatio,
      target: o.target,
      color: FFRDC_COLORS[o.ffrdcId as keyof typeof FFRDC_COLORS] || "hsl(var(--primary))",
    }));

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Overhead Ratio by FFRDC
              </CardTitle>
              <CardDescription>
                {sponsorData.sponsorAbbreviation} - Target: 20% or below
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {sponsorData.overheadRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg overhead</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
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
                domain={[0, 30]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={chartConfig.tooltipStyle}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Overhead"]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <ReferenceLine
                y={20}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label={{
                  value: "Target 20%",
                  position: "right",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="overhead" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={entry.overhead <= 20 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // Show aggregate overhead by sponsor
  const chartData = stewardship
    .map((s) => ({
      name: s.sponsorAbbreviation,
      sponsorId: s.sponsorId,
      overhead: s.overheadRatio,
    }))
    .sort((a, b) => a.overhead - b.overhead);

  const avgOverhead =
    stewardship.reduce((sum, s) => sum + s.overheadRatio, 0) / stewardship.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Overhead Ratio by Sponsor
            </CardTitle>
            <CardDescription>
              Lower overhead = better cost stewardship (Target: &le;20%)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{avgOverhead.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Avg overhead</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
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
              domain={[0, 30]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Overhead"]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <ReferenceLine
              y={20}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Target 20%",
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
            <Bar dataKey="overhead" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.overhead <= 20 ? "hsl(142, 71%, 45%)" : "hsl(45, 93%, 47%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

