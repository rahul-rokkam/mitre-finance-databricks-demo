import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
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

interface IndirectRateTrendChartProps {
  stewardship: SponsorStewardship[];
  selectedSponsor?: string;
}

export function IndirectRateTrendChart({
  stewardship,
  selectedSponsor,
}: IndirectRateTrendChartProps) {
  // Get the selected sponsor data or show first critical/attention sponsor
  const sponsorData =
    selectedSponsor && selectedSponsor !== "all"
      ? stewardship.find((s) => s.sponsorId === selectedSponsor)
      : stewardship.find((s) => s.status === "critical") ||
        stewardship.find((s) => s.status === "attention") ||
        stewardship[0];

  if (!sponsorData) {
    return null;
  }

  const isOverCap = sponsorData.indirectRateCurrent > sponsorData.indirectRateCap;
  const gapFromCap = sponsorData.indirectRateCap - sponsorData.indirectRateCurrent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Indirect Rate vs Negotiated Cap
            </CardTitle>
            <CardDescription>
              {sponsorData.sponsorAbbreviation} - Cap: {sponsorData.indirectRateCap}%
            </CardDescription>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                isOverCap ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {sponsorData.indirectRateCurrent.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {isOverCap ? `${Math.abs(gapFromCap).toFixed(1)}% over cap` : `${gapFromCap.toFixed(1)}% under cap`}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart
            data={sponsorData.indirectRateTrend}
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
              domain={[38, 50]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const label = name === "actualRate" ? "Actual Rate" : "Negotiated Cap";
                return [`${value.toFixed(1)}%`, label];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Cap reference line */}
            <ReferenceLine
              y={sponsorData.indirectRateCap}
              stroke="hsl(0, 84%, 60%)"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            {/* Area showing gap from cap */}
            <Area
              type="monotone"
              dataKey="negotiatedCap"
              fill="hsl(0, 84%, 60%)"
              fillOpacity={0.1}
              stroke="none"
            />
            {/* Actual rate line */}
            <Line
              type="monotone"
              dataKey="actualRate"
              stroke={isOverCap ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)"}
              strokeWidth={2}
              dot={{ fill: isOverCap ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: isOverCap ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)" }}
            />
            <span className="text-muted-foreground">Actual Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-destructive" style={{ borderStyle: "dashed" }} />
            <span className="text-muted-foreground">Negotiated Cap ({sponsorData.indirectRateCap}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

