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
import type { SponsorStewardship } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface StewardshipScorecardTableProps {
  stewardship: SponsorStewardship[];
  selectedSponsor?: string;
  onRowClick?: (sponsorId: string) => void;
}

function getCpiColor(value: number): string {
  if (value >= 1.03) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value >= 1.0) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value >= 0.95) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getOverheadColor(value: number): string {
  if (value <= 18) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value <= 20) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value <= 22) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getIndirectRateColor(current: number, cap: number): string {
  const gap = cap - current;
  if (gap >= 3) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (gap >= 1) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (gap >= 0) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getUtilizationColor(value: number): string {
  if (value >= 82) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value >= 78) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value >= 75) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "excellent":
      return "default";
    case "good":
      return "secondary";
    case "attention":
      return "secondary";
    case "critical":
      return "destructive";
    default:
      return "outline";
  }
}

export function StewardshipScorecardTable({
  stewardship,
  selectedSponsor,
  onRowClick,
}: StewardshipScorecardTableProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? stewardship.filter((s) => s.sponsorId === selectedSponsor)
      : stewardship;

  // Sort by status (critical first) then by actual spend
  const sortedData = [...filteredData].sort((a, b) => {
    const statusOrder = { critical: 0, attention: 1, good: 2, excellent: 3 };
    const statusDiff =
      (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
    if (statusDiff !== 0) return statusDiff;
    return b.actualSpend - a.actualSpend;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Cost Stewardship Scorecard
        </CardTitle>
        <CardDescription>
          Per-sponsor performance against stewardship metrics (click row for details)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Sponsor</TableHead>
                <TableHead className="text-right">Actual Spend</TableHead>
                <TableHead className="text-right">CPI</TableHead>
                <TableHead className="text-right">Overhead %</TableHead>
                <TableHead className="text-right">Indirect Rate</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow
                  key={row.sponsorId}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row.sponsorId)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div>{row.sponsorAbbreviation}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {row.sponsorName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {formatCurrency(row.actualSpend)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      of {formatCurrency(row.estimatedSpend)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md text-right font-medium",
                        getCpiColor(row.cpi)
                      )}
                    >
                      {row.cpi.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md text-right font-medium",
                        getOverheadColor(row.overheadRatio)
                      )}
                    >
                      {row.overheadRatio.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md text-right font-medium",
                        getIndirectRateColor(row.indirectRateCurrent, row.indirectRateCap)
                      )}
                    >
                      {row.indirectRateCurrent.toFixed(1)}%
                      <span className="text-xs ml-1 opacity-70">
                        / {row.indirectRateCap}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md text-right font-medium",
                        getUtilizationColor(row.billableUtilizationPct)
                      )}
                    >
                      {row.billableUtilizationPct.toFixed(1)}%
                    </div>
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
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/50" />
            <span className="text-muted-foreground">Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-950/30" />
            <span className="text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-50 dark:bg-amber-950/30" />
            <span className="text-muted-foreground">Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-rose-100 dark:bg-rose-950/50" />
            <span className="text-muted-foreground">Critical</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

