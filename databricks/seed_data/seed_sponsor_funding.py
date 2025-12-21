# Databricks notebook source
# MAGIC %md
# MAGIC # Seed Sponsor Funding Delta Tables
# MAGIC 
# MAGIC This notebook populates the `sponsor-funding` schema with visualization data.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`sponsor-funding`

# COMMAND ----------

from pyspark.sql.types import *
from datetime import date

CATALOG = "treasury_corporate_financial_catalog"
SCHEMA = "sponsor-funding"
as_of_date = date(2024, 12, 15)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Sponsors Dimension

# COMMAND ----------

sponsors_data = [
    ("dod", "Department of Defense", "DoD", "Defense"),
    ("dhs", "Department of Homeland Security", "DHS", "Homeland Security"),
    ("hhs", "Department of Health & Human Services", "HHS", "Health & Human Services"),
    ("doe", "Department of Energy", "DOE", "Energy"),
    ("va", "Department of Veterans Affairs", "VA", "Veterans Affairs"),
    ("doj", "Department of Justice", "DOJ", "Justice"),
    ("faa", "Federal Aviation Administration", "FAA", "Transportation"),
    ("irs", "Internal Revenue Service", "IRS", "Treasury"),
]

sponsors_schema = StructType([
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_name", StringType(), False),
    StructField("abbreviation", StringType(), False),
    StructField("agency_group", StringType(), False),
])

df = spark.createDataFrame(sponsors_data, sponsors_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_sponsor_dim")
print(f"✓ Created gold_sponsor_dim with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Stewardship Scorecard

# COMMAND ----------

stewardship_data = [
    (as_of_date, "dod", "DoD", 1.04, 1235000000.0, 1285000000.0, 18.2, 42.5, 45.0, 84.2, "excellent"),
    (as_of_date, "dhs", "DHS", 1.02, 436000000.0, 445000000.0, 19.5, 43.8, 46.0, 81.5, "good"),
    (as_of_date, "hhs", "HHS", 0.97, 330000000.0, 320000000.0, 21.2, 44.2, 44.0, 78.3, "attention"),
    (as_of_date, "doe", "DOE", 0.91, 214000000.0, 195000000.0, 23.8, 47.5, 45.0, 72.1, "critical"),
    (as_of_date, "va", "VA", 1.06, 198000000.0, 210000000.0, 17.8, 41.2, 44.0, 85.8, "excellent"),
    (as_of_date, "doj", "DOJ", 1.01, 140500000.0, 142000000.0, 19.8, 43.5, 45.0, 80.2, "good"),
    (as_of_date, "faa", "FAA", 1.03, 160200000.0, 165000000.0, 18.9, 42.8, 45.0, 82.5, "good"),
    (as_of_date, "irs", "IRS", 0.94, 90400000.0, 85000000.0, 22.5, 46.2, 45.0, 74.8, "critical"),
]

stewardship_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("cpi", DoubleType(), False),
    StructField("actual_spend", DoubleType(), False),
    StructField("estimated_spend", DoubleType(), False),
    StructField("overhead_ratio", DoubleType(), False),
    StructField("indirect_rate_current", DoubleType(), False),
    StructField("indirect_rate_cap", DoubleType(), False),
    StructField("billable_utilization_pct", DoubleType(), False),
    StructField("status", StringType(), False),
])

df = spark.createDataFrame(stewardship_data, stewardship_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_stewardship_scorecard")
print(f"✓ Created gold_stewardship_scorecard with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## CPI Distribution

# COMMAND ----------

cpi_data = [
    (as_of_date, "dod", "DoD", 1.04, "excellent"),
    (as_of_date, "dhs", "DHS", 1.02, "good"),
    (as_of_date, "hhs", "HHS", 0.97, "attention"),
    (as_of_date, "doe", "DOE", 0.91, "critical"),
    (as_of_date, "va", "VA", 1.06, "excellent"),
    (as_of_date, "doj", "DOJ", 1.01, "good"),
    (as_of_date, "faa", "FAA", 1.03, "good"),
    (as_of_date, "irs", "IRS", 0.94, "critical"),
]

cpi_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("cpi", DoubleType(), False),
    StructField("status", StringType(), False),
])

