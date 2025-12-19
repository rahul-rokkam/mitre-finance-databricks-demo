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
import type { FfrdcEfficiency } from "../types";
import {
  formatCurrency,
  FFRDC_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface CostPerFteByFfrdcChartProps {
  efficiency: FfrdcEfficiency[];
  selectedFfrdc?: string;
}

export function CostPerFteByFfrdcChart({
  efficiency,
  selectedFfrdc,
}: CostPerFteByFfrdcChartProps) {
  // Filter by selected FFRDC or show all
  const filteredEfficiency =
    selectedFfrdc && selectedFfrdc !== "all"
      ? efficiency.filter((e) => e.ffrdcId === selectedFfrdc)
      : efficiency;

  // Sort by cost per FTE ascending (lower is better)
  const sortedEfficiency = [...filteredEfficiency].sort(
    (a, b) => a.costPerTechFte - b.costPerTechFte
  );

  // Prepare chart data
  const chartData = sortedEfficiency.map((econ) => ({
    name: econ.ffrdcName,
    ffrdcId: econ.ffrdcId,
    costPerFte: econ.costPerTechFte,
    benchmark: econ.industryBenchmark,
    color: FFRDC_COLORS[econ.ffrdcId as keyof typeof FFRDC_COLORS] || "hsl(var(--primary))",
  }));

  // Calculate average cost per FTE
  const avgCostPerFte =
    filteredEfficiency.reduce((sum, e) => sum + e.costPerTechFte, 0) /
    filteredEfficiency.length;

  // Industry benchmark
  const benchmarkCostPerFte = 155000;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Cost per Technical FTE by FFRDC
            </CardTitle>
            <CardDescription>
              Lower cost indicates better operational efficiency
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatCurrency(avgCostPerFte, false)}
            </div>
            <div className="text-sm text-muted-foreground">Avg cost/FTE</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
          >
            <CartesianGrid {...chartConfig.gridStyle} horizontal={false} />
            <XAxis
              type="number"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
              domain={[100000, "dataMax + 20000"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "costPerFte")
                  return [formatCurrency(value, false), "Cost per FTE"];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            {/* Benchmark reference line */}
            <ReferenceLine
              x={benchmarkCostPerFte}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "Benchmark $155K",
                position: "top",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
              }}
            />
            <Bar dataKey="costPerFte" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={entry.costPerFte <= benchmarkCostPerFte ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Performance summary */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              Most Efficient:
            </span>
            <span className="text-muted-foreground">
              {sortedEfficiency[0]?.ffrdcName} ({formatCurrency(sortedEfficiency[0]?.costPerTechFte || 0, false)})
            </span>
          </div>
          {sortedEfficiency.length > 1 && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30">
              <span className="font-medium text-amber-700 dark:text-amber-400">
                Needs Focus:
              </span>
              <span className="text-muted-foreground">
                {sortedEfficiency[sortedEfficiency.length - 1]?.ffrdcName} (
                {formatCurrency(sortedEfficiency[sortedEfficiency.length - 1]?.costPerTechFte || 0, false)})
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

