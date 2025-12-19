import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContractRenewal } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface RenewalsTableProps {
  renewals: ContractRenewal[];
  selectedSponsor?: string;
  onRowClick?: (sponsorId: string) => void;
}

type TimeHorizon = "30" | "90" | "180" | "all";

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

function getDaysColor(days: number): string {
  if (days <= 90) return "text-rose-600 dark:text-rose-400";
  if (days <= 180) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

function getNpsColor(nps: number): string {
  if (nps >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (nps >= 50) return "text-muted-foreground";
  if (nps >= 30) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function RenewalsTable({
  renewals,
  selectedSponsor,
  onRowClick,
}: RenewalsTableProps) {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("all");

  // Filter by selected sponsor
  let filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? renewals.filter((r) => r.sponsorId === selectedSponsor)
      : renewals;

  // Filter by time horizon
  if (timeHorizon !== "all") {
    const days = parseInt(timeHorizon);
    filteredData = filteredData.filter((r) => r.daysUntilRenewal <= days);
  }

  // Sort by days until renewal
  const sortedData = [...filteredData].sort(
    (a, b) => a.daysUntilRenewal - b.daysUntilRenewal
  );

  // Count renewals by time horizon
  const next30 = renewals.filter((r) => r.daysUntilRenewal <= 30).length;
  const next90 = renewals.filter((r) => r.daysUntilRenewal <= 90).length;
  const next180 = renewals.filter((r) => r.daysUntilRenewal <= 180).length;

  // Count at-risk renewals
  const atRisk = renewals.filter((r) => r.healthStatus === "critical" || r.healthStatus === "attention").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">
                Contract Renewal Calendar
              </CardTitle>
              <CardDescription>
                Upcoming renewals with satisfaction health
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Time horizon filter */}
            <Tabs value={timeHorizon} onValueChange={(v) => setTimeHorizon(v as TimeHorizon)}>
              <TabsList className="h-8">
                <TabsTrigger value="30" className="text-xs px-2">
                  30d ({next30})
                </TabsTrigger>
                <TabsTrigger value="90" className="text-xs px-2">
                  90d ({next90})
                </TabsTrigger>
                <TabsTrigger value="180" className="text-xs px-2">
                  180d ({next180})
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-2">
                  All ({renewals.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* At-risk indicator */}
            {atRisk > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{atRisk} at risk</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No renewals in selected time horizon
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Sponsor</TableHead>
                  <TableHead className="text-center">Renewal Date</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
                  <TableHead className="text-right">Annual Run Rate</TableHead>
                  <TableHead className="text-center">NPS</TableHead>
                  <TableHead className="text-center">Health</TableHead>
                  <TableHead className="w-[250px]">Risk Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow
                    key={`${row.sponsorId}-${row.renewalDate}`}
                    className={cn(
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : "",
                      row.healthStatus === "critical" && "bg-rose-50/50 dark:bg-rose-950/20"
                    )}
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
                    <TableCell className="text-center">
                      <div>
                        <div className="font-medium">
                          {new Date(row.renewalDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className={cn("text-xs", getDaysColor(row.daysUntilRenewal))}>
                          {row.daysUntilRenewal} days
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.contractValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.annualRunRate)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn("font-semibold", getNpsColor(row.npsScore))}>
                        {row.npsScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(row.healthStatus)}>
                        {row.healthStatus.charAt(0).toUpperCase() + row.healthStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {row.riskNotes}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs">
          <div className="p-3 rounded-md bg-muted/50">
            <div className="text-lg font-semibold">
              {formatCurrency(
                sortedData.reduce((sum, r) => sum + r.contractValue, 0)
              )}
            </div>
            <div className="text-muted-foreground">Total Contract Value</div>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <div className="text-lg font-semibold">
              {formatCurrency(
                sortedData.reduce((sum, r) => sum + r.annualRunRate, 0)
              )}
            </div>
            <div className="text-muted-foreground">Annual Run Rate</div>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <div className="text-lg font-semibold">
              {(
                sortedData.reduce((sum, r) => sum + r.npsScore, 0) / sortedData.length || 0
              ).toFixed(0)}
            </div>
            <div className="text-muted-foreground">Avg NPS</div>
          </div>
          <div
            className={cn(
              "p-3 rounded-md",
              atRisk > 0 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
            )}
          >
            <div
              className={cn(
                "text-lg font-semibold",
                atRisk > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-emerald-700 dark:text-emerald-400"
              )}
            >
              {atRisk}
            </div>
            <div className="text-muted-foreground">Renewals at Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

