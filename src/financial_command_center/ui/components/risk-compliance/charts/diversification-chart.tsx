import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DiversificationData } from "../types";
import { chartConfig, formatCurrency, CHART_COLORS } from "@/components/financial-health/charts/chart-utils";

interface DiversificationChartProps {
  data: DiversificationData;
  title: string;
  description: string;
}

export function DiversificationChart({ data, title, description }: DiversificationChartProps) {
  // Calculate concentration (top segment share)
  const topSegment = data.segments[0];
  const isConcentrated = topSegment && topSegment.percent > 40;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {topSegment && (
            <div className="text-right">
              <div className={`text-lg font-semibold ${isConcentrated ? "text-amber-600 dark:text-amber-400" : ""}`}>
                {topSegment.percent.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {topSegment.name}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data.segments}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.segments.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name,
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry) => {
                const payload = entry.payload as { percent?: number };
                return `${value} (${payload?.percent?.toFixed(1) || 0}%)`;
              }}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {isConcentrated && (
          <div className="mt-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500 text-xs">
            <span className="font-medium">Concentration Alert:</span>{" "}
            <span className="text-muted-foreground">
              {topSegment.name} represents &gt;40% of {data.category.toLowerCase()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

