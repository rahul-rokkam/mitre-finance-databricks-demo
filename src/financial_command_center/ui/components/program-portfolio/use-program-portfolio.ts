/**
 * Program Portfolio data hooks
 * Currently uses static data, but designed to be swap-friendly with
 * Databricks SQL Warehouse-backed APIs.
 */

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ProgramPortfolioSnapshot, TimeWindow } from "./types";
import { staticProgramPortfolioSnapshot } from "./static-data";

interface UseProgramPortfolioOptions {
  timeWindow?: TimeWindow;
  sponsorId?: string;
  ffrdcId?: string;
}

// Simulates an API call with a small delay for realistic loading states
async function fetchProgramPortfolioSnapshot(
  _options: UseProgramPortfolioOptions
): Promise<ProgramPortfolioSnapshot> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 350));

  // In the future, this will be replaced with:
  // const response = await axios.get('/api/program-portfolio-snapshot', { params: options });
  // return response.data;

  return staticProgramPortfolioSnapshot;
}

export function useProgramPortfolioSnapshotSuspense(
  options: UseProgramPortfolioOptions = {}
) {
  return useSuspenseQuery({
    queryKey: getProgramPortfolioQueryKey(options),
    queryFn: () => fetchProgramPortfolioSnapshot(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function getProgramPortfolioQueryKey(options: UseProgramPortfolioOptions = {}) {
  return ["program-portfolio-snapshot", options.timeWindow, options.sponsorId, options.ffrdcId];
}

