import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  Activity,
  Heart,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import type { SponsorFundingSnapshot } from "./types";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

interface SponsorDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsorId: string | null;
  data: SponsorFundingSnapshot;
}

function MetricRow({
  label,
  value,
  status,
  subtitle,
}: {
  label: string;
  value: string | number;
  status?: "good" | "warning" | "critical";
  subtitle?: string;
}) {
  const statusColors = {
    good: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    critical: "text-destructive",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <span className="text-sm text-muted-foreground">{label}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground ml-2">({subtitle})</span>
        )}
      </div>
      <span className={`font-semibold ${status ? statusColors[status] : ""}`}>
        {value}
      </span>
    </div>
  );
}

function TrendIndicator({ current, previous, format = "number" }: {
  current: number;
  previous: number;
  format?: "number" | "percent" | "currency";
}) {
  const diff = current - previous;
  const isUp = diff > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;

  let formattedDiff = "";
  if (format === "percent") {
    formattedDiff = `${isUp ? "+" : ""}${diff.toFixed(1)}%`;
  } else if (format === "currency") {
    formattedDiff = `${isUp ? "+" : ""}${formatCurrency(diff)}`;
  } else {
    formattedDiff = `${isUp ? "+" : ""}${diff.toFixed(2)}`;
  }

  return (
    <span
      className={`flex items-center text-xs ${
        isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
      }`}
    >
      <Icon className="h-3 w-3 mr-0.5" />
      {formattedDiff} vs prev month
    </span>
  );
}

