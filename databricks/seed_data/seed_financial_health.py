# Databricks notebook source
# MAGIC %md
# MAGIC # Seed Financial Health Delta Tables
# MAGIC 
# MAGIC This notebook populates the `financial-health` schema with visualization data.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`financial-health`
# MAGIC 
# MAGIC ## Tables Created
# MAGIC - `gold_ffrdc_dim` - FFRDC dimension table
# MAGIC - `gold_kpi_summary` - KPI cards data
# MAGIC - `gold_revenue_vs_budget` - Revenue vs budget by FFRDC
# MAGIC - `gold_gross_margin_trend` - Margin trends over time
# MAGIC - `gold_margin_by_ffrdc` - Current margin by FFRDC with trend
# MAGIC - `gold_cash_position` - Cash and working capital metrics
# MAGIC - `gold_aging_buckets` - AR/AP aging breakdown
# MAGIC - `gold_headcount_utilization` - Headcount and utilization by FFRDC
# MAGIC - `gold_opex_trend` - Operating expense actual vs budget
# MAGIC - `gold_indirect_rates` - Indirect cost rates by FFRDC
# MAGIC - `gold_signals` - Governance alerts and warnings

# COMMAND ----------

from pyspark.sql.types import *
from datetime import date

# Configuration
CATALOG = "treasury_corporate_financial_catalog"
SCHEMA = "financial-health"

# COMMAND ----------

# MAGIC %md
# MAGIC ## FFRDC Dimension

# COMMAND ----------

ffrdc_data = [
    ("cems", "Center for Enterprise Modernization (CEM)", "CEM"),
    ("cve", "Center for Veterans Enterprise (CVE)", "CVE"),
    ("hssedi", "Homeland Security Systems Engineering & Development Institute", "HSSEDI"),
    ("jsac", "Judiciary Engineering and Modernization Center (JEMC)", "JEMC"),
    ("nsc", "National Security Engineering Center (NSEC)", "NSEC"),
    ("cms", "CMS Alliance to Modernize Healthcare (CAMH)", "CAMH"),
]

ffrdc_schema = StructType([
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("short_name", StringType(), False),
])

df_ffrdc = spark.createDataFrame(ffrdc_data, ffrdc_schema)
df_ffrdc.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_ffrdc_dim")
print(f"✓ Created gold_ffrdc_dim with {df_ffrdc.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## KPI Summary

# COMMAND ----------

as_of_date = date(2024, 12, 15)

kpi_data = [
    (as_of_date, "YTD", "ytd-revenue", "YTD Revenue vs Budget", 2847000000.0, "currency", 2.3, "vs budget", "green", "2100,2250,2400,2520,2650,2780,2847"),
    (as_of_date, "YTD", "gross-margin", "Gross Margin %", 28.4, "percent", -0.8, "vs prior period", "yellow", "29.2,29.0,28.8,28.6,28.5,28.4,28.4"),
    (as_of_date, "YTD", "cash-position", "Cash & Working Capital", 485000000.0, "currency", 5.2, "vs prior month", "green", "420,435,450,462,475,480,485"),
    (as_of_date, "YTD", "headcount-util", "Utilization Rate", 78.5, "percent", -1.5, "vs target 80%", "yellow", "80.2,79.8,79.2,78.9,78.6,78.5,78.5"),
    (as_of_date, "YTD", "opex-ratio", "Operating Expense Ratio", 18.2, "percent", 0.4, "vs forecast", "green", "17.8,17.9,18.0,18.1,18.1,18.2,18.2"),
    (as_of_date, "YTD", "indirect-rate", "Indirect Cost Rate", 42.8, "percent", 0.3, "vs sponsor cap 43%", "yellow", "41.5,42.0,42.2,42.4,42.6,42.7,42.8"),
]

kpi_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("time_window", StringType(), False),
    StructField("kpi_id", StringType(), False),
    StructField("kpi_label", StringType(), False),
    StructField("value", DoubleType(), False),
    StructField("unit", StringType(), False),
    StructField("delta", DoubleType(), False),
    StructField("delta_label", StringType(), False),
    StructField("status", StringType(), False),
    StructField("sparkline_data", StringType(), True),
])

