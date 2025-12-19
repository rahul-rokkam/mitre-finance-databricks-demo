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
import type { SponsorFundingAllocation, FFRDCRef, SponsorRef } from "../types";
import {
  formatCurrency,
  FFRDC_COLORS,
  chartConfig,
} from "@/components/financial-health/charts/chart-utils";

interface SponsorFfrdcAllocationChartProps {
  allocations: SponsorFundingAllocation[];
  ffrdcs: FFRDCRef[];
  sponsors: SponsorRef[];
  selectedFfrdc?: string;
}

export function SponsorFfrdcAllocationChart({
  allocations,
  ffrdcs,
  sponsors,
  selectedFfrdc,
}: SponsorFfrdcAllocationChartProps) {
  // Sort allocations by total funding descending
  const sortedAllocations = [...allocations].sort(
    (a, b) => b.totalFunding - a.totalFunding
  );

  // Prepare chart data with sponsor abbreviations
  const chartData = sortedAllocations.map((alloc) => {
    const sponsor = sponsors.find((s) => s.id === alloc.sponsorId);
    return {
      name: sponsor?.abbreviation || alloc.sponsorId,
      sponsorId: alloc.sponsorId,
      ...alloc.byFfrdc,
      total: alloc.totalFunding,
    };
  });

  // Filter FFRDCs if one is selected
  const visibleFfrdcs =
    selectedFfrdc && selectedFfrdc !== "all"
      ? ffrdcs.filter((f) => f.id === selectedFfrdc)
      : ffrdcs;

  const totalFunding = allocations.reduce((sum, a) => sum + a.totalFunding, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Funding by Sponsor & FFRDC
            </CardTitle>
            <CardDescription>
              Stacked allocation across FFRDCs
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalFunding)}</div>
            <div className="text-sm text-muted-foreground">Total portfolio</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                const ffrdc = ffrdcs.find((f) => f.id === name);
                return [formatCurrency(value, false), ffrdc?.shortName || name];
              }}
              labelFormatter={(label) => {
                const sponsor = sponsors.find((s) => s.abbreviation === label);
                return sponsor?.name || label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const ffrdc = ffrdcs.find((f) => f.id === value);
                return ffrdc?.shortName || value;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            {visibleFfrdcs.map((ffrdc) => (
              <Bar
                key={ffrdc.id}
                dataKey={ffrdc.id}
                stackId="stack"
                fill={FFRDC_COLORS[ffrdc.id as keyof typeof FFRDC_COLORS]}
                radius={
                  ffrdc.id === visibleFfrdcs[visibleFfrdcs.length - 1].id
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

