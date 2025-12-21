# Databricks notebook source
# MAGIC %md
# MAGIC # Seed Program Portfolio Delta Tables
# MAGIC 
# MAGIC This notebook populates the `program-portfolio` schema with visualization data.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`program-portfolio`

# COMMAND ----------

from pyspark.sql.types import *
from datetime import date

CATALOG = "treasury_corporate_financial_catalog"
SCHEMA = "program-portfolio"
as_of_date = date(2024, 12, 15)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Sponsor-FFRDC Allocations

# COMMAND ----------

allocations_data = [
    # DoD allocations
    (as_of_date, "dod", "DoD", "cems", "CEM", 145000000.0),
    (as_of_date, "dod", "DoD", "cve", "CVE", 25000000.0),
    (as_of_date, "dod", "DoD", "hssedi", "HSSEDI", 85000000.0),
    (as_of_date, "dod", "DoD", "jsac", "JEMC", 15000000.0),
    (as_of_date, "dod", "DoD", "nsc", "NSEC", 985000000.0),
    (as_of_date, "dod", "DoD", "cms", "CAMH", 30000000.0),
    # DHS allocations
    (as_of_date, "dhs", "DHS", "cems", "CEM", 65000000.0),
    (as_of_date, "dhs", "DHS", "cve", "CVE", 12000000.0),
    (as_of_date, "dhs", "DHS", "hssedi", "HSSEDI", 340000000.0),
    (as_of_date, "dhs", "DHS", "jsac", "JEMC", 8000000.0),
    (as_of_date, "dhs", "DHS", "nsc", "NSEC", 15000000.0),
    (as_of_date, "dhs", "DHS", "cms", "CAMH", 5000000.0),
    # HHS allocations
    (as_of_date, "hhs", "HHS", "cems", "CEM", 45000000.0),
    (as_of_date, "hhs", "HHS", "cve", "CVE", 8000000.0),
    (as_of_date, "hhs", "HHS", "hssedi", "HSSEDI", 12000000.0),
    (as_of_date, "hhs", "HHS", "jsac", "JEMC", 5000000.0),
    (as_of_date, "hhs", "HHS", "nsc", "NSEC", 10000000.0),
    (as_of_date, "hhs", "HHS", "cms", "CAMH", 240000000.0),
    # DOE allocations
    (as_of_date, "doe", "DOE", "cems", "CEM", 85000000.0),
    (as_of_date, "doe", "DOE", "cve", "CVE", 5000000.0),
    (as_of_date, "doe", "DOE", "hssedi", "HSSEDI", 8000000.0),
    (as_of_date, "doe", "DOE", "jsac", "JEMC", 2000000.0),
    (as_of_date, "doe", "DOE", "nsc", "NSEC", 92000000.0),
    (as_of_date, "doe", "DOE", "cms", "CAMH", 3000000.0),
    # VA allocations
    (as_of_date, "va", "VA", "cems", "CEM", 35000000.0),
    (as_of_date, "va", "VA", "cve", "CVE", 135000000.0),
    (as_of_date, "va", "VA", "hssedi", "HSSEDI", 5000000.0),
    (as_of_date, "va", "VA", "jsac", "JEMC", 3000000.0),
    (as_of_date, "va", "VA", "nsc", "NSEC", 8000000.0),
    (as_of_date, "va", "VA", "cms", "CAMH", 24000000.0),
    # DOJ allocations
    (as_of_date, "doj", "DOJ", "cems", "CEM", 28000000.0),
    (as_of_date, "doj", "DOJ", "cve", "CVE", 4000000.0),
    (as_of_date, "doj", "DOJ", "hssedi", "HSSEDI", 15000000.0),
    (as_of_date, "doj", "DOJ", "jsac", "JEMC", 88000000.0),
    (as_of_date, "doj", "DOJ", "nsc", "NSEC", 5000000.0),
    (as_of_date, "doj", "DOJ", "cms", "CAMH", 2000000.0),
    # FAA allocations
    (as_of_date, "faa", "FAA", "cems", "CEM", 95000000.0),
    (as_of_date, "faa", "FAA", "cve", "CVE", 3000000.0),
    (as_of_date, "faa", "FAA", "hssedi", "HSSEDI", 8000000.0),
    (as_of_date, "faa", "FAA", "jsac", "JEMC", 2000000.0),
    (as_of_date, "faa", "FAA", "nsc", "NSEC", 55000000.0),
    (as_of_date, "faa", "FAA", "cms", "CAMH", 2000000.0),
    # IRS allocations
    (as_of_date, "irs", "IRS", "cems", "CEM", 72000000.0),
    (as_of_date, "irs", "IRS", "cve", "CVE", 2000000.0),
    (as_of_date, "irs", "IRS", "hssedi", "HSSEDI", 3000000.0),
    (as_of_date, "irs", "IRS", "jsac", "JEMC", 5000000.0),
    (as_of_date, "irs", "IRS", "nsc", "NSEC", 2000000.0),
    (as_of_date, "irs", "IRS", "cms", "CAMH", 1000000.0),
]

