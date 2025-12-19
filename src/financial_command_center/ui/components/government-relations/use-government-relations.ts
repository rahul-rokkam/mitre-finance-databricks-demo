/**
 * Government Relations data hooks
 * Currently uses static data, but designed to be swap-friendly with
 * Databricks SQL Warehouse-backed APIs.
 */

import { useSuspenseQuery } from "@tanstack/react-query";
import type { GovernmentRelationsSnapshot, TimeWindow, FiscalYear } from "./types";
import { staticGovernmentRelationsSnapshot } from "./static-data";

interface UseGovernmentRelationsOptions {
  timeWindow?: TimeWindow;
  fiscalYear?: FiscalYear;
  missionAreaId?: string;
}

// Simulates an API call with a small delay for realistic loading states
async function fetchGovernmentRelationsSnapshot(
  _options: UseGovernmentRelationsOptions
): Promise<GovernmentRelationsSnapshot> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // In the future, this will be replaced with:
  // const response = await axios.get('/api/government-relations-snapshot', { params: options });
  // return response.data;

  return staticGovernmentRelationsSnapshot;
}

export function useGovernmentRelationsSnapshotSuspense(
  options: UseGovernmentRelationsOptions = {}
) {
  return useSuspenseQuery({
    queryKey: getGovernmentRelationsQueryKey(options),
    queryFn: () => fetchGovernmentRelationsSnapshot(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function getGovernmentRelationsQueryKey(options: UseGovernmentRelationsOptions = {}) {
  return ["government-relations-snapshot", options.timeWindow, options.fiscalYear, options.missionAreaId];
}