df = spark.createDataFrame(cpi_data, cpi_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_cpi_distribution")
print(f"✓ Created gold_cpi_distribution with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Efficiency by FFRDC

# COMMAND ----------

efficiency_data = [
    (as_of_date, "nsc", "NSEC", 142300.0, 155000.0, 8.2, 5820, 5780),
    (as_of_date, "cems", "CEM", 166500.0, 155000.0, 12.5, 2450, 2200),
    (as_of_date, "hssedi", "HSSEDI", 170700.0, 155000.0, 9.8, 1980, 1970),
    (as_of_date, "cve", "CVE", 174400.0, 155000.0, 6.5, 820, 818),
    (as_of_date, "jsac", "JEMC", 163800.0, 155000.0, 7.2, 580, 575),
    (as_of_date, "cms", "CAMH", 165900.0, 155000.0, 11.2, 1350, 1210),
]

efficiency_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("cost_per_tech_fte", DoubleType(), False),
    StructField("industry_benchmark", DoubleType(), False),
    StructField("bench_pct", DoubleType(), False),
    StructField("current_headcount", IntegerType(), False),
    StructField("current_demand", IntegerType(), False),
])

df = spark.createDataFrame(efficiency_data, efficiency_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_efficiency_by_ffrdc")
print(f"✓ Created gold_efficiency_by_ffrdc with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Sponsor Health

# COMMAND ----------

health_data = [
    (as_of_date, "dod", "DoD", 2.1, 4.2, 94.5, 4.0, 72, 88, "healthy"),
    (as_of_date, "dhs", "DHS", 2.8, 5.5, 91.2, 2.0, 65, 78, "healthy"),
    (as_of_date, "hhs", "HHS", 3.5, 7.2, 87.5, -3.1, 52, 62, "attention"),
    (as_of_date, "doe", "DOE", 4.8, 9.5, 78.2, -9.7, 35, 42, "critical"),
    (as_of_date, "va", "VA", 1.8, 3.8, 96.2, 5.7, 78, 92, "healthy"),
    (as_of_date, "doj", "DOJ", 2.5, 5.0, 90.5, 1.1, 61, 75, "healthy"),
    (as_of_date, "faa", "FAA", 2.3, 4.5, 93.0, 2.9, 68, 82, "healthy"),
    (as_of_date, "irs", "IRS", 4.2, 8.5, 82.0, -6.4, 42, 48, "critical"),
]

health_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("defect_rate", DoubleType(), False),
    StructField("rework_pct", DoubleType(), False),
    StructField("on_time_delivery_pct", DoubleType(), False),
    StructField("budget_variance_pct", DoubleType(), False),
    StructField("nps_score", IntegerType(), False),
    StructField("health_score", IntegerType(), False),
    StructField("status", StringType(), False),
])

df = spark.createDataFrame(health_data, health_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_sponsor_health")
print(f"✓ Created gold_sponsor_health with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Renewals

# COMMAND ----------

renewals_data = [
    (as_of_date, "irs", "IRS", date(2025, 4, 15), 170000000.0, 85000000.0, 42, "critical", 121),
    (as_of_date, "doe", "DOE", date(2025, 6, 30), 390000000.0, 195000000.0, 35, "critical", 197),
    (as_of_date, "hhs", "HHS", date(2025, 9, 30), 640000000.0, 320000000.0, 52, "attention", 289),
    (as_of_date, "doj", "DOJ", date(2025, 12, 31), 284000000.0, 142000000.0, 61, "healthy", 381),
    (as_of_date, "dhs", "DHS", date(2026, 3, 31), 890000000.0, 445000000.0, 65, "healthy", 471),
    (as_of_date, "faa", "FAA", date(2026, 6, 30), 495000000.0, 165000000.0, 68, "healthy", 562),
    (as_of_date, "dod", "DoD", date(2026, 9, 30), 3855000000.0, 1285000000.0, 72, "healthy", 654),
    (as_of_date, "va", "VA", date(2027, 3, 31), 630000000.0, 210000000.0, 78, "healthy", 836),
]

renewals_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("renewal_date", DateType(), False),
    StructField("contract_value", DoubleType(), False),
    StructField("annual_run_rate", DoubleType(), False),
    StructField("nps_score", IntegerType(), False),
    StructField("health_status", StringType(), False),
    StructField("days_until_renewal", IntegerType(), False),
])

df = spark.createDataFrame(renewals_data, renewals_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_renewals")
print(f"✓ Created gold_renewals with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Summary KPIs

# COMMAND ----------

summary_data = [
    (as_of_date, 1.01, 20.2, 79.9, 59.1, 2, 0, 0),
]

summary_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("avg_cpi", DoubleType(), False),
    StructField("avg_overhead_ratio", DoubleType(), False),
    StructField("avg_billable_utilization", DoubleType(), False),
    StructField("avg_nps", DoubleType(), False),
    StructField("sponsors_at_risk", IntegerType(), False),
    StructField("upcoming_renewals_30_days", IntegerType(), False),
    StructField("upcoming_renewals_90_days", IntegerType(), False),
])

df = spark.createDataFrame(summary_data, summary_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_summary_kpis")
print(f"✓ Created gold_summary_kpis with {df.count()} rows")

# COMMAND ----------

print("=" * 60)
print("Sponsor Funding Schema - Seed Complete")
print("=" * 60)