df_kpi = spark.createDataFrame(kpi_data, kpi_schema)
df_kpi.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_kpi_summary")
print(f"✓ Created gold_kpi_summary with {df_kpi.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Revenue vs Budget

# COMMAND ----------

revenue_budget_data = [
    (as_of_date, "cems", "CEM", 520000000.0, 505000000.0, 15000000.0, 3.0),
    (as_of_date, "cve", "CVE", 168000000.0, 190000000.0, -22000000.0, -11.6),
    (as_of_date, "hssedi", "HSSEDI", 445000000.0, 430000000.0, 15000000.0, 3.5),
    (as_of_date, "jsac", "JEMC", 125000000.0, 120000000.0, 5000000.0, 4.2),
    (as_of_date, "nsc", "NSEC", 1285000000.0, 1300000000.0, -15000000.0, -1.2),
    (as_of_date, "cms", "CAMH", 270000000.0, 280000000.0, -10000000.0, -3.6),
]

revenue_budget_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("actual_revenue", DoubleType(), False),
    StructField("budget_revenue", DoubleType(), False),
    StructField("variance", DoubleType(), False),
    StructField("variance_pct", DoubleType(), False),
])

df_rev = spark.createDataFrame(revenue_budget_data, revenue_budget_schema)
df_rev.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_revenue_vs_budget")
print(f"✓ Created gold_revenue_vs_budget with {df_rev.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gross Margin Trend

# COMMAND ----------

margin_trend_data = [
    (as_of_date, "Jul", 32.5, 18.2, 28.0, 12.5, 38.5, 22.0),
    (as_of_date, "Aug", 31.0, 15.8, 30.5, 14.2, 40.2, 20.5),
    (as_of_date, "Sep", 28.5, 19.5, 26.0, 10.8, 35.8, 24.2),
    (as_of_date, "Oct", 30.2, 12.5, 32.8, 16.5, 42.5, 18.5),
    (as_of_date, "Nov", 33.8, 20.2, 24.5, 8.2, 36.0, 26.8),
    (as_of_date, "Dec", 29.5, 16.8, 29.2, 14.8, 39.5, 21.5),
]

margin_trend_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("month", StringType(), False),
    StructField("cems", DoubleType(), False),
    StructField("cve", DoubleType(), False),
    StructField("hssedi", DoubleType(), False),
    StructField("jsac", DoubleType(), False),
    StructField("nsc", DoubleType(), False),
    StructField("cms", DoubleType(), False),
])

df_margin_trend = spark.createDataFrame(margin_trend_data, margin_trend_schema)
df_margin_trend.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_gross_margin_trend")
print(f"✓ Created gold_gross_margin_trend with {df_margin_trend.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Margin by FFRDC (with sparkline trend)

# COMMAND ----------

margin_by_ffrdc_data = [
    (as_of_date, "cems", "CEM", 28.5, 29.5, -1.0, "29.5,29.3,29.1,28.9,28.7,28.5"),
    (as_of_date, "cve", "CVE", 26.4, 27.2, -0.8, "27.2,27.0,26.8,26.6,26.5,26.4"),
    (as_of_date, "hssedi", "HSSEDI", 28.0, 28.8, -0.8, "28.8,28.6,28.4,28.2,28.1,28.0"),
    (as_of_date, "jsac", "JEMC", 25.8, 26.5, -0.7, "26.5,26.3,26.2,26.0,25.9,25.8"),
    (as_of_date, "nsc", "NSEC", 29.4, 30.2, -0.8, "30.2,30.0,29.8,29.6,29.5,29.4"),
    (as_of_date, "cms", "CAMH", 27.1, 27.8, -0.7, "27.8,27.6,27.5,27.3,27.2,27.1"),
]

margin_by_ffrdc_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("current_margin", DoubleType(), False),
    StructField("prior_margin", DoubleType(), False),
    StructField("change_pct", DoubleType(), False),
    StructField("trend_data", StringType(), True),
])

df_margin_ffrdc = spark.createDataFrame(margin_by_ffrdc_data, margin_by_ffrdc_schema)
df_margin_ffrdc.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_margin_by_ffrdc")
print(f"✓ Created gold_margin_by_ffrdc with {df_margin_ffrdc.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Cash Position & Aging

# COMMAND ----------

cash_position_data = [
    (as_of_date, 485000000.0, 312000000.0, 52, 38),
]

cash_position_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("cash_balance", DoubleType(), False),
    StructField("working_capital", DoubleType(), False),
    StructField("dso", IntegerType(), False),
    StructField("dpo", IntegerType(), False),
])

df_cash = spark.createDataFrame(cash_position_data, cash_position_schema)
df_cash.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_cash_position")
print(f"✓ Created gold_cash_position with {df_cash.count()} rows")

# Aging buckets
aging_data = [
    (as_of_date, "0-30 days", 145000000.0, 82000000.0),
    (as_of_date, "31-60 days", 68000000.0, 45000000.0),
    (as_of_date, "61-90 days", 32000000.0, 18000000.0),
    (as_of_date, "90+ days", 15000000.0, 8000000.0),
]

aging_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("bucket_label", StringType(), False),
    StructField("ar_amount", DoubleType(), False),
    StructField("ap_amount", DoubleType(), False),
])