export function SponsorDrilldownDrawer({
  open,
  onOpenChange,
  sponsorId,
  data,
}: SponsorDrilldownDrawerProps) {
  if (!sponsorId) return null;

  const stewardship = data.stewardship.find((s) => s.sponsorId === sponsorId);
  const health = data.health.find((h) => h.sponsorId === sponsorId);
  const renewals = data.renewals.filter((r) => r.sponsorId === sponsorId);
  const sponsor = data.sponsors.find((s) => s.id === sponsorId);

  if (!stewardship || !health || !sponsor) return null;

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "excellent":
      case "healthy":
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
  };

  // Get trend data (comparing last to second-to-last month)
  const lastIndirectRate = stewardship.indirectRateTrend[stewardship.indirectRateTrend.length - 1];
  const prevIndirectRate = stewardship.indirectRateTrend[stewardship.indirectRateTrend.length - 2];

  const lastNps = health.npsTrend[health.npsTrend.length - 1];
  const prevNps = health.npsTrend[health.npsTrend.length - 2];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">{sponsor.abbreviation}</SheetTitle>
            <Badge variant={getStatusBadgeVariant(stewardship.status)}>
              {stewardship.status.charAt(0).toUpperCase() + stewardship.status.slice(1)}
            </Badge>
          </div>
          <SheetDescription>{sponsor.name}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <Tabs defaultValue="stewardship" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stewardship" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Steward
              </TabsTrigger>
              <TabsTrigger value="efficiency" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Efficiency
              </TabsTrigger>
              <TabsTrigger value="health" className="text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Health
              </TabsTrigger>
              <TabsTrigger value="renewals" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Renewals
              </TabsTrigger>
            </TabsList>

            {/* Stewardship Tab */}
            <TabsContent value="stewardship" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cost Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <MetricRow
                    label="CPI (Cost Performance Index)"
                    value={stewardship.cpi.toFixed(2)}
                    status={stewardship.cpi >= 1.0 ? "good" : stewardship.cpi >= 0.95 ? "warning" : "critical"}
                    subtitle={stewardship.cpi >= 1.0 ? "under budget" : "over budget"}
                  />
                  <MetricRow
                    label="Actual Spend"
                    value={formatCurrency(stewardship.actualSpend)}
                  />
                  <MetricRow
                    label="Estimated Spend"
                    value={formatCurrency(stewardship.estimatedSpend)}
                  />
                  <MetricRow
                    label="Variance"
                    value={formatCurrency(stewardship.estimatedSpend - stewardship.actualSpend)}
                    status={stewardship.cpi >= 1.0 ? "good" : "critical"}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overhead & Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <MetricRow
                    label="Overhead Ratio"
                    value={`${stewardship.overheadRatio.toFixed(1)}%`}
                    status={stewardship.overheadRatio <= 20 ? "good" : "warning"}
                    subtitle="target: ≤20%"
                  />
                  <MetricRow
                    label="Indirect Rate"
                    value={`${stewardship.indirectRateCurrent.toFixed(1)}%`}
                    status={stewardship.indirectRateCurrent <= stewardship.indirectRateCap ? "good" : "critical"}
                    subtitle={`cap: ${stewardship.indirectRateCap}%`}
                  />
                  <div className="pt-1">
                    <TrendIndicator
                      current={lastIndirectRate?.actualRate || 0}
                      previous={prevIndirectRate?.actualRate || 0}
                      format="percent"
                    />
                  </div>
                  <MetricRow
                    label="Billable Utilization"
                    value={`${stewardship.billableUtilizationPct.toFixed(1)}%`}
                    status={stewardship.billableUtilizationPct >= 80 ? "good" : "warning"}
                    subtitle="target: ≥80%"
                  />
                </CardContent>
              </Card>

              {stewardship.overheadByFfrdc.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overhead by FFRDC</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {stewardship.overheadByFfrdc.map((ffrdc) => (
                      <MetricRow
                        key={ffrdc.ffrdcId}
                        label={ffrdc.ffrdcName}
                        value={`${ffrdc.overheadRatio.toFixed(1)}%`}
                        status={ffrdc.overheadRatio <= ffrdc.target ? "good" : "warning"}
                        subtitle={`target: ${ffrdc.target}%`}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Efficiency Tab */}
            <TabsContent value="efficiency" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">FFRDC Cost Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    See the Efficiency Metrics section for detailed FFRDC-level analysis including:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Cost per Technical FTE
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Bench time trends
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Headcount vs sponsor demand alignment
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Staffing Alignment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Efficiency metrics are tracked at the FFRDC level to ensure appropriate
                    staffing alignment with sponsor demand. Use the FFRDC filter in the main
                    dashboard to drill into specific center performance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                    <Badge variant={getStatusBadgeVariant(health.status)}>
                      {health.healthScore}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <MetricRow
                    label="NPS Score"
                    value={health.npsScore}
                    status={health.npsScore >= 70 ? "good" : health.npsScore >= 50 ? "warning" : "critical"}
                    subtitle="net promoter score"
                  />
                  <div className="pt-1 pb-2">
                    <TrendIndicator
                      current={lastNps?.value || 0}
                      previous={prevNps?.value || 0}
                      format="number"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <MetricRow
                    label="Defect Rate"
                    value={`${health.defectRate.toFixed(1)}%`}
                    status={health.defectRate <= 2 ? "good" : health.defectRate <= 3 ? "warning" : "critical"}
                    subtitle="target: ≤2%"
                  />
                  <MetricRow
                    label="Rework Percentage"
                    value={`${health.reworkPct.toFixed(1)}%`}
                    status={health.reworkPct <= 5 ? "good" : health.reworkPct <= 7 ? "warning" : "critical"}
                    subtitle="target: ≤5%"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Schedule & Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <MetricRow
                    label="On-Time Delivery"
                    value={`${health.onTimeDeliveryPct.toFixed(1)}%`}
                    status={health.onTimeDeliveryPct >= 95 ? "good" : health.onTimeDeliveryPct >= 90 ? "warning" : "critical"}
                    subtitle="target: ≥95%"
                  />
                  <MetricRow
                    label="Budget Variance"
                    value={`${health.budgetVariancePct >= 0 ? "+" : ""}${health.budgetVariancePct.toFixed(1)}%`}
                    status={health.budgetVariancePct >= 0 ? "good" : health.budgetVariancePct >= -3 ? "warning" : "critical"}
                    subtitle={health.budgetVariancePct >= 0 ? "under budget" : "over budget"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Renewals Tab */}
            <TabsContent value="renewals" className="space-y-4 mt-4">
              {renewals.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No upcoming renewals for this sponsor
                  </CardContent>
                </Card>
              ) : (
                renewals.map((renewal) => (
                  <Card key={`${renewal.sponsorId}-${renewal.renewalDate}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Renewal: {new Date(renewal.renewalDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(renewal.healthStatus)}>
                          {renewal.daysUntilRenewal} days
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <MetricRow
                        label="Contract Value"
                        value={formatCurrency(renewal.contractValue)}
                      />
                      <MetricRow
                        label="Annual Run Rate"
                        value={formatCurrency(renewal.annualRunRate)}
                      />
                      <MetricRow
                        label="NPS Score"
                        value={renewal.npsScore}
                        status={renewal.npsScore >= 70 ? "good" : renewal.npsScore >= 50 ? "warning" : "critical"}
                      />
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            {renewal.riskNotes}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

