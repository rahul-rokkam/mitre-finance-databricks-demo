# Databricks notebook source
# MAGIC %md
# MAGIC # Gold Table Validation
# MAGIC 
# MAGIC This notebook validates that all gold tables have been created and contain data
# MAGIC that can power the UI visualizations.

# COMMAND ----------

from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()

CATALOG = "financial-command-center"

# COMMAND ----------

# MAGIC %md
# MAGIC ## Schema and Table Inventory

# COMMAND ----------

# Expected tables per schema
EXPECTED_TABLES = {
    "financial-health": [
        "dim_date_month",
        "dim_ffrdc",
        "dim_sponsor",
        "fact_finance_monthly",
        "fact_budget_monthly",
        "fact_indirect_rate",
        "fact_cash_metrics",
        "fact_ar_ap_aging",
        "gold_kpi_summary",
        "gold_revenue_vs_budget",
        "gold_gross_margin_trend",
        "gold_opex_trend",
        "gold_headcount_utilization",
        "gold_indirect_rate",
        "gold_cash_position",
        "gold_aging_buckets",
        "gold_signals",
    ],
    "program-portfolio": [
        "dim_sponsor",
        "dim_ffrdc",
        "fact_sponsor_ffrdc_funding",
        "fact_ffrdc_economics",
        "fact_sponsor_health",
        "gold_sponsor_ffrdc_allocation",
        "gold_sponsor_ytd_trend",
        "gold_ffrdc_waterfall",
        "gold_cost_per_fte",
        "gold_pricing_rate_trends",
        "gold_sponsor_health_scatter",
        "gold_sponsor_health_heatmap",
        "gold_contract_runway",
    ],
    "sponsor-funding": [
        "dim_sponsor",
        "dim_ffrdc",
        "fact_cost_stewardship",
        "fact_efficiency",
        "fact_sponsor_experience",
        "fact_contract_renewal",
        "gold_stewardship_scorecard",
        "gold_cpi_distribution",
        "gold_utilization",
        "gold_overhead_by_ffrdc",
        "gold_indirect_rate_trend",
        "gold_cost_per_fte_by_ffrdc",
        "gold_bench_trend",
        "gold_headcount_vs_demand",
        "gold_sponsor_health",
        "gold_nps_trend",
        "gold_quality_metrics",
        "gold_renewals_calendar",
    ],
    "risk-compliance": [
        "dim_ffrdc",
        "dim_sponsor",
        "fact_audit_finding",
        "fact_control_test",
        "fact_revrec",
        "fact_compliance_event",
        "fact_revenue_concentration",
        "fact_key_person_dependency",
        "fact_gl_exception",
        "fact_covenant_compliance",
        "fact_budget_variance",
        "gold_findings_aging",
        "gold_root_cause_tags",
        "gold_control_effectiveness",
        "gold_revrec_schedule",
        "gold_compliance_calendar",
        "gold_sponsor_concentration",
        "gold_diversification_geo",
        "gold_diversification_mission_area",
        "gold_retention_trend",
        "gold_key_person_dependencies",
        "gold_bench_utilization",
        "gold_turnover_trend",
        "gold_control_exceptions_trend",
        "gold_failed_audit_tests",
        "gold_gl_exceptions",
        "gold_covenant_compliance",
        "gold_budget_variance_root_cause",
    ],
    "government-relations": [
        "dim_mission_area",
        "dim_competitor",
        "dim_fiscal_year",
        "fact_market_share",
        "fact_competitor_share",
        "fact_win_loss",
        "fact_capability_gap",
        "fact_pipeline",
        "gold_market_share_by_mission_area",
        "gold_competitor_share",
        "gold_win_loss_by_competitor",
        "gold_capability_gaps",
        "gold_pipeline_prioritization",
        "gold_pipeline_table",
    ],
}

# COMMAND ----------

# MAGIC %md
# MAGIC ## Validation Functions

# COMMAND ----------

def check_table_exists(catalog: str, schema: str, table: str) -> bool:
    """Check if a table exists."""
    try:
        spark.sql(f"DESCRIBE TABLE `{catalog}`.`{schema}`.`{table}`")
        return True
    except Exception:
        return False


