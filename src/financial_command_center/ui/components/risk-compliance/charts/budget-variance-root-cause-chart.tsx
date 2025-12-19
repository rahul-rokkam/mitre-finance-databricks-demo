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
import type { BudgetVarianceRootCause } from "../types";
import { chartConfig, formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface BudgetVarianceRootCauseChartProps {
  data: BudgetVarianceRootCause[];
}

export function BudgetVarianceRootCauseChart({ data }: BudgetVarianceRootCauseChartProps) {
  // Calculate total variance across all FFRDCs
  const totalVariance = data.reduce((sum, d) => sum + d.totalVariance, 0);
  const isUnfavorable = totalVariance < 0;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Budget Variance by FFRDC & Category
            </CardTitle>
            <CardDescription>
              Root cause analysis of budget variances (negative = unfavorable)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isUnfavorable ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(totalVariance)}
            </div>
            <div className="text-sm text-muted-foreground">Net Variance</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid {...chartConfig.gridStyle} vertical={false} />
            <XAxis
              dataKey="ffrdcName"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  laborVariance: "Labor",
                  materialVariance: "Material",
                  subcontractVariance: "Subcontract",
                  overheadVariance: "Overhead",
                };
                return [formatCurrency(value), labels[name] || name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload as BudgetVarianceRootCause;
                  return `${item.ffrdcName} (Total: ${formatCurrency(item.totalVariance)})`;
                }
                return label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  laborVariance: "Labor",
                  materialVariance: "Material",
                  subcontractVariance: "Subcontract",
                  overheadVariance: "Overhead",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Bar dataKey="laborVariance" fill="hsl(221, 83%, 53%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="materialVariance" fill="hsl(262, 83%, 58%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="subcontractVariance" fill="hsl(24, 94%, 50%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="overheadVariance" fill="hsl(199, 89%, 48%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 p-2 rounded-md bg-muted/50 text-xs">
          <span className="font-medium">Note:</span>{" "}
          <span className="text-muted-foreground">
            Positive values indicate favorable variance (under budget); negative values indicate unfavorable variance (over budget)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

