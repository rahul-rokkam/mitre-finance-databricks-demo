import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Trophy,
  AlertTriangle,
  Briefcase,
  Landmark,
  Building2,
} from "lucide-react";
import type { TimeWindow, FiscalYear } from "./types";
import { useGovernmentRelationsSnapshotSuspense } from "./use-government-relations";
import {
  MarketShareByMissionAreaChart,
  WinLossByCompetitorChart,
  PipelinePrioritizationScatter,
} from "./charts";
import { CapabilityGapsTable, PipelineTable } from "./tables";
import { formatCurrency } from "@/components/financial-health/charts/chart-utils";

// KPI Card component for summary section
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  status?: "good" | "warning" | "critical";
}

function KpiCard({ title, value, subtitle, icon, trend, trendValue, status }: KpiCardProps) {
  const statusColors = {
    good: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    critical: "text-destructive",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${status ? statusColors[status] : ""}`}>
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {trend && trendValue && (
            <span
              className={`flex items-center text-xs ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              ) : null}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernmentRelationsContent() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("YTD");
  const [selectedMissionArea, setSelectedMissionArea] = useState<string>("all");

  const { data } = useGovernmentRelationsSnapshotSuspense({ timeWindow });
  const today = new Date();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Government Relations & Strategic Positioning
          </h1>
          <p className="text-muted-foreground mt-1">
            Strategic insights for competitive positioning and growth opportunities
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Window */}
          <Tabs
            value={timeWindow}
            onValueChange={(v) => setTimeWindow(v as TimeWindow)}
          >
            <TabsList>
              <TabsTrigger value="YTD">YTD</TabsTrigger>
              <TabsTrigger value="QTD">QTD</TabsTrigger>
              <TabsTrigger value="MTD">MTD</TabsTrigger>
              <TabsTrigger value="T12M">T12M</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mission Area Filter */}
          <Select value={selectedMissionArea} onValueChange={setSelectedMissionArea}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Mission Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mission Areas</SelectItem>
              {data.missionAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* As-of Date */}
          <Badge variant="outline" className="gap-1.5 py-1.5">
            <Calendar className="h-3.5 w-3.5" />
            As of{" "}
            {today.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Overall Market Share"
          value={`${data.summaryKpis.overallMarketShare.toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
          trend={data.summaryKpis.marketShareTrend >= 0 ? "up" : "down"}
          trendValue={`${data.summaryKpis.marketShareTrend >= 0 ? "+" : ""}${data.summaryKpis.marketShareTrend.toFixed(1)}% YoY`}
          status={data.summaryKpis.marketShareTrend >= 0 ? "good" : "warning"}
        />
        <KpiCard
          title="Win Rate vs Competitors"
          value={`${data.summaryKpis.overallWinRate.toFixed(1)}%`}
          icon={<Trophy className="h-4 w-4" />}
          trend={data.summaryKpis.winRateTrend >= 0 ? "up" : "down"}
          trendValue={`${data.summaryKpis.winRateTrend >= 0 ? "+" : ""}${data.summaryKpis.winRateTrend.toFixed(1)}% YoY`}
          status={data.summaryKpis.overallWinRate >= 55 ? "good" : "warning"}
        />
        <KpiCard
          title="Active Pipeline Value"
          value={formatCurrency(data.summaryKpis.activePipelineValue)}
          subtitle={`${data.summaryKpis.pipelineItemsCount} opportunities`}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <KpiCard
          title="Critical Capability Gaps"
          value={data.summaryKpis.criticalGapsCount}
          subtitle="requiring urgent attention"
          icon={<AlertTriangle className="h-4 w-4" />}
          status={data.summaryKpis.criticalGapsCount === 0 ? "good" : data.summaryKpis.criticalGapsCount <= 2 ? "warning" : "critical"}
        />
      </div>

      {/* ============ Section A: Competitive Positioning ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          FFRDC Competitive Positioning
        </h2>

        {/* Market Share and Win/Loss Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MarketShareByMissionAreaChart
            marketShare={data.marketShare}
            selectedMissionArea={selectedMissionArea}
          />
          <WinLossByCompetitorChart
            winLossRecords={data.winLossRecords}
          />
        </div>

        {/* Capability Gaps Table */}
        <CapabilityGapsTable
          gaps={data.capabilityGaps}
          selectedMissionArea={selectedMissionArea}
        />
      </section>

      {/* ============ Section B: Strategic M&A & Partnership Pipeline ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Strategic M&A & Partnership Pipeline
        </h2>

        {/* Pipeline Prioritization and Table */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PipelinePrioritizationScatter
            pipeline={data.pipeline}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Pipeline Summary by Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stage summary cards */}
              {(["Negotiation", "Due Diligence", "Screening", "Sourcing"] as const).map((stage) => {
                const stageItems = data.pipeline.filter((p) => p.stage === stage);
                const stageValue = stageItems.reduce((sum, p) => sum + p.estimatedImpact, 0);
                const stageColors = {
                  Sourcing: "border-l-slate-500",
                  Screening: "border-l-blue-500",
                  "Due Diligence": "border-l-amber-500",
                  Negotiation: "border-l-purple-500",
                };
                return (
                  <div
                    key={stage}
                    className={`p-3 rounded-md border-l-4 ${stageColors[stage]} bg-muted/30`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{stage}</div>
                        <div className="text-sm text-muted-foreground">
                          {stageItems.length} {stageItems.length === 1 ? "item" : "items"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(stageValue)}</div>
                        <div className="text-xs text-muted-foreground">Est. Impact</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Full Pipeline Table */}
        <PipelineTable pipeline={data.pipeline} />
      </section>
    </div>
  );
}

