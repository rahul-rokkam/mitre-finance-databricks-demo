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
import type { TimeWindow } from "./types";
import { useProgramPortfolioSnapshotSuspense } from "./use-program-portfolio";
import { SponsorFfrdcAllocationChart } from "./charts/sponsor-ffrdc-allocation-chart";
import { SponsorYtdBudgetTrendChart } from "./charts/sponsor-ytd-budget-trend";
import { FfrdcRevenueCostWaterfallChart } from "./charts/ffrdc-revenue-cost-waterfall";
import { CostPerFteChart } from "./charts/cost-per-fte-chart";
import { PricingRateTrendsChart } from "./charts/pricing-rate-trends";
import { SponsorHealthHeatmapTable } from "./charts/sponsor-health-heatmap-table";
import { SponsorHealthScatterChart } from "./charts/sponsor-health-scatter";
import { ContractRunwayTable } from "./tables/contract-runway-table";

export function ProgramPortfolioContent() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("YTD");
  const [selectedSponsor, setSelectedSponsor] = useState<string>("all");
  const [selectedFfrdc, setSelectedFfrdc] = useState<string>("all");

  const { data } = useProgramPortfolioSnapshotSuspense({ timeWindow });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Program Portfolio & Sponsor Funding Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze sponsor funding, FFRDC cost effectiveness, and portfolio health
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
            {new Date(data.asOfDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>
      </div>

      {/* Section 1: Revenue by Sponsor & FFRDC */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2">
          Revenue by Sponsor & FFRDC
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <SponsorFfrdcAllocationChart
            allocations={data.allocations}
            ffrdcs={data.ffrdcs}
            sponsors={data.sponsors}
            selectedFfrdc={selectedFfrdc}
          />
          <SponsorYtdBudgetTrendChart
            allocations={data.allocations}
            sponsors={data.sponsors}
            selectedSponsor={selectedSponsor}
          />
        </div>
      </section>

      {/* Section 2: FFRDC Margin & Cost Effectiveness */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2">
          FFRDC Margin & Cost Effectiveness
        </h2>
        <FfrdcRevenueCostWaterfallChart
          economics={data.ffrdcEconomics}
          selectedFfrdc={selectedFfrdc}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <CostPerFteChart
            economics={data.ffrdcEconomics}
            selectedFfrdc={selectedFfrdc}
          />
          <PricingRateTrendsChart
            economics={data.ffrdcEconomics}
            selectedFfrdc={selectedFfrdc}
          />
        </div>
      </section>

      {/* Section 3: Sponsor Portfolio Health */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2">
          Sponsor Portfolio Health
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <SponsorHealthScatterChart
            healthData={data.sponsorHealth}
            sponsors={data.sponsors}
            selectedSponsor={selectedSponsor}
          />
          <ContractRunwayTable
            healthData={data.sponsorHealth}
            selectedSponsor={selectedSponsor}
          />
        </div>
        <SponsorHealthHeatmapTable
          healthData={data.sponsorHealth}
          sponsors={data.sponsors}
          selectedSponsor={selectedSponsor}
        />
      </section>
    </div>
  );
}

