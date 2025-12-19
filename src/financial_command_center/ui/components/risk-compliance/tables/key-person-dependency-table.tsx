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
import { AlertTriangle, CheckCircle, FileText, Users } from "lucide-react";
import type { KeyPersonDependency, RiskLevel } from "../types";

interface KeyPersonDependencyTableProps {
  dependencies: KeyPersonDependency[];
  criticalCount: number;
}

const getRiskVariant = (level: RiskLevel): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
};

const getRiskLabel = (level: RiskLevel): string => {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

export function KeyPersonDependencyTable({
  dependencies,
  criticalCount,
}: KeyPersonDependencyTableProps) {
  // Sort by risk level (critical first)
  const riskOrder: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedDeps = [...dependencies].sort(
    (a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
  );

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Key Person Dependencies
            </CardTitle>
            <CardDescription>
              Critical capabilities and succession planning status
            </CardDescription>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {criticalCount} critical {criticalCount === 1 ? "capability" : "capabilities"} at risk
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Primary Owner</TableHead>
                <TableHead>FFRDC</TableHead>
                <TableHead className="text-center">Backup Coverage</TableHead>
                <TableHead className="text-center">Documentation</TableHead>
                <TableHead className="text-center">Last Review</TableHead>
                <TableHead className="text-center">Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDeps.map((dep) => (
                <TableRow
                  key={dep.id}
                  className={
                    dep.riskLevel === "critical"
                      ? "bg-destructive/5"
                      : dep.riskLevel === "high"
                      ? "bg-amber-500/5"
                      : ""
                  }
                >
                  <TableCell className="font-medium">{dep.capability}</TableCell>
                  <TableCell>{dep.primaryOwner}</TableCell>
                  <TableCell className="text-muted-foreground uppercase text-xs">
                    {dep.ffrdcId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span
                        className={
                          dep.backupCount === 0
                            ? "text-destructive font-semibold"
                            : dep.backupCount === 1
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {dep.backupCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {dep.hasDocumentation ? (
                      <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {new Date(dep.lastReviewDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getRiskVariant(dep.riskLevel)}>
                      {getRiskLabel(dep.riskLevel)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500">
            <span className="font-medium">Good Coverage:</span>{" "}
            <span className="text-muted-foreground">2+ backups with docs</span>
          </div>
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500">
            <span className="font-medium">Limited Coverage:</span>{" "}
            <span className="text-muted-foreground">1 backup or missing docs</span>
          </div>
          <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-950/30 border-l-2 border-rose-500">
            <span className="font-medium">Critical Risk:</span>{" "}
            <span className="text-muted-foreground">No backup, no docs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

