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
  ShieldAlert,
  Users,
  Building2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import type { TimeWindow } from "./types";
import { useRiskComplianceSnapshotSuspense } from "./use-risk-compliance";
import {
  FindingsAgingChart,
  RootCauseTagsChart,
  RevRecScheduleChart,
  ControlEffectivenessChart,
  TopSponsorsConcentrationChart,
  DiversificationChart,
  RetentionTrendChart,
  BenchUtilizationChart,
  TurnoverRateChart,
  ControlExceptionsTrendChart,
  FailedAuditTestsChart,
  BudgetVarianceRootCauseChart,
} from "./charts";
import {
  ComplianceCalendarTable,
  KeyPersonDependencyTable,
  GLExceptionsTable,
  CovenantComplianceTable,
} from "./tables";

// KPI Card component for the summary cards
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

export function RiskComplianceContent() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("YTD");
  const [selectedFfrdc, setSelectedFfrdc] = useState<string>("all");

  const { data } = useRiskComplianceSnapshotSuspense({ timeWindow });
  const today = new Date();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Risk & Compliance Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive risk assessment and compliance tracking
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

          {/* FFRDC Filter */}
          <Select value={selectedFfrdc} onValueChange={setSelectedFfrdc}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select FFRDC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All FFRDCs</SelectItem>
              {data.ffrdcs.map((ffrdc) => (
                <SelectItem key={ffrdc.id} value={ffrdc.id}>
                  {ffrdc.shortName}
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

      {/* ============ Section 1: Audit & Control Dashboard ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Audit & Control Dashboard
        </h2>

        {/* KPI Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Open Findings"
            value={data.auditControl.openFindingsCount}
            subtitle="requiring remediation"
            icon={<AlertTriangle className="h-4 w-4" />}
            status={data.auditControl.openFindingsCount > 20 ? "warning" : "good"}
          />
          <KpiCard
            title="Avg Finding Age"
            value={`${data.auditControl.avgFindingAgeDays} days`}
            subtitle="across all findings"
            icon={<Clock className="h-4 w-4" />}
            status={data.auditControl.avgFindingAgeDays > 60 ? "warning" : "good"}
          />
          <KpiCard
            title="Findings >90 Days"
            value={data.auditControl.findingsOver90Days}
            subtitle="critical attention"
            icon={<AlertTriangle className="h-4 w-4" />}
            status={data.auditControl.findingsOver90Days > 3 ? "critical" : "good"}
          />
          <KpiCard
            title="Controls Effective"
            value={`${data.auditControl.controlsEffectivePercent.toFixed(1)}%`}
            subtitle="of total controls"
            icon={<CheckCircle className="h-4 w-4" />}
            status={data.auditControl.controlsEffectivePercent >= 85 ? "good" : "warning"}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FindingsAgingChart
            data={data.auditControl.findingsAging}
            totalFindings={data.auditControl.openFindingsCount}
          />
          <RootCauseTagsChart data={data.auditControl.rootCauseTags} />
        </div>

        {/* Control Effectiveness */}
        <ControlEffectivenessChart
          data={data.auditControl.controlEffectiveness}
          overallEffectiveness={data.auditControl.controlsEffectivePercent}
        />

        {/* Revenue Recognition Schedule */}
        <RevRecScheduleChart data={data.auditControl.revRecSchedule} />

        {/* Compliance Calendar */}
        <ComplianceCalendarTable events={data.auditControl.complianceCalendar} />
      </section>

      {/* ============ Section 2: Sponsor & Customer Concentration Risk ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Sponsor & Customer Concentration Risk
        </h2>

        {/* Concentration KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Top 3 Concentration"
            value={`${data.concentrationRisk.top3ConcentrationPercent.toFixed(1)}%`}
            subtitle="of total revenue"
            icon={<Building2 className="h-4 w-4" />}
            status={data.concentrationRisk.top3ConcentrationPercent > 50 ? "warning" : "good"}
          />
          <KpiCard
            title="Top 10 Concentration"
            value={`${data.concentrationRisk.top10ConcentrationPercent.toFixed(1)}%`}
            subtitle="of total revenue"
            icon={<Building2 className="h-4 w-4" />}
            status={data.concentrationRisk.top10ConcentrationPercent > 80 ? "warning" : "good"}
          />
          <KpiCard
            title="Herfindahl Index"
            value={data.concentrationRisk.herfindahlIndex.toFixed(3)}
            subtitle={data.concentrationRisk.herfindahlIndex < 0.15 ? "Unconcentrated" : "Moderately Concentrated"}
            icon={<TrendingUp className="h-4 w-4" />}
            status={data.concentrationRisk.herfindahlIndex < 0.15 ? "good" : "warning"}
          />
        </div>

        {/* Top Sponsors Chart */}
        <TopSponsorsConcentrationChart
          data={data.concentrationRisk.topSponsors}
          top3Percent={data.concentrationRisk.top3ConcentrationPercent}
          top10Percent={data.concentrationRisk.top10ConcentrationPercent}
        />

        {/* Diversification Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DiversificationChart
            data={data.concentrationRisk.geographicDiversification}
            title="Geographic Diversification"
            description="Revenue distribution by region"
          />
          <DiversificationChart
            data={data.concentrationRisk.missionAreaDiversification}
            title="Mission Area Diversification"
            description="Revenue distribution by capability area"
          />
        </div>

        {/* Retention Trend */}
        <RetentionTrendChart data={data.concentrationRisk.retentionTrend} />
      </section>

      {/* ============ Section 3: Talent & Capability Risk ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Talent & Capability Risk
        </h2>

        {/* Talent KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Critical Capabilities at Risk"
            value={data.talentRisk.criticalCapabilitiesAtRisk}
            subtitle="requiring succession planning"
            icon={<AlertTriangle className="h-4 w-4" />}
            status={data.talentRisk.criticalCapabilitiesAtRisk > 2 ? "critical" : "warning"}
          />
          <KpiCard
            title="Avg Bench Utilization"
            value={`${data.talentRisk.avgBenchUtilization.toFixed(1)}%`}
            subtitle="across all FFRDCs"
            icon={<Users className="h-4 w-4" />}
            status={data.talentRisk.avgBenchUtilization > 20 ? "warning" : "good"}
          />
          <KpiCard
            title="Avg Turnover Rate"
            value={`${data.talentRisk.avgTurnoverRate.toFixed(1)}%`}
            subtitle="industry benchmark: 13.5%"
            icon={<TrendingDown className="h-4 w-4" />}
            status={data.talentRisk.avgTurnoverRate > 13.5 ? "warning" : "good"}
          />
        </div>

        {/* Key Person Dependencies */}
        <KeyPersonDependencyTable
          dependencies={data.talentRisk.keyPersonDependencies}
          criticalCount={data.talentRisk.criticalCapabilitiesAtRisk}
        />

        {/* Bench and Turnover Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BenchUtilizationChart
            data={data.talentRisk.benchUtilization}
            avgBenchUtil={data.talentRisk.avgBenchUtilization}
          />
          <TurnoverRateChart
            data={data.talentRisk.turnoverTrend}
            avgTurnoverRate={data.talentRisk.avgTurnoverRate}
          />
        </div>
      </section>

      {/* ============ Section 4: Financial Control Exceptions ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Financial Control Exceptions
        </h2>

        {/* Exceptions KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Open Exceptions"
            value={data.controlExceptions.totalOpenExceptions}
            subtitle="requiring review"
            icon={<AlertTriangle className="h-4 w-4" />}
            status={data.controlExceptions.totalOpenExceptions > 15 ? "warning" : "good"}
          />
          <KpiCard
            title="Escalated Exceptions"
            value={data.controlExceptions.escalatedExceptions}
            subtitle="elevated risk items"
            icon={<AlertTriangle className="h-4 w-4" />}
            status={data.controlExceptions.escalatedExceptions > 2 ? "critical" : "good"}
          />
          <KpiCard
            title="Covenant Breaches"
            value={data.controlExceptions.covenantBreaches}
            subtitle="financial covenants"
            icon={<CheckCircle className="h-4 w-4" />}
            status={data.controlExceptions.covenantBreaches > 0 ? "critical" : "good"}
          />
        </div>

        {/* Exception Trend and Failed Tests */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ControlExceptionsTrendChart
            data={data.controlExceptions.exceptionTrend}
            totalOpenExceptions={data.controlExceptions.totalOpenExceptions}
          />
          <FailedAuditTestsChart data={data.controlExceptions.failedAuditTests} />
        </div>

        {/* GL Exceptions Table */}
        <GLExceptionsTable
          exceptions={data.controlExceptions.glExceptions}
          escalatedCount={data.controlExceptions.escalatedExceptions}
        />

        {/* Covenant Compliance */}
        <CovenantComplianceTable covenants={data.controlExceptions.covenantCompliance} />

        {/* Budget Variance Analysis */}
        <BudgetVarianceRootCauseChart data={data.controlExceptions.budgetVarianceByFfrdc} />
      </section>
    </div>
  );
}

