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
import { cn } from "@/lib/utils";
import type { SponsorHealth } from "../types";

interface SponsorHealthTableProps {
  health: SponsorHealth[];
  selectedSponsor?: string;
  onRowClick?: (sponsorId: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (score >= 65) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (score >= 50) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getMetricColor(value: number, isInverse: boolean = false): string {
  // For inverse metrics like defect rate, lower is better
  if (isInverse) {
    if (value <= 2) return "text-emerald-600 dark:text-emerald-400";
    if (value <= 3) return "text-muted-foreground";
    if (value <= 4) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  }
  // For regular metrics like on-time %, higher is better
  if (value >= 95) return "text-emerald-600 dark:text-emerald-400";
  if (value >= 90) return "text-muted-foreground";
  if (value >= 85) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getVarianceColor(value: number): string {
  if (value >= 3) return "text-emerald-600 dark:text-emerald-400";
  if (value >= 0) return "text-muted-foreground";
  if (value >= -3) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getNpsColor(nps: number): string {
  if (nps >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (nps >= 50) return "text-muted-foreground";
  if (nps >= 30) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "healthy":
      return "default";
    case "attention":
      return "secondary";
    case "critical":
      return "destructive";
    default:
      return "outline";
  }
}

export function SponsorHealthTable({
  health,
  selectedSponsor,
  onRowClick,
}: SponsorHealthTableProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? health.filter((h) => h.sponsorId === selectedSponsor)
      : health;

  // Sort by health score descending
  const sortedData = [...filteredData].sort((a, b) => b.healthScore - a.healthScore);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Multi-dimensional Sponsor Health
        </CardTitle>
        <CardDescription>
          Quality, schedule, budget, and satisfaction metrics by sponsor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Sponsor</TableHead>
                <TableHead className="text-center">Health Score</TableHead>
                <TableHead className="text-center">Defect Rate</TableHead>
                <TableHead className="text-center">Rework %</TableHead>
                <TableHead className="text-center">On-Time %</TableHead>
                <TableHead className="text-center">Budget Var.</TableHead>
                <TableHead className="text-center">NPS</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow
                  key={row.sponsorId}
                  className={cn(
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : "",
                    row.status === "critical" && "bg-rose-50/50 dark:bg-rose-950/20"
                  )}
                  onClick={() => onRowClick?.(row.sponsorId)}
                >
                  <TableCell className="font-medium">
                    <div>{row.sponsorAbbreviation}</div>
                  </TableCell>
                  <TableCell className="text-center p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md font-bold",
                        getScoreColor(row.healthScore)
                      )}
                    >
                      {row.healthScore}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-medium", getMetricColor(row.defectRate, true))}>
                      {row.defectRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-medium", getMetricColor(row.reworkPct, true))}>
                      {row.reworkPct.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-medium", getMetricColor(row.onTimeDeliveryPct))}>
                      {row.onTimeDeliveryPct.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-medium", getVarianceColor(row.budgetVariancePct))}>
                      {row.budgetVariancePct >= 0 ? "+" : ""}{row.budgetVariancePct.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-semibold", getNpsColor(row.npsScore))}>
                      {row.npsScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(row.status)}>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Metric explanations */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Defect Rate:</span> Lower is better (&le;2% excellent)
          </div>
          <div>
            <span className="font-medium">On-Time:</span> Higher is better (&ge;95% excellent)
          </div>
          <div>
            <span className="font-medium">Budget Var.:</span> Positive = under budget
          </div>
          <div>
            <span className="font-medium">NPS:</span> -100 to 100, &ge;70 excellent
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

