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
import { Button } from "@/components/ui/button";
import { ArrowUpDown, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SponsorHealth } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface ContractRunwayTableProps {
  healthData: SponsorHealth[];
  selectedSponsor?: string;
}

type SortField = "renewalDate" | "runway" | "contractValue";
type SortDirection = "asc" | "desc";

export function ContractRunwayTable({
  healthData,
  selectedSponsor,
}: ContractRunwayTableProps) {
  const [sortField, setSortField] = useState<SortField>("renewalDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter by selected sponsor or show all
  const filteredData =
    selectedSponsor && selectedSponsor !== "all"
      ? healthData.filter((h) => h.sponsorId === selectedSponsor)
      : healthData;

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "renewalDate":
        comparison =
          new Date(a.nextRenewalDate).getTime() -
          new Date(b.nextRenewalDate).getTime();
        break;
      case "runway":
        comparison = a.runwayMonths - b.runwayMonths;
        break;
      case "contractValue":
        comparison = a.contractValue - b.contractValue;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate contracts expiring within different timeframes
  const today = new Date();
  const expiringIn6Months = filteredData.filter((h) => h.runwayMonths <= 6).length;
  const expiringIn12Months = filteredData.filter((h) => h.runwayMonths <= 12).length;

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get urgency color based on runway
  const getRunwayUrgency = (months: number) => {
    if (months <= 6) return "text-rose-600 dark:text-rose-400 font-semibold";
    if (months <= 12) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Contract Runway Visibility
            </CardTitle>
            <CardDescription>
              Upcoming renewals sorted by urgency
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {expiringIn6Months > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {expiringIn6Months} in 6mo
              </Badge>
            )}
            {expiringIn12Months > expiringIn6Months && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {expiringIn12Months} in 12mo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Sponsor</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort("renewalDate")}
                  >
                    Renewal Date
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort("runway")}
                  >
                    Runway
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort("contractValue")}
                  >
                    Contract Value
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow
                  key={row.sponsorId}
                  className={cn(
                    row.runwayMonths <= 6 && "bg-rose-50/50 dark:bg-rose-950/20"
                  )}
                >
                  <TableCell className="font-medium">
                    {row.sponsorName}
                  </TableCell>
                  <TableCell>{formatDate(row.nextRenewalDate)}</TableCell>
                  <TableCell className={getRunwayUrgency(row.runwayMonths)}>
                    {row.runwayMonths} months
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.contractValue)}
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

