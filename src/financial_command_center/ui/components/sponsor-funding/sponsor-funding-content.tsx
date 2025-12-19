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
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Activity,
  Heart,
} from "lucide-react";
import type { TimeWindow } from "./types";
import { useSponsorFundingSnapshotSuspense } from "./use-sponsor-funding";
import {
  CpiDistributionChart,
  OverheadByFfrdcChart,
  IndirectRateTrendChart,
  UtilizationChart,
  CostPerFteByFfrdcChart,
  BenchTrendChart,
  HeadcountVsDemandChart,
  NpsTrendChart,
  QualityMetricsChart,
} from "./charts";
import {
  StewardshipScorecardTable,
  RenewalsTable,
  SponsorHealthTable,
} from "./tables";
import { SponsorDrilldownDrawer } from "./sponsor-drilldown-drawer";

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

export function SponsorFundingContent() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("YTD");
  const [selectedSponsor, setSelectedSponsor] = useState<string>("all");
  const [selectedFfrdc, setSelectedFfrdc] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSponsorId, setDrawerSponsorId] = useState<string | null>(null);

  const { data } = useSponsorFundingSnapshotSuspense({ timeWindow });
  const today = new Date();

  const handleSponsorClick = (sponsorId: string) => {
    setDrawerSponsorId(sponsorId);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sponsor Funding & Cost Stewardship
          </h1>
          <p className="text-muted-foreground mt-1">
            Demonstrating value through transparent stewardship and operational efficiency
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

          {/* Sponsor Filter */}
          <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Sponsor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sponsors</SelectItem>
              {data.sponsors.map((sponsor) => (
                <SelectItem key={sponsor.id} value={sponsor.id}>
                  {sponsor.abbreviation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* FFRDC Filter */}
          <Select value={selectedFfrdc} onValueChange={setSelectedFfrdc}>
            <SelectTrigger className="w-[140px]">
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

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Average CPI"
          value={data.summaryKpis.avgCpi.toFixed(2)}
          subtitle="across all sponsors"
          icon={<Target className="h-4 w-4" />}
          status={data.summaryKpis.avgCpi >= 1.0 ? "good" : "warning"}
        />
        <KpiCard
          title="Avg Overhead Ratio"
          value={`${data.summaryKpis.avgOverheadRatio.toFixed(1)}%`}
          subtitle="target: ≤20%"
          icon={<DollarSign className="h-4 w-4" />}
          status={data.summaryKpis.avgOverheadRatio <= 20 ? "good" : "warning"}
        />
        <KpiCard
          title="Billable Utilization"
          value={`${data.summaryKpis.avgBillableUtilization.toFixed(1)}%`}
          subtitle="target: ≥80%"
          icon={<Users className="h-4 w-4" />}
          status={data.summaryKpis.avgBillableUtilization >= 80 ? "good" : "warning"}
        />
        <KpiCard
          title="Sponsors at Risk"
          value={data.summaryKpis.sponsorsAtRisk}
          subtitle="require attention"
          icon={<AlertTriangle className="h-4 w-4" />}
          status={data.summaryKpis.sponsorsAtRisk === 0 ? "good" : data.summaryKpis.sponsorsAtRisk <= 2 ? "warning" : "critical"}
        />
      </div>

      {/* ============ Section A: Cost Stewardship Scorecard ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Stewardship Scorecard
        </h2>

        {/* Scorecard Table */}
        <StewardshipScorecardTable
          stewardship={data.stewardship}
          selectedSponsor={selectedSponsor}
          onRowClick={handleSponsorClick}
        />

        {/* Stewardship Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CpiDistributionChart
            stewardship={data.stewardship}
            selectedSponsor={selectedSponsor}
            onBarClick={handleSponsorClick}
          />
          <UtilizationChart
            stewardship={data.stewardship}
            selectedSponsor={selectedSponsor}
            onBarClick={handleSponsorClick}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <OverheadByFfrdcChart
            stewardship={data.stewardship}
            selectedSponsor={selectedSponsor}
          />
          <IndirectRateTrendChart
            stewardship={data.stewardship}
            selectedSponsor={selectedSponsor}
          />
        </div>
      </section>

      {/* ============ Section B: Efficiency Metrics ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Efficiency Metrics
        </h2>

        <CostPerFteByFfrdcChart
          efficiency={data.efficiency}
          selectedFfrdc={selectedFfrdc}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <BenchTrendChart
            efficiency={data.efficiency}
            selectedFfrdc={selectedFfrdc}
          />
          <HeadcountVsDemandChart
            efficiency={data.efficiency}
            selectedFfrdc={selectedFfrdc}
          />
        </div>
      </section>

      {/* ============ Section C: Multi-dimensional Sponsor Health ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Multi-dimensional Sponsor Health
        </h2>

        <SponsorHealthTable
          health={data.health}
          selectedSponsor={selectedSponsor}
          onRowClick={handleSponsorClick}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <NpsTrendChart
            health={data.health}
            selectedSponsor={selectedSponsor}
          />
          <QualityMetricsChart
            health={data.health}
            selectedSponsor={selectedSponsor}
          />
        </div>
      </section>

      {/* ============ Section D: Contract Renewal Calendar ============ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contract Renewal Calendar
        </h2>

        <RenewalsTable
          renewals={data.renewals}
          selectedSponsor={selectedSponsor}
          onRowClick={handleSponsorClick}
        />
      </section>

      {/* Drilldown Drawer */}
      <SponsorDrilldownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        sponsorId={drawerSponsorId}
        data={data}
      />
    </div>
  );
}

