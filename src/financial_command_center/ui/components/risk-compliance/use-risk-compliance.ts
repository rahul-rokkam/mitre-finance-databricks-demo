/**
 * Risk & Compliance data hooks
 * Currently uses static data, but designed to be swap-friendly with
 * Databricks SQL Warehouse-backed APIs.
 */

import { useSuspenseQuery } from "@tanstack/react-query";
import type { RiskComplianceSnapshot, TimeWindow } from "./types";
import { staticRiskComplianceSnapshot } from "./static-data";

interface UseRiskComplianceOptions {
  timeWindow?: TimeWindow;
  ffrdcId?: string;
}

// Simulates an API call with a small delay for realistic loading states
async function fetchRiskComplianceSnapshot(
  _options: UseRiskComplianceOptions
): Promise<RiskComplianceSnapshot> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 350));

  // In the future, this will be replaced with:
  // const response = await axios.get('/api/risk-compliance-snapshot', { params: options });
  // return response.data;

  return staticRiskComplianceSnapshot;
}

export function useRiskComplianceSnapshotSuspense(
  options: UseRiskComplianceOptions = {}
) {
  return useSuspenseQuery({
    queryKey: getRiskComplianceQueryKey(options),
    queryFn: () => fetchRiskComplianceSnapshot(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function getRiskComplianceQueryKey(options: UseRiskComplianceOptions = {}) {
  return ["risk-compliance-snapshot", options.timeWindow, options.ffrdcId];
}

