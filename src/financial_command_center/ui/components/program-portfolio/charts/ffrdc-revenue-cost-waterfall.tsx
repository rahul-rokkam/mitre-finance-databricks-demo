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
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FfrdcCostEffectiveness } from "../types";
import {
  formatCurrency,
  formatPercent,
  FFRDC_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface FfrdcRevenueCostWaterfallChartProps {
  economics: FfrdcCostEffectiveness[];
  selectedFfrdc?: string;
}

export function FfrdcRevenueCostWaterfallChart({
  economics,
  selectedFfrdc,
}: FfrdcRevenueCostWaterfallChartProps) {
  // Filter by selected FFRDC or show all
  const filteredEconomics =
    selectedFfrdc && selectedFfrdc !== "all"
      ? economics.filter((e) => e.ffrdcId === selectedFfrdc)
      : economics;

  // Sort by revenue descending
  const sortedEconomics = [...filteredEconomics].sort(
    (a, b) => b.revenue - a.revenue
  );

  // Prepare waterfall data with cumulative offsets
  let cumulativeRevenue = 0;
  const chartData = sortedEconomics.map((econ) => {
    const data = {
      name: econ.ffrdcName,
      ffrdcId: econ.ffrdcId,
      revenue: econ.revenue,
      costOfDelivery: econ.costOfDelivery,
      marginPct: econ.marginPct,
      offset: cumulativeRevenue,
      color: FFRDC_COLORS[econ.ffrdcId as keyof typeof FFRDC_COLORS],
    };
    cumulativeRevenue += econ.revenue;
    return data;
  });

  // Add total bar
  const totalRevenue = sortedEconomics.reduce((sum, e) => sum + e.revenue, 0);
  const totalCost = sortedEconomics.reduce((sum, e) => sum + e.costOfDelivery, 0);
  const avgMargin = ((totalRevenue - totalCost) / totalRevenue) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Revenue Contribution by FFRDC
            </CardTitle>
            <CardDescription>
              Waterfall showing cumulative revenue with cost overlay
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">
              {formatPercent(avgMargin)} avg margin
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
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
              domain={[20, 35]}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "revenue") return [formatCurrency(value, false), "Revenue"];
                if (name === "costOfDelivery") return [formatCurrency(value, false), "Cost of Delivery"];
                if (name === "marginPct") return [formatPercent(value), "Margin %"];
                if (name === "offset") return null;
                return [value, name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => {
                if (value === "revenue") return "Revenue";
                if (value === "costOfDelivery") return "Cost of Delivery";
                if (value === "marginPct") return "Margin %";
                return value;
              }}
            />
            {/* Transparent offset bar */}
            <Bar
              yAxisId="left"
              dataKey="offset"
              stackId="waterfall"
              fill="transparent"
            />
            {/* Revenue bar */}
            <Bar yAxisId="left" dataKey="revenue" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            {/* Cost overlay bar */}
            <Bar
              yAxisId="left"
              dataKey="costOfDelivery"
              fill="hsl(var(--destructive))"
              fillOpacity={0.3}
              radius={[4, 4, 0, 0]}
            />
            {/* Margin line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="marginPct"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
            />
            {/* Average margin reference line */}
            <ReferenceLine
              yAxisId="right"
              y={avgMargin}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: `Avg ${formatPercent(avgMargin)}`,
                position: "right",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

