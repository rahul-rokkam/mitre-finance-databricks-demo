import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RootCauseTag } from "../types";
import { chartConfig, CHART_COLORS } from "@/components/financial-health/charts/chart-utils";

interface RootCauseTagsChartProps {
  data: RootCauseTag[];
}

export function RootCauseTagsChart({ data }: RootCauseTagsChartProps) {
  const topCause = data[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Finding Root Causes
            </CardTitle>
            <CardDescription>
              Distribution by root cause category
            </CardDescription>
          </div>
          {topCause && (
            <div className="text-right">
              <div className="text-lg font-semibold">{topCause.tag}</div>
              <div className="text-sm text-muted-foreground">
                Top cause ({topCause.percentage.toFixed(0)}%)
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} horizontal={true} vertical={false} />
            <XAxis
              type="number"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="tag"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "count") return [value, "Findings"];
                if (name === "percentage") return [`${value.toFixed(1)}%`, "Percentage"];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar dataKey="count" name="count" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

