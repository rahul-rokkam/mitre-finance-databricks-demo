import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, X } from "lucide-react";
import { toast } from "sonner";
import type { FinancialHealthSnapshot, KpiMetric, TimeWindow } from "./types";
import { StatusPill } from "./status-pill";
import { formatCurrency, formatPercent } from "./charts/chart-utils";
import {
  getBudgetVarianceStatus,
  getMarginChangeStatus,
  getUtilizationStatus,
  getIndirectRateStatus,
  getDsoStatus,
} from "./status-rules";

interface FFRDCDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiId: string | null;
  ffrdcId: string | null;
  timeWindow: TimeWindow;
  data: FinancialHealthSnapshot;
}

export function FFRDCDrilldownDrawer({
  open,
  onOpenChange,
  kpiId,
  ffrdcId,
  timeWindow,
  data,
}: FFRDCDrilldownDrawerProps) {
  const [activeTab, setActiveTab] = useState("breakdown");

  const kpi = data.kpis.find((k) => k.id === kpiId);
  const ffrdc = ffrdcId ? data.ffrdcs.find((f) => f.id === ffrdcId) : null;

  const getKpiTitle = () => {
    if (!kpi) return "Financial Details";
    return kpi.label;
  };

  const getKpiSubtitle = () => {
    const parts = [];
    if (ffrdc) {
      parts.push(ffrdc.shortName);
    } else {
      parts.push("All FFRDCs");
    }
    parts.push(timeWindow);
    return parts.join(" • ");
  };

  const handleCopySnapshot = () => {
    if (!kpi) return;

    const snapshotText = `${kpi.label}: ${formatKpiValue(kpi)}
Delta: ${kpi.delta >= 0 ? "+" : ""}${kpi.delta}% ${kpi.deltaLabel}
Status: ${kpi.status}
As of: ${data.asOfDate}`;

    navigator.clipboard.writeText(snapshotText);
    toast.success("Snapshot copied to clipboard");
  };

  const handleExportCSV = () => {
    if (!kpiId) return;

    let csvContent = "";
    let filename = "";

    switch (kpiId) {
      case "ytd-revenue":
        csvContent = "FFRDC,Actual,Budget,Variance,Variance %\n";
        data.revenueBudget.forEach((item) => {
          csvContent += `${item.ffrdcName},${item.actual},${item.budget},${item.variance},${item.variancePercent}\n`;
        });
        filename = "revenue_vs_budget.csv";
        break;
      case "gross-margin":
        csvContent = "FFRDC,Current Margin %,Prior Margin %,Change\n";
        data.marginByFFRDC.forEach((item) => {
          csvContent += `${item.ffrdcName},${item.currentMargin},${item.priorMargin},${item.change}\n`;
        });
        filename = "gross_margin.csv";
        break;
      case "headcount-util":
        csvContent = "FFRDC,Headcount,Utilization %,Billable Hours,Total Hours\n";
        data.headcountUtil.forEach((item) => {
          csvContent += `${item.ffrdcName},${item.headcount},${item.utilizationPct},${item.billableHours},${item.totalHours}\n`;
        });
        filename = "headcount_utilization.csv";
        break;
      case "indirect-rate":
        csvContent = "FFRDC,Actual Rate %,Cap Rate %,Variance\n";
        data.indirectRates.forEach((item) => {
          csvContent += `${item.ffrdcName},${item.actualRate},${item.capRate},${item.variance}\n`;
        });
        filename = "indirect_rates.csv";
        break;
      default:
        toast.error("Export not available for this KPI");
        return;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}`);
  };

  const formatKpiValue = (kpi: KpiMetric) => {
    switch (kpi.unit) {
      case "currency":
        return formatCurrency(kpi.value);
      case "percent":
        return formatPercent(kpi.value);
      case "days":
        return `${kpi.value} days`;
      default:
        return kpi.value.toString();
    }
  };

  const renderBreakdownContent = () => {
    switch (kpiId) {
      case "ytd-revenue":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FFRDC</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueBudget.map((item) => {
                  const status = getBudgetVarianceStatus(item.variancePercent);
                  return (
                    <TableRow key={item.ffrdcId}>
                      <TableCell className="font-medium">{item.ffrdcName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.actual)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.budget)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            item.variancePercent >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {item.variancePercent >= 0 ? "+" : ""}
                          {item.variancePercent.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusPill status={status} showLabel={false} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "gross-margin":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FFRDC</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Prior</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.marginByFFRDC.map((item) => {
                  const status = getMarginChangeStatus(item.change);
                  return (
                    <TableRow key={item.ffrdcId}>
                      <TableCell className="font-medium">{item.ffrdcName}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.currentMargin)}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.priorMargin)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            item.change >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {item.change >= 0 ? "+" : ""}
                          {item.change.toFixed(1)}pp
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusPill status={status} showLabel={false} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "cash-position":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Cash Balance</div>
                <div className="text-2xl font-bold">{formatCurrency(data.cashPosition.cashBalance)}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Working Capital</div>
                <div className="text-2xl font-bold">{formatCurrency(data.cashPosition.workingCapital)}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">DSO</div>
                <div className="text-2xl font-bold">{data.cashPosition.dso} days</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">DPO</div>
                <div className="text-2xl font-bold">{data.cashPosition.dpo} days</div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aging Bucket</TableHead>
                  <TableHead className="text-right">AR</TableHead>
                  <TableHead className="text-right">AP</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.cashPosition.agingBuckets.map((bucket) => (
                  <TableRow key={bucket.label}>
                    <TableCell className="font-medium">{bucket.label}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bucket.ar)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bucket.ap)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(bucket.ar - bucket.ap)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "headcount-util":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FFRDC</TableHead>
                  <TableHead className="text-right">Headcount</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                  <TableHead className="text-right">Billable Hrs</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.headcountUtil.map((item) => {
                  const status = getUtilizationStatus(item.utilizationPct);
                  return (
                    <TableRow key={item.ffrdcId}>
                      <TableCell className="font-medium">{item.ffrdcName}</TableCell>
                      <TableCell className="text-right">{item.headcount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.utilizationPct)}</TableCell>
                      <TableCell className="text-right">{item.billableHours.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <StatusPill status={status} showLabel={false} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "opex-ratio":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Actual ($M)</TableHead>
                  <TableHead className="text-right">Forecast ($M)</TableHead>
                  <TableHead className="text-right">Budget ($M)</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.opexTrend.map((item) => {
                  const variance = ((item.actual - item.forecast) / item.forecast) * 100;
                  const status = getBudgetVarianceStatus(variance);
                  return (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">${item.actual.toFixed(1)}M</TableCell>
                      <TableCell className="text-right">${item.forecast.toFixed(1)}M</TableCell>
                      <TableCell className="text-right">${item.budget.toFixed(1)}M</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            variance <= 2
                              ? "text-emerald-600 dark:text-emerald-400"
                              : variance <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {variance >= 0 ? "+" : ""}
                          {variance.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      case "indirect-rate":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FFRDC</TableHead>
                  <TableHead className="text-right">Actual Rate</TableHead>
                  <TableHead className="text-right">Cap Rate</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.indirectRates.map((item) => {
                  const status = getIndirectRateStatus(item.actualRate, item.capRate);
                  return (
                    <TableRow key={item.ffrdcId}>
                      <TableCell className="font-medium">{item.ffrdcName}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.actualRate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.capRate)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            item.variance <= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : item.variance <= 0.5
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {item.variance >= 0 ? "+" : ""}
                          {item.variance.toFixed(1)}pp
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusPill status={status} showLabel={false} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Select a KPI to view detailed breakdown
          </div>
        );
    }
  };

  const renderDriversContent = () => {
    switch (kpiId) {
      case "ytd-revenue":
        const topVariances = [...data.revenueBudget]
          .sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent))
          .slice(0, 3);
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Top contributors to revenue variance:
            </p>
            {topVariances.map((item, index) => (
              <div key={item.ffrdcId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.ffrdcName}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(Math.abs(item.variance))} {item.variance >= 0 ? "over" : "under"} budget
                  </div>
                </div>
                <Badge variant={item.variancePercent >= 0 ? "default" : "destructive"}>
                  {item.variancePercent >= 0 ? "+" : ""}{item.variancePercent.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        );

      case "headcount-util":
        const lowUtilization = data.headcountUtil
          .filter((item) => item.utilizationPct < 80)
          .sort((a, b) => a.utilizationPct - b.utilizationPct);
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              FFRDCs below 80% utilization target:
            </p>
            {lowUtilization.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                All FFRDCs meeting utilization targets
              </div>
            ) : (
              lowUtilization.map((item) => (
                <div key={item.ffrdcId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="font-medium">{item.ffrdcName}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.headcount.toLocaleString()} staff
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      {formatPercent(item.utilizationPct)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(80 - item.utilizationPct).toFixed(1)}pp below target
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "indirect-rate":
        const overCap = data.indirectRates
          .filter((item) => item.actualRate >= item.capRate)
          .sort((a, b) => b.variance - a.variance);
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              FFRDCs at or exceeding sponsor caps:
            </p>
            {overCap.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                All FFRDCs within sponsor caps
              </div>
            ) : (
              overCap.map((item) => (
                <div key={item.ffrdcId} className="flex items-center gap-4 p-3 rounded-lg bg-red-500/10">
                  <div className="flex-1">
                    <div className="font-medium">{item.ffrdcName}</div>
                    <div className="text-sm text-muted-foreground">
                      Cap: {formatPercent(item.capRate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 dark:text-red-400">
                      {formatPercent(item.actualRate)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      +{item.variance.toFixed(1)}pp over cap
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Driver analysis not available for this KPI
          </div>
        );
    }
  };

  const renderNotesContent = () => {
    const notes: Record<string, { title: string; content: string }> = {
      "ytd-revenue": {
        title: "Revenue Performance Context",
        content:
          "YTD revenue tracking is critical for FFRDC financial stewardship. Variances from budget may indicate changes in sponsor priorities, contract modifications, or timing differences in funding obligations. Positive variances should be evaluated for sustainability, while negative variances require root cause analysis and potential corrective action.",
      },
      "gross-margin": {
        title: "Margin Management",
        content:
          "Gross margin trends reflect operational efficiency and pricing effectiveness. Declining margins may indicate increased labor costs, pricing pressure, or changes in program mix. As a not-for-profit FFRDC operator, maintaining healthy margins ensures long-term mission sustainability and capability investment.",
      },
      "cash-position": {
        title: "Liquidity & Working Capital",
        content:
          "Cash position and working capital metrics are essential for operational continuity. DSO trends indicate collection efficiency and sponsor payment patterns. Maintaining adequate liquidity ensures MITRE can meet obligations and invest in mission capabilities without disruption.",
      },
      "headcount-util": {
        title: "Resource Utilization",
        content:
          "Utilization rates balance workforce capacity with program demand. Target utilization supports both financial health and staff well-being. Low utilization may indicate business development needs, while sustained high utilization risks burnout and delivery quality.",
      },
      "opex-ratio": {
        title: "Operating Efficiency",
        content:
          "Operating expense management demonstrates stewardship of sponsor funds. Variances from forecast should be analyzed for one-time vs. recurring impacts. Efficient operations enable greater investment in technical capabilities and mission delivery.",
      },
      "indirect-rate": {
        title: "Indirect Cost Compliance",
        content:
          "Indirect cost rates are subject to sponsor-negotiated caps. Exceeding caps can result in unrecoverable costs and sponsor relationship issues. Proactive monitoring and management ensures compliance while maintaining necessary support infrastructure.",
      },
    };

    const note = kpiId ? notes[kpiId] : null;

    if (!note) {
      return (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          Notes not available for this KPI
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h4 className="font-semibold">{note.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{note.content}</p>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle>{getKpiTitle()}</SheetTitle>
              <SheetDescription>{getKpiSubtitle()}</SheetDescription>
            </div>
            {kpi && <StatusPill status={kpi.status} />}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-280px)] mt-4">
            <TabsContent value="breakdown" className="mt-0">
              {renderBreakdownContent()}
            </TabsContent>
            <TabsContent value="drivers" className="mt-0">
              {renderDriversContent()}
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              {renderNotesContent()}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex items-center gap-2 pt-4 border-t mt-4">
          <Button variant="outline" size="sm" onClick={handleCopySnapshot}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Snapshot
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


