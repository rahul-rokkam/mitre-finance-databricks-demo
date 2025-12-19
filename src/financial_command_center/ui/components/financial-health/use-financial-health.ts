/**
 * Financial Health data hooks
 * Currently uses static data, but designed to be swap-friendly with
 * Databricks SQL Warehouse-backed APIs.
 */

import { useSuspenseQuery } from "@tanstack/react-query";
import type { FinancialHealthSnapshot, TimeWindow } from "./types";
import { staticFinancialHealthSnapshot } from "./static-data";

interface UseFinancialHealthOptions {
  timeWindow?: TimeWindow;
  ffrdcId?: string;
}

// Simulates an API call with a small delay for realistic loading states
async function fetchFinancialHealthSnapshot(
  _options: UseFinancialHealthOptions
): Promise<FinancialHealthSnapshot> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In the future, this will be replaced with:
  // const response = await axios.get('/api/financial-health-snapshot', { params: options });
  // return response.data;

  return staticFinancialHealthSnapshot;
}

export function useFinancialHealthSnapshotSuspense(
  options: UseFinancialHealthOptions = {}
) {
  return useSuspenseQuery({
    queryKey: ["financial-health-snapshot", options.timeWindow, options.ffrdcId],
    queryFn: () => fetchFinancialHealthSnapshot(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function getFinancialHealthQueryKey(options: UseFinancialHealthOptions = {}) {
  return ["financial-health-snapshot", options.timeWindow, options.ffrdcId];
}


