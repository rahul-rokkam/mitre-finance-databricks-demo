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
import { Calendar } from "lucide-react";
import type { TimeWindow, Signal } from "./types";
import { useFinancialHealthSnapshotSuspense } from "./use-financial-health";
import { KpiCard } from "./kpi-card";
import { SignalsList } from "./signals-list";
import { FFRDCDrilldownDrawer } from "./ffrdc-drilldown-drawer";
import {
  RevenueVsBudgetChart,
  GrossMarginChart,
  HeadcountUtilChart,
  OpexRatioChart,
  IndirectRateChart,
} from "./charts";
import { AgingTable } from "./tables/aging-table";

export function FinancialHealthContent() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("YTD");
  const [selectedFfrdc, setSelectedFfrdc] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [selectedFfrdcId, setSelectedFfrdcId] = useState<string | null>(null);

  const { data } = useFinancialHealthSnapshotSuspense({ timeWindow });

  const handleKpiClick = (kpiId: string) => {
    setSelectedKpiId(kpiId);
    setSelectedFfrdcId(selectedFfrdc === "all" ? null : selectedFfrdc);
    setDrawerOpen(true);
  };

  const handleChartClick = (ffrdcId: string, kpiId: string) => {
    setSelectedKpiId(kpiId);
    setSelectedFfrdcId(ffrdcId);
    setDrawerOpen(true);
  };

  const handleSignalClick = (signal: Signal) => {
    setSelectedKpiId(signal.kpiId);
    setSelectedFfrdcId(signal.ffrdcId || null);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Health Snapshot
          </h1>
          <p className="text-muted-foreground mt-1">
            Mission-aligned financial stewardship across six FFRDCs
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
            As of {new Date(data.asOfDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            onClick={() => handleKpiClick(kpi.id)}
          />
        ))}
      </div>

      {/* Charts and Signals Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Charts - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue vs Budget */}
          <RevenueVsBudgetChart
            data={data.revenueBudget}
            onBarClick={(ffrdcId) => handleChartClick(ffrdcId, "ytd-revenue")}
          />

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gross Margin Trend */}
            <GrossMarginChart
              data={data.marginTrend}
              ffrdcs={data.ffrdcs}
              onLineClick={(ffrdcId) => handleChartClick(ffrdcId, "gross-margin")}
            />

            {/* Operating Expense */}
            <OpexRatioChart data={data.opexTrend} />
          </div>

          {/* Second Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Headcount & Utilization */}
            <HeadcountUtilChart
              data={data.headcountUtil}
              onBarClick={(ffrdcId) => handleChartClick(ffrdcId, "headcount-util")}
            />

            {/* Indirect Cost Rates */}
            <IndirectRateChart
              data={data.indirectRates}
              onBarClick={(ffrdcId) => handleChartClick(ffrdcId, "indirect-rate")}
            />
          </div>

          {/* Cash & Working Capital */}
          <AgingTable cashPosition={data.cashPosition} />
        </div>

        {/* Signals Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <SignalsList
              signals={data.signals}
              onSignalClick={handleSignalClick}
              maxItems={10}
            />
          </div>
        </div>
      </div>

      {/* Drilldown Drawer */}
      <FFRDCDrilldownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        kpiId={selectedKpiId}
        ffrdcId={selectedFfrdcId}
        timeWindow={timeWindow}
        data={data}
      />
    </div>
  );
}


