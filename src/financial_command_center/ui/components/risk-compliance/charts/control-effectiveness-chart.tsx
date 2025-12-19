import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ControlEffectiveness } from "../types";
import { chartConfig, formatPercent } from "@/components/financial-health/charts/chart-utils";

interface ControlEffectivenessChartProps {
  data: ControlEffectiveness[];
  overallEffectiveness: number;
}

export function ControlEffectivenessChart({ data, overallEffectiveness }: ControlEffectivenessChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Control Effectiveness by Domain
            </CardTitle>
            <CardDescription>
              Internal control status across domains
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPercent(overallEffectiveness)}</div>
            <div className="text-sm text-muted-foreground">Overall Effective</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
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
              dataKey="domain"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  effectiveCount: "Effective",
                  needsImprovementCount: "Needs Improvement",
                  ineffectiveCount: "Ineffective",
                };
                return [value, labels[name] || name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  effectiveCount: "Effective",
                  needsImprovementCount: "Needs Improvement",
                  ineffectiveCount: "Ineffective",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <ReferenceLine
              x={0}
              stroke="hsl(var(--border))"
            />
            <Bar
              dataKey="effectiveCount"
              stackId="a"
              fill="hsl(142, 71%, 45%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="needsImprovementCount"
              stackId="a"
              fill="hsl(45, 93%, 47%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="ineffectiveCount"
              stackId="a"
              fill="hsl(0, 84%, 60%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