allocations_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("funding_amount", DoubleType(), False),
])

df = spark.createDataFrame(allocations_data, allocations_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_sponsor_ffrdc_allocations")
print(f"✓ Created gold_sponsor_ffrdc_allocations with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Sponsor Funding Summary

# COMMAND ----------

funding_summary_data = [
    (as_of_date, "dod", "DoD", 1285000000.0, 1180000000.0, 1285000000.0, 5.3),
    (as_of_date, "dhs", "DHS", 445000000.0, 398000000.0, 445000000.0, 7.2),
    (as_of_date, "hhs", "HHS", 320000000.0, 295000000.0, 320000000.0, 4.9),
    (as_of_date, "doe", "DOE", 195000000.0, 172000000.0, 195000000.0, -2.5),
    (as_of_date, "va", "VA", 210000000.0, 188000000.0, 210000000.0, 10.5),
    (as_of_date, "doj", "DOJ", 142000000.0, 128000000.0, 142000000.0, 5.2),
    (as_of_date, "faa", "FAA", 165000000.0, 148000000.0, 165000000.0, 6.5),
    (as_of_date, "irs", "IRS", 85000000.0, 76000000.0, 85000000.0, 13.3),
]

funding_summary_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("total_funding", DoubleType(), False),
    StructField("ytd_funding", DoubleType(), False),
    StructField("annual_budget", DoubleType(), False),
    StructField("growth_pct", DoubleType(), False),
])

df = spark.createDataFrame(funding_summary_data, funding_summary_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_sponsor_funding_summary")
print(f"✓ Created gold_sponsor_funding_summary with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## FFRDC Economics

# COMMAND ----------

economics_data = [
    (as_of_date, "cems", "CEM", 570000000.0, 408000000.0, 28.4, 166500.0, 2450, 104, 108, 112),
    (as_of_date, "cve", "CVE", 194000000.0, 143000000.0, 26.3, 174400.0, 820, 102, 108, 110),
    (as_of_date, "hssedi", "HSSEDI", 476000000.0, 338000000.0, 29.0, 170700.0, 1980, 106, 108, 109),
    (as_of_date, "jsac", "JEMC", 128000000.0, 95000000.0, 25.8, 163800.0, 580, 101, 108, 106),
    (as_of_date, "nsc", "NSEC", 1172000000.0, 828000000.0, 29.4, 142300.0, 5820, 107, 108, 111),
    (as_of_date, "cms", "CAMH", 307000000.0, 224000000.0, 27.0, 165900.0, 1350, 103, 108, 110),
]

economics_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("revenue", DoubleType(), False),
    StructField("cost_of_delivery", DoubleType(), False),
    StructField("margin_pct", DoubleType(), False),
    StructField("cost_per_fte", DoubleType(), False),
    StructField("headcount", IntegerType(), False),
    StructField("negotiated_rate_index", IntegerType(), False),
    StructField("inflation_index", IntegerType(), False),
    StructField("labor_cost_index", IntegerType(), False),
])

df = spark.createDataFrame(economics_data, economics_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_ffrdc_economics")
print(f"✓ Created gold_ffrdc_economics with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Sponsor Health (Contract Runway)

# COMMAND ----------

sponsor_health_data = [
    (as_of_date, "dod", "DoD", 1285000000.0, 1.02, 82.5, 24, date(2026, 9, 30), 3855000000.0, "healthy"),
    (as_of_date, "dhs", "DHS", 445000000.0, 1.05, 78.2, 18, date(2026, 3, 31), 890000000.0, "healthy"),
    (as_of_date, "hhs", "HHS", 320000000.0, 0.97, 85.1, 12, date(2025, 9, 30), 640000000.0, "attention"),
    (as_of_date, "doe", "DOE", 195000000.0, 0.92, 71.3, 8, date(2025, 6, 30), 390000000.0, "critical"),
    (as_of_date, "va", "VA", 210000000.0, 1.08, 79.8, 30, date(2027, 3, 31), 630000000.0, "healthy"),
    (as_of_date, "doj", "DOJ", 142000000.0, 1.01, 76.5, 14, date(2025, 12, 31), 284000000.0, "attention"),
    (as_of_date, "faa", "FAA", 165000000.0, 1.04, 81.2, 22, date(2026, 6, 30), 495000000.0, "healthy"),
    (as_of_date, "irs", "IRS", 85000000.0, 0.95, 68.9, 6, date(2025, 4, 15), 170000000.0, "critical"),
]

sponsor_health_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("funding_volume", DoubleType(), False),
    StructField("cpi", DoubleType(), False),
    StructField("utilization_pct", DoubleType(), False),
    StructField("runway_months", IntegerType(), False),
    StructField("next_renewal_date", DateType(), False),
    StructField("contract_value", DoubleType(), False),
    StructField("status", StringType(), False),
])

df = spark.createDataFrame(sponsor_health_data, sponsor_health_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_sponsor_health")
print(f"✓ Created gold_sponsor_health with {df.count()} rows")

# COMMAND ----------

print("=" * 60)
print("Program Portfolio Schema - Seed Complete")
print("=" * 60)

