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
import { AlertTriangle } from "lucide-react";
import type { GLException, RiskLevel } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface GLExceptionsTableProps {
  exceptions: GLException[];
  escalatedCount: number;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "resolved":
      return "default";
    case "under_review":
      return "secondary";
    case "escalated":
      return "destructive";
    case "open":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "resolved":
      return "Resolved";
    case "under_review":
      return "Under Review";
    case "escalated":
      return "Escalated";
    case "open":
      return "Open";
    default:
      return status;
  }
};

const getSeverityColor = (severity: RiskLevel): string => {
  switch (severity) {
    case "critical":
      return "text-destructive";
    case "high":
      return "text-amber-600 dark:text-amber-400";
    case "medium":
      return "text-yellow-600 dark:text-yellow-400";
    case "low":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
};

export function GLExceptionsTable({ exceptions, escalatedCount }: GLExceptionsTableProps) {
  // Sort by status (escalated first) then by amount
  const statusOrder: Record<string, number> = {
    escalated: 0,
    open: 1,
    under_review: 2,
    resolved: 3,
  };
  const sortedExceptions = [...exceptions].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.amount - a.amount;
  });

  const totalOpenAmount = exceptions
    .filter((e) => e.status !== "resolved")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Recent GL Exceptions
            </CardTitle>
            <CardDescription>
              Unusual journal entries requiring review
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            {escalatedCount > 0 && (
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-semibold">{escalatedCount} escalated</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-lg font-semibold">{formatCurrency(totalOpenAmount)}</div>
              <div className="text-xs text-muted-foreground">Open Amount</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>FFRDC</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Severity</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExceptions.map((exc) => (
                <TableRow
                  key={exc.id}
                  className={exc.status === "escalated" ? "bg-destructive/5" : ""}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(exc.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate">
                    {exc.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {exc.account}
                  </TableCell>
                  <TableCell className="text-muted-foreground uppercase text-xs">
                    {exc.ffrdcId}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(exc.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-medium uppercase ${getSeverityColor(exc.severity)}`}>
                      {exc.severity}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(exc.status)}>
                      {getStatusLabel(exc.status)}
                    </Badge>
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

