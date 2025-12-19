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
import type { SponsorHealth, SponsorRef } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface SponsorHealthHeatmapTableProps {
  healthData: SponsorHealth[];
  sponsors: SponsorRef[];
  selectedSponsor?: string;
}

// Get cell background color based on metric value and thresholds
function getFundingColor(value: number): string {
  if (value >= 500_000_000) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value >= 200_000_000) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value >= 100_000_000) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400";
}

function getCpiColor(value: number): string {
  if (value >= 1.05) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value >= 1.0) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value >= 0.95) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getUtilizationColor(value: number): string {
  if (value >= 80) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value >= 75) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value >= 70) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
}

function getRunwayColor(value: number): string {
  if (value >= 18) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300";
  if (value >= 12) return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
  if (value >= 6) return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
  return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300";
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

export function SponsorHealthHeatmapTable({
  healthData,
  sponsors,
  selectedSponsor,
}: SponsorHealthHeatmapTableProps) {
  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? healthData.filter((h) => h.sponsorId === selectedSponsor)
      : healthData;

  // Sort by status (critical first) then by funding volume
  const sortedData = [...filteredData].sort((a, b) => {
    const statusOrder = { critical: 0, attention: 1, healthy: 2 };
    const statusDiff =
      (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    if (statusDiff !== 0) return statusDiff;
    return b.fundingVolume - a.fundingVolume;
  });

  // Prepare table data with sponsor names
  const tableData = sortedData.map((health) => {
    const sponsor = sponsors.find((s) => s.id === health.sponsorId);
    return {
      ...health,
      abbreviation: sponsor?.abbreviation || health.sponsorId,
      fullName: sponsor?.name || health.sponsorName,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Sponsor Portfolio Health Heatmap
        </CardTitle>
        <CardDescription>
          Color intensity indicates performance thresholds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Sponsor</TableHead>
                <TableHead className="text-right">Funding Volume</TableHead>
                <TableHead className="text-right">CPI</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Runway</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.sponsorId}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{row.abbreviation}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {row.fullName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md text-right font-medium",
                        getFundingColor(row.fundingVolume)
                      )}
                    >
                      {formatCurrency(row.fundingVolume)}
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
                        getUtilizationColor(row.utilizationPct)
                      )}
                    >
                      {row.utilizationPct.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-md text-right font-medium",
                        getRunwayColor(row.runwayMonths)
                      )}
                    >
                      {row.runwayMonths} mo
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

