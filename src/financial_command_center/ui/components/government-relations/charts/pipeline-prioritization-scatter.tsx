import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
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
import type { PipelineItem } from "../types";
import { chartConfig, formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface PipelinePrioritizationScatterProps {
  pipeline: PipelineItem[];
  onPointClick?: (itemId: string) => void;
}

function getConfidenceColor(confidence: "high" | "medium" | "low"): string {
  switch (confidence) {
    case "high":
      return "hsl(142, 71%, 45%)"; // Green
    case "medium":
      return "hsl(45, 93%, 47%)"; // Yellow
    case "low":
      return "hsl(0, 84%, 60%)"; // Red
  }
}

function getTypeShape(type: "Acquisition" | "Partnership" | "Investment"): string {
  switch (type) {
    case "Acquisition":
      return "circle";
    case "Partnership":
      return "diamond";
    case "Investment":
      return "square";
  }
}

export function PipelinePrioritizationScatter({
  pipeline,
  onPointClick,
}: PipelinePrioritizationScatterProps) {
  // Filter out closed items
  const activePipeline = pipeline.filter((p) => p.stage !== "Closed");

  // Prepare chart data
  const chartData = activePipeline.map((item) => ({
    id: item.id,
    name: item.name,
    x: item.strategicValue,
    y: item.confidenceLevel === "high" ? 3 : item.confidenceLevel === "medium" ? 2 : 1,
    z: Math.max(item.estimatedImpact / 5_000_000, 8), // Scale bubble size
    impact: item.estimatedImpact,
    cost: item.estimatedCost,
    type: item.type,
    stage: item.stage,
    color: getConfidenceColor(item.confidenceLevel),
    confidence: item.confidenceLevel,
    capabilityGap: item.capabilityGapAddressed,
  }));

  // Calculate average values for reference lines
  const avgStrategicValue =
    activePipeline.reduce((sum, p) => sum + p.strategicValue, 0) / activePipeline.length;
  const avgConfidence =
    activePipeline.reduce(
      (sum, p) => sum + (p.confidenceLevel === "high" ? 3 : p.confidenceLevel === "medium" ? 2 : 1),
      0
    ) / activePipeline.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Pipeline Prioritization Matrix
            </CardTitle>
            <CardDescription>
              Strategic value vs confidence (bubble size = estimated impact)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid {...chartConfig.gridStyle} />
            <XAxis
              type="number"
              dataKey="x"
              name="Strategic Value"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              label={{
                value: "Strategic Value",
                position: "bottom",
                offset: 0,
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Confidence"
              {...chartConfig.axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[0, 4]}
              ticks={[1, 2, 3]}
              tickFormatter={(value) => {
                if (value === 1) return "Low";
                if (value === 2) return "Medium";
                if (value === 3) return "High";
                return "";
              }}
              label={{
                value: "Confidence",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 800]} />
            <Tooltip
              contentStyle={chartConfig.tooltipStyle}
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-popover p-3 shadow-md">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.type} • {data.stage}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Strategic Value: <span className="font-medium">{data.x}/10</span></p>
                        <p>Confidence: <span className="font-medium capitalize">{data.confidence}</span></p>
                        <p>Est. Impact: <span className="font-medium">{formatCurrency(data.impact)}</span></p>
                        <p>Est. Cost: <span className="font-medium">{formatCurrency(data.cost)}</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Gap: {data.capabilityGap}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Quadrant reference lines */}
            <ReferenceLine
              x={5}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={2}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Scatter
              name="Pipeline Items"
              data={chartData}
              cursor={onPointClick ? "pointer" : undefined}
              onClick={(data) => onPointClick?.(data.id)}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        {/* Quadrant legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500">
            <span className="font-medium">Top Right:</span>{" "}
            <span className="text-muted-foreground">High priority - proceed urgently</span>
          </div>
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500">
            <span className="font-medium">Top Left:</span>{" "}
            <span className="text-muted-foreground">High confidence, lower value - quick wins</span>
          </div>
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500">
            <span className="font-medium">Bottom Right:</span>{" "}
            <span className="text-muted-foreground">High value, needs de-risking</span>
          </div>
          <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/30 border-l-2 border-rose-500">
            <span className="font-medium">Bottom Left:</span>{" "}
            <span className="text-muted-foreground">Low priority - reconsider</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

