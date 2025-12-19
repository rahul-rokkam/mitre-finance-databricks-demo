import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PipelineItem, PipelineStage, PipelineType, ConfidenceLevel } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";
import { Building2, Handshake, TrendingUp, ChevronRight } from "lucide-react";

interface PipelineTableProps {
  pipeline: PipelineItem[];
  selectedStage?: PipelineStage | "all";
  onRowClick?: (itemId: string) => void;
}

function getTypeBadge(type: PipelineType) {
  const config = {
    Acquisition: { icon: Building2, variant: "default" as const },
    Partnership: { icon: Handshake, variant: "secondary" as const },
    Investment: { icon: TrendingUp, variant: "outline" as const },
  };
  const { icon: Icon, variant } = config[type];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {type}
    </Badge>
  );
}

function getStageBadge(stage: PipelineStage) {
  const stageColors: Record<PipelineStage, string> = {
    Sourcing: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Screening: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "Due Diligence": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    Negotiation: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Closed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageColors[stage]}`}>
      {stage}
    </span>
  );
}

function getConfidenceBadge(confidence: ConfidenceLevel) {
  const config = {
    high: { variant: "default" as const, className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
    medium: { variant: "secondary" as const, className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    low: { variant: "outline" as const, className: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
  };
  const { className } = config[confidence];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}>
      {confidence}
    </span>
  );
}

export function PipelineTable({
  pipeline,
  selectedStage,
  onRowClick,
}: PipelineTableProps) {
  // Filter by stage if selected
  const filteredPipeline =
    selectedStage && selectedStage !== "all"
      ? pipeline.filter((p) => p.stage === selectedStage)
      : pipeline;

  // Sort by stage order then by strategic value
  const stageOrder: Record<PipelineStage, number> = {
    Negotiation: 0,
    "Due Diligence": 1,
    Screening: 2,
    Sourcing: 3,
    Closed: 4,
  };

  const sortedPipeline = [...filteredPipeline].sort((a, b) => {
    if (stageOrder[a.stage] !== stageOrder[b.stage]) {
      return stageOrder[a.stage] - stageOrder[b.stage];
    }
    return b.strategicValue - a.strategicValue;
  });

  // Summary stats
  const activePipeline = sortedPipeline.filter((p) => p.stage !== "Closed");
  const totalValue = activePipeline.reduce((sum, p) => sum + p.estimatedImpact, 0);
  const avgConfidenceScore =
    activePipeline.reduce(
      (sum, p) =>
        sum + (p.confidenceLevel === "high" ? 3 : p.confidenceLevel === "medium" ? 2 : 1),
      0
    ) / (activePipeline.length || 1);

  // Stage counts
  const stageCounts = sortedPipeline.reduce(
    (acc, p) => {
      acc[p.stage] = (acc[p.stage] || 0) + 1;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Strategic M&A & Partnership Pipeline
            </CardTitle>
            <CardDescription>
              Active opportunities to address capability gaps
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold">{activePipeline.length}</div>
              <div className="text-xs text-muted-foreground">Active Items</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{formatCurrency(totalValue)}</div>
              <div className="text-xs text-muted-foreground">Total Impact</div>
            </div>
          </div>
        </div>
        {/* Stage funnel */}
        <div className="flex items-center gap-1 mt-4 text-xs">
          {(["Sourcing", "Screening", "Due Diligence", "Negotiation", "Closed"] as PipelineStage[]).map(
            (stage, idx) => (
              <div key={stage} className="flex items-center">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                  <span className="font-medium">{stage}</span>
                  <span className="text-muted-foreground">({stageCounts[stage] || 0})</span>
                </div>
                {idx < 4 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
              </div>
            )
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Capability Gap</TableHead>
                <TableHead className="text-center">Strategic Value</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead className="text-right">Est. Impact</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPipeline.map((item) => (
                <TableRow
                  key={item.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(item.id)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.leadOwner}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>{getStageBadge(item.stage)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{item.capabilityGapAddressed}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-12 bg-muted rounded-full h-2 mr-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.strategicValue * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.strategicValue}/10</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getConfidenceBadge(item.confidenceLevel)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.estimatedImpact)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(item.estimatedCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