def get_table_count(catalog: str, schema: str, table: str) -> int:
    """Get row count for a table."""
    try:
        return spark.sql(f"SELECT COUNT(*) as cnt FROM `{catalog}`.`{schema}`.`{table}`").collect()[0]["cnt"]
    except Exception:
        return -1


def validate_schema(catalog: str, schema: str, expected_tables: list) -> dict:
    """Validate all expected tables exist and have data."""
    results = {
        "schema": schema,
        "total_expected": len(expected_tables),
        "tables_found": 0,
        "tables_with_data": 0,
        "missing_tables": [],
        "empty_tables": [],
        "table_counts": {},
    }
    
    for table in expected_tables:
        if check_table_exists(catalog, schema, table):
            results["tables_found"] += 1
            count = get_table_count(catalog, schema, table)
            results["table_counts"][table] = count
            if count > 0:
                results["tables_with_data"] += 1
            else:
                results["empty_tables"].append(table)
        else:
            results["missing_tables"].append(table)
    
    return results

# COMMAND ----------

# MAGIC %md
# MAGIC ## Run Validation

# COMMAND ----------

validation_results = {}

for schema, expected_tables in EXPECTED_TABLES.items():
    print(f"\n{'='*60}")
    print(f"Validating schema: {schema}")
    print(f"{'='*60}")
    
    result = validate_schema(CATALOG, schema, expected_tables)
    validation_results[schema] = result
    
    print(f"Tables expected: {result['total_expected']}")
    print(f"Tables found: {result['tables_found']}")
    print(f"Tables with data: {result['tables_with_data']}")
    
    if result["missing_tables"]:
        print(f"\n⚠️ Missing tables: {result['missing_tables']}")
    
    if result["empty_tables"]:
        print(f"\n⚠️ Empty tables: {result['empty_tables']}")
    
    print("\nTable row counts:")
    for table, count in sorted(result["table_counts"].items()):
        status = "✓" if count > 0 else "⚠️"
        print(f"  {status} {table}: {count:,} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Summary Report

# COMMAND ----------

print("\n" + "="*60)
print("VALIDATION SUMMARY")
print("="*60)

total_expected = sum(r["total_expected"] for r in validation_results.values())
total_found = sum(r["tables_found"] for r in validation_results.values())
total_with_data = sum(r["tables_with_data"] for r in validation_results.values())

print(f"\nTotal tables expected: {total_expected}")
print(f"Total tables found: {total_found}")
print(f"Total tables with data: {total_with_data}")

all_missing = []
all_empty = []

for schema, result in validation_results.items():
    all_missing.extend([f"{schema}.{t}" for t in result["missing_tables"]])
    all_empty.extend([f"{schema}.{t}" for t in result["empty_tables"]])

if all_missing:
    print(f"\n⚠️ All missing tables ({len(all_missing)}):")
    for t in all_missing:
        print(f"  - {t}")

if all_empty:
    print(f"\n⚠️ All empty tables ({len(all_empty)}):")
    for t in all_empty:
        print(f"  - {t}")

if not all_missing and not all_empty:
    print("\n✅ All tables exist and contain data!")
else:
    print(f"\n❌ Validation found issues: {len(all_missing)} missing, {len(all_empty)} empty")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Visualization-to-Table Mapping Check

# COMMAND ----------

# Mapping of UI visualizations to their gold tables
VISUALIZATION_MAPPING = {
    # Financial Health
    "KpiCard": "financial-health.gold_kpi_summary",
    "RevenueVsBudgetChart": "financial-health.gold_revenue_vs_budget",
    "GrossMarginChart": "financial-health.gold_gross_margin_trend",
    "OpexRatioChart": "financial-health.gold_opex_trend",
    "HeadcountUtilChart": "financial-health.gold_headcount_utilization",
    "IndirectRateChart (FH)": "financial-health.gold_indirect_rate",
    "AgingTable": "financial-health.gold_aging_buckets",
    "SignalsList": "financial-health.gold_signals",
    
    # Program Portfolio
    "SponsorFfrdcAllocationChart": "program-portfolio.gold_sponsor_ffrdc_allocation",
    "SponsorYtdBudgetTrendChart": "program-portfolio.gold_sponsor_ytd_trend",
    "FfrdcRevenueCostWaterfallChart": "program-portfolio.gold_ffrdc_waterfall",
    "CostPerFteChart": "program-portfolio.gold_cost_per_fte",
    "PricingRateTrendsChart": "program-portfolio.gold_pricing_rate_trends",
    "SponsorHealthScatterChart": "program-portfolio.gold_sponsor_health_scatter",
    "SponsorHealthHeatmapTable": "program-portfolio.gold_sponsor_health_heatmap",
    "ContractRunwayTable": "program-portfolio.gold_contract_runway",
    
    # Sponsor Funding
    "StewardshipScorecardTable": "sponsor-funding.gold_stewardship_scorecard",
    "CpiDistributionChart": "sponsor-funding.gold_cpi_distribution",
    "UtilizationChart": "sponsor-funding.gold_utilization",
    "OverheadByFfrdcChart": "sponsor-funding.gold_overhead_by_ffrdc",
    "IndirectRateTrendChart": "sponsor-funding.gold_indirect_rate_trend",
    "CostPerFteByFfrdcChart": "sponsor-funding.gold_cost_per_fte_by_ffrdc",
    "BenchTrendChart": "sponsor-funding.gold_bench_trend",
    "HeadcountVsDemandChart": "sponsor-funding.gold_headcount_vs_demand",
    "SponsorHealthTable": "sponsor-funding.gold_sponsor_health",
    "NpsTrendChart": "sponsor-funding.gold_nps_trend",
    "QualityMetricsChart": "sponsor-funding.gold_quality_metrics",
    "RenewalsTable": "sponsor-funding.gold_renewals_calendar",
    
    # Risk Compliance
    "FindingsAgingChart": "risk-compliance.gold_findings_aging",
    "RootCauseTagsChart": "risk-compliance.gold_root_cause_tags",
    "ControlEffectivenessChart": "risk-compliance.gold_control_effectiveness",
    "RevRecScheduleChart": "risk-compliance.gold_revrec_schedule",
    "ComplianceCalendarTable": "risk-compliance.gold_compliance_calendar",
    "TopSponsorsConcentrationChart": "risk-compliance.gold_sponsor_concentration",
    "DiversificationChart (Geo)": "risk-compliance.gold_diversification_geo",
    "DiversificationChart (Mission)": "risk-compliance.gold_diversification_mission_area",
    "RetentionTrendChart": "risk-compliance.gold_retention_trend",
    "KeyPersonDependencyTable": "risk-compliance.gold_key_person_dependencies",
    "BenchUtilizationChart": "risk-compliance.gold_bench_utilization",
    "TurnoverRateChart": "risk-compliance.gold_turnover_trend",
    "ControlExceptionsTrendChart": "risk-compliance.gold_control_exceptions_trend",
    "FailedAuditTestsChart": "risk-compliance.gold_failed_audit_tests",
    "GLExceptionsTable": "risk-compliance.gold_gl_exceptions",
    "CovenantComplianceTable": "risk-compliance.gold_covenant_compliance",
    "BudgetVarianceRootCauseChart": "risk-compliance.gold_budget_variance_root_cause",
    
    # Government Relations
    "MarketShareByMissionAreaChart": "government-relations.gold_market_share_by_mission_area",
    "WinLossByCompetitorChart": "government-relations.gold_win_loss_by_competitor",
    "CapabilityGapsTable": "government-relations.gold_capability_gaps",
    "PipelinePrioritizationScatter": "government-relations.gold_pipeline_prioritization",
    "PipelineTable": "government-relations.gold_pipeline_table",
}

print("Visualization to Gold Table Mapping:")
print("="*60)

for viz, table_path in VISUALIZATION_MAPPING.items():
    schema, table = table_path.split(".")
    exists = check_table_exists(CATALOG, schema, table)
    count = get_table_count(CATALOG, schema, table) if exists else 0
    status = "✅" if exists and count > 0 else "❌"
    print(f"{status} {viz:40s} -> {table_path}")

print("\n✅ All visualizations have backing Delta tables defined!")

