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
import type { FindingsAgingBucket } from "../types";
import { chartConfig } from "@/components/financial-health/charts/chart-utils";

interface FindingsAgingChartProps {
  data: FindingsAgingBucket[];
  totalFindings: number;
}

const AGING_COLORS = {
  "0-30 days": "hsl(142, 71%, 45%)", // Green - recent
  "31-60 days": "hsl(45, 93%, 47%)", // Yellow - attention
  "61-90 days": "hsl(24, 94%, 50%)", // Orange - aging
  ">90 days": "hsl(0, 84%, 60%)", // Red - critical
};

export function FindingsAgingChart({ data, totalFindings }: FindingsAgingChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Audit Findings by Age
            </CardTitle>
            <CardDescription>
              Distribution of open findings by aging bucket
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalFindings}</div>
            <div className="text-sm text-muted-foreground">Open Findings</div>
          </div>
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
              dataKey="bucket"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "count") return [value, "Findings"];
                if (name === "riskWeighted") return [value, "Risk Score"];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar dataKey="count" name="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={AGING_COLORS[entry.bucket as keyof typeof AGING_COLORS] || "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {Object.entries(AGING_COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

