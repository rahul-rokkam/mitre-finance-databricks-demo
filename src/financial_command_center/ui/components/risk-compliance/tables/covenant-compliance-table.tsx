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
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { CovenantCompliance } from "../types";
import { formatPercent } from "@/components/financial-health/charts/chart-utils";

interface CovenantComplianceTableProps {
  covenants: CovenantCompliance[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "compliant":
      return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case "breach":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "compliant":
      return "default";
    case "warning":
      return "secondary";
    case "breach":
      return "destructive";
    default:
      return "outline";
  }
};

const getHeadroomColor = (headroomPercent: number): string => {
  if (headroomPercent >= 20) return "text-emerald-600 dark:text-emerald-400";
  if (headroomPercent >= 10) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
};

export function CovenantComplianceTable({ covenants }: CovenantComplianceTableProps) {
  const warningCount = covenants.filter((c) => c.status === "warning").length;
  const breachCount = covenants.filter((c) => c.status === "breach").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Covenant Compliance Tracker
            </CardTitle>
            <CardDescription>
              Financial covenant status and headroom analysis
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {breachCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {breachCount} Breach
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} Warning
              </Badge>
            )}
            {breachCount === 0 && warningCount === 0 && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                All Compliant
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
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Covenant</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Headroom</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {covenants.map((covenant, index) => (
                <TableRow
                  key={index}
                  className={
                    covenant.status === "breach"
                      ? "bg-destructive/5"
                      : covenant.status === "warning"
                      ? "bg-amber-500/5"
                      : ""
                  }
                >
                  <TableCell>{getStatusIcon(covenant.status)}</TableCell>
                  <TableCell className="font-medium">{covenant.covenant}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {covenant.threshold.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {covenant.currentValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getHeadroomColor(covenant.headroomPercent)}>
                      {covenant.headroom >= 0 ? "+" : ""}
                      {covenant.headroom.toFixed(2)} ({formatPercent(covenant.headroomPercent)})
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(covenant.status)}>
                      {covenant.status.charAt(0).toUpperCase() + covenant.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 p-2 rounded-md bg-muted/50 text-xs">
          <span className="font-medium">Note:</span>{" "}
          <span className="text-muted-foreground">
            Headroom shows buffer between current value and threshold. Warning triggers at &lt;10% headroom.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

