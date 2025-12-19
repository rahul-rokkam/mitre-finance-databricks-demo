/**
 * Sponsor Funding data hooks
 * Currently uses static data, but designed to be swap-friendly with
 * Databricks SQL Warehouse-backed APIs.
 */

import { useSuspenseQuery } from "@tanstack/react-query";
import type { SponsorFundingSnapshot, TimeWindow } from "./types";
import { staticSponsorFundingSnapshot } from "./static-data";

interface UseSponsorFundingOptions {
  timeWindow?: TimeWindow;
  sponsorId?: string;
  ffrdcId?: string;
}

// Simulates an API call with a small delay for realistic loading states
async function fetchSponsorFundingSnapshot(
  _options: UseSponsorFundingOptions
): Promise<SponsorFundingSnapshot> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // In the future, this will be replaced with:
  // const response = await axios.get('/api/sponsor-funding-snapshot', { params: options });
  // return response.data;

  return staticSponsorFundingSnapshot;
}

export function useSponsorFundingSnapshotSuspense(
  options: UseSponsorFundingOptions = {}
) {
  return useSuspenseQuery({
    queryKey: getSponsorFundingQueryKey(options),
    queryFn: () => fetchSponsorFundingSnapshot(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function getSponsorFundingQueryKey(options: UseSponsorFundingOptions = {}) {
  return ["sponsor-funding-snapshot", options.timeWindow, options.sponsorId, options.ffrdcId];
}

