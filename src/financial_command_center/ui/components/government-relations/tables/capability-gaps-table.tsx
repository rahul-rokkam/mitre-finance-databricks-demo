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
import type { CapabilityGap, GapSeverity, GapStatus } from "../types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";
import { AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";

interface CapabilityGapsTableProps {
  gaps: CapabilityGap[];
  selectedMissionArea?: string;
  onRowClick?: (gapId: string) => void;
}

function getSeverityBadge(severity: GapSeverity) {
  const config = {
    critical: { variant: "destructive" as const, icon: AlertTriangle, label: "Critical" },
    high: { variant: "default" as const, icon: Target, label: "High" },
    medium: { variant: "secondary" as const, icon: Clock, label: "Medium" },
    low: { variant: "outline" as const, icon: CheckCircle, label: "Low" },
  };
  const { variant, icon: Icon, label } = config[severity];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function getStatusBadge(status: GapStatus) {
  const config = {
    identified: { variant: "outline" as const, label: "Identified" },
    addressing: { variant: "secondary" as const, label: "Addressing" },
    resolved: { variant: "default" as const, label: "Resolved" },
  };
  const { variant, label } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CapabilityGapsTable({
  gaps,
  selectedMissionArea,
  onRowClick,
}: CapabilityGapsTableProps) {
  // Filter by selected mission area
  const filteredGaps =
    selectedMissionArea && selectedMissionArea !== "all"
      ? gaps.filter((g) =>
          g.missionAreas.some(
            (m) => m.toLowerCase().replace(/\s+/g, "-") === selectedMissionArea
          )
        )
      : gaps;

  // Sort by severity (critical first) then by sponsor demand
  const sortedGaps = [...filteredGaps].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.sponsorDemand - a.sponsorDemand;
  });

  // Summary stats
  const criticalCount = sortedGaps.filter((g) => g.severity === "critical").length;
  const totalImpact = sortedGaps.reduce((sum, g) => sum + g.estimatedImpact, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Capability Gaps
            </CardTitle>
            <CardDescription>
              Sponsor-identified capability needs requiring attention
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-destructive">{criticalCount}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{formatCurrency(totalImpact)}</div>
              <div className="text-xs text-muted-foreground">Total Impact</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Capability</TableHead>
                <TableHead>Mission Areas</TableHead>
                <TableHead className="text-center">Severity</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Sponsor Demand</TableHead>
                <TableHead className="text-right">Est. Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGaps.map((gap) => (
                <TableRow
                  key={gap.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(gap.id)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{gap.capability}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {gap.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {gap.missionAreas.slice(0, 3).map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {gap.missionAreas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gap.missionAreas.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getSeverityBadge(gap.severity)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(gap.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold">{gap.sponsorDemand}</span>
                      <span className="text-xs text-muted-foreground">sponsors</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(gap.estimatedImpact)}
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

