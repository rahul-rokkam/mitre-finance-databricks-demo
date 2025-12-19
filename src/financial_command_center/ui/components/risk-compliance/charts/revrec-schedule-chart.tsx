import {
  AreaChart,
  Area,
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
import type { RevRecScheduleItem } from "../types";
import { chartConfig, formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface RevRecScheduleChartProps {
  data: RevRecScheduleItem[];
}

const CONTRACT_TYPE_COLORS = {
  costReimbursable: "hsl(221, 83%, 53%)", // Blue
  fixedPrice: "hsl(142, 71%, 45%)", // Green
  timeAndMaterials: "hsl(262, 83%, 58%)", // Purple
  milestone: "hsl(24, 94%, 50%)", // Orange
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  costReimbursable: "Cost Reimbursable",
  fixedPrice: "Fixed Price",
  timeAndMaterials: "Time & Materials",
  milestone: "Milestone",
};

export function RevRecScheduleChart({ data }: RevRecScheduleChartProps) {
  // Calculate total revenue
  const totalRevenue = data.reduce(
    (sum, item) =>
      sum + item.costReimbursable + item.fixedPrice + item.timeAndMaterials + item.milestone,
    0
  );

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Revenue Recognition Schedule
            </CardTitle>
            <CardDescription>
              Revenue by contract type over time (in $M)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue * 1_000_000)}</div>
            <div className="text-sm text-muted-foreground">Total YTD Revenue</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(value) => `$${value}M`}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(1)}M`,
                CONTRACT_TYPE_LABELS[name] || name,
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => CONTRACT_TYPE_LABELS[value] || value}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="costReimbursable"
              stackId="1"
              stroke={CONTRACT_TYPE_COLORS.costReimbursable}
              fill={CONTRACT_TYPE_COLORS.costReimbursable}
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="fixedPrice"
              stackId="1"
              stroke={CONTRACT_TYPE_COLORS.fixedPrice}
              fill={CONTRACT_TYPE_COLORS.fixedPrice}
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="timeAndMaterials"
              stackId="1"
              stroke={CONTRACT_TYPE_COLORS.timeAndMaterials}
              fill={CONTRACT_TYPE_COLORS.timeAndMaterials}
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="milestone"
              stackId="1"
              stroke={CONTRACT_TYPE_COLORS.milestone}
              fill={CONTRACT_TYPE_COLORS.milestone}
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