df_aging = spark.createDataFrame(aging_data, aging_schema)
df_aging.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_aging_buckets")
print(f"✓ Created gold_aging_buckets with {df_aging.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Headcount & Utilization

# COMMAND ----------

headcount_data = [
    (as_of_date, "cems", "CEM", 2450, 82.5, 4042500.0, 4900000.0),
    (as_of_date, "cve", "CVE", 820, 68.2, 1118480.0, 1640000.0),
    (as_of_date, "hssedi", "HSSEDI", 1980, 81.5, 3227400.0, 3960000.0),
    (as_of_date, "jsac", "JEMC", 580, 72.1, 836360.0, 1160000.0),
    (as_of_date, "nsc", "NSEC", 5820, 84.8, 9870720.0, 11640000.0),
    (as_of_date, "cms", "CAMH", 1350, 76.2, 2057400.0, 2700000.0),
]

headcount_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("headcount", IntegerType(), False),
    StructField("utilization_pct", DoubleType(), False),
    StructField("billable_hours", DoubleType(), False),
    StructField("total_hours", DoubleType(), False),
])

df_headcount = spark.createDataFrame(headcount_data, headcount_schema)
df_headcount.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_headcount_utilization")
print(f"✓ Created gold_headcount_utilization with {df_headcount.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## OpEx Trend

# COMMAND ----------

opex_data = [
    (as_of_date, "Jul", 50.5, 52.0),
    (as_of_date, "Aug", 53.2, 51.5),
    (as_of_date, "Sep", 51.0, 52.0),
    (as_of_date, "Oct", 54.5, 52.5),
    (as_of_date, "Nov", 51.2, 52.0),
    (as_of_date, "Dec", 55.8, 53.0),
]

opex_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("month", StringType(), False),
    StructField("actual", DoubleType(), False),
    StructField("budget", DoubleType(), False),
])

df_opex = spark.createDataFrame(opex_data, opex_schema)
df_opex.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_opex_trend")
print(f"✓ Created gold_opex_trend with {df_opex.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Indirect Rates

# COMMAND ----------

indirect_data = [
    (as_of_date, "cems", "CEM", 41.5, 43.0, -1.5),
    (as_of_date, "cve", "CVE", 44.2, 43.0, 1.2),
    (as_of_date, "hssedi", "HSSEDI", 42.8, 44.0, -1.2),
    (as_of_date, "jsac", "JEMC", 43.5, 44.5, -1.0),
    (as_of_date, "nsc", "NSEC", 42.2, 43.5, -1.3),
    (as_of_date, "cms", "CAMH", 43.8, 43.5, 0.3),
]

indirect_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("actual_rate", DoubleType(), False),
    StructField("cap_rate", DoubleType(), False),
    StructField("variance", DoubleType(), False),
])

df_indirect = spark.createDataFrame(indirect_data, indirect_schema)
df_indirect.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_indirect_rates")
print(f"✓ Created gold_indirect_rates with {df_indirect.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Signals

# COMMAND ----------

signals_data = [
    (as_of_date, "signal-1", "critical", "CVE indirect cost rate exceeds sponsor cap by 1.2%", "indirect-rate", "cve", 44.2, 43.0),
    (as_of_date, "signal-2", "warning", "CAMH indirect cost rate approaching cap (0.3% margin)", "indirect-rate", "cms", 43.8, 43.5),
    (as_of_date, "signal-3", "warning", "JEMC utilization below 75% target", "headcount-util", "jsac", 74.8, 75.0),
    (as_of_date, "signal-4", "warning", "DSO trending above 50-day target", "cash-position", None, 52.0, 50.0),
    (as_of_date, "signal-5", "warning", "CVE revenue 2.6% below budget YTD", "ytd-revenue", "cve", -2.6, -2.0),
]

signals_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("signal_id", StringType(), False),
    StructField("signal_type", StringType(), False),
    StructField("message", StringType(), False),
    StructField("kpi_id", StringType(), False),
    StructField("ffrdc_id", StringType(), True),
    StructField("value", DoubleType(), True),
    StructField("threshold", DoubleType(), True),
])

df_signals = spark.createDataFrame(signals_data, signals_schema)
df_signals.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_signals")
print(f"✓ Created gold_signals with {df_signals.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Summary

# COMMAND ----------

print("=" * 60)
print("Financial Health Schema - Seed Complete")
print("=" * 60)
print(f"Catalog: {CATALOG}")
print(f"Schema: {SCHEMA}")
print("")
print("Tables created:")
tables = spark.sql(f"SHOW TABLES IN `{CATALOG}`.`{SCHEMA}`").collect()
for t in tables:
    count = spark.table(f"`{CATALOG}`.`{SCHEMA}`.{t.tableName}").count()
    print(f"  - {t.tableName}: {count} rows")

