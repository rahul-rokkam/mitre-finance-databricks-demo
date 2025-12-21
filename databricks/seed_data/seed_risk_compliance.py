# Databricks notebook source
# MAGIC %md
# MAGIC # Seed Risk & Compliance Delta Tables
# MAGIC 
# MAGIC This notebook populates the `risk-compliance` schema with visualization data.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`risk-compliance`

# COMMAND ----------

from pyspark.sql.types import *
from datetime import date

CATALOG = "treasury_corporate_financial_catalog"
SCHEMA = "risk-compliance"
as_of_date = date(2024, 12, 15)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Findings Aging

# COMMAND ----------

findings_aging_data = [
    (as_of_date, "0-30 days", 8, 12),
    (as_of_date, "31-60 days", 6, 18),
    (as_of_date, "61-90 days", 4, 16),
    (as_of_date, ">90 days", 5, 35),
]

findings_aging_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("bucket", StringType(), False),
    StructField("count", IntegerType(), False),
    StructField("risk_weighted", IntegerType(), False),
])

df = spark.createDataFrame(findings_aging_data, findings_aging_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_findings_aging")
print(f"✓ Created gold_findings_aging with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Root Cause Tags

# COMMAND ----------

root_cause_data = [
    (as_of_date, "Process Gap", 7, 30.4),
    (as_of_date, "Training Deficiency", 5, 21.7),
    (as_of_date, "System Limitation", 4, 17.4),
    (as_of_date, "Documentation", 3, 13.0),
    (as_of_date, "Staffing", 2, 8.7),
    (as_of_date, "Other", 2, 8.7),
]

root_cause_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("tag", StringType(), False),
    StructField("count", IntegerType(), False),
    StructField("percentage", DoubleType(), False),
])

df = spark.createDataFrame(root_cause_data, root_cause_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_root_cause_tags")
print(f"✓ Created gold_root_cause_tags with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Control Effectiveness

# COMMAND ----------

control_data = [
    (as_of_date, "Financial Reporting", 18, 2, 0, 90.0),
    (as_of_date, "Revenue Recognition", 12, 3, 1, 75.0),
    (as_of_date, "Procurement", 15, 1, 0, 94.0),
    (as_of_date, "Time & Labor", 10, 2, 1, 77.0),
    (as_of_date, "IT General Controls", 22, 2, 0, 92.0),
    (as_of_date, "Contract Compliance", 14, 1, 0, 93.0),
]

control_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("domain", StringType(), False),
    StructField("effective_count", IntegerType(), False),
    StructField("needs_improvement_count", IntegerType(), False),
    StructField("ineffective_count", IntegerType(), False),
    StructField("effectiveness_rate", DoubleType(), False),
])

df = spark.createDataFrame(control_data, control_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_control_effectiveness")
print(f"✓ Created gold_control_effectiveness with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Revenue Recognition Schedule

# COMMAND ----------

revrec_data = [
    (as_of_date, "Jan", 45.2, 12.5, 8.3, 5.1),
    (as_of_date, "Feb", 47.8, 11.2, 9.1, 3.2),
    (as_of_date, "Mar", 52.1, 14.3, 8.7, 8.5),
    (as_of_date, "Apr", 48.9, 13.1, 9.4, 4.2),
    (as_of_date, "May", 51.3, 12.8, 8.9, 6.7),
    (as_of_date, "Jun", 54.7, 15.2, 10.1, 9.3),
    (as_of_date, "Jul", 49.2, 13.7, 9.6, 5.8),
    (as_of_date, "Aug", 53.4, 14.1, 10.3, 7.1),
    (as_of_date, "Sep", 56.8, 16.2, 11.2, 10.5),
    (as_of_date, "Oct", 52.1, 14.8, 9.8, 6.4),
    (as_of_date, "Nov", 50.6, 13.9, 9.2, 5.9),
    (as_of_date, "Dec", 58.3, 17.1, 12.4, 11.2),
]

revrec_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("month", StringType(), False),
    StructField("cost_reimbursable", DoubleType(), False),
    StructField("fixed_price", DoubleType(), False),
    StructField("time_and_materials", DoubleType(), False),
    StructField("milestone", DoubleType(), False),
])

df = spark.createDataFrame(revrec_data, revrec_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_revrec_schedule")
print(f"✓ Created gold_revrec_schedule with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Compliance Calendar

# COMMAND ----------

calendar_data = [
    (as_of_date, "cc1", "Annual A-133 Audit", "audit", date(2025, 1, 15), "DCAA", "upcoming", 27),
    (as_of_date, "cc2", "DCAA Incurred Cost Submission", "filing", date(2025, 1, 31), "DCAA", "upcoming", 43),
    (as_of_date, "cc3", "SF-SAC Certification", "certification", date(2025, 2, 15), "Federal", "upcoming", 58),
    (as_of_date, "cc4", "Quarterly CAS Review", "review", date(2025, 1, 20), "Internal", "in_progress", 32),
    (as_of_date, "cc5", "DoD Sponsor Certification", "certification", date(2025, 2, 28), "DoD", "upcoming", 71),
    (as_of_date, "cc6", "Internal Controls Assessment", "audit", date(2025, 3, 15), "Internal", "upcoming", 86),
    (as_of_date, "cc7", "GSA Schedule Review", "review", date(2024, 12, 28), "GSA", "overdue", -9),
    (as_of_date, "cc8", "Indirect Rate Proposal", "filing", date(2025, 1, 10), "DCAA", "in_progress", 22),
]

calendar_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("item_id", StringType(), False),
    StructField("title", StringType(), False),
    StructField("type", StringType(), False),
    StructField("due_date", DateType(), False),
    StructField("sponsor", StringType(), False),
    StructField("status", StringType(), False),
    StructField("days_until_due", IntegerType(), False),
])

df = spark.createDataFrame(calendar_data, calendar_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_compliance_calendar")
print(f"✓ Created gold_compliance_calendar with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Top Sponsors (Concentration Risk)

# COMMAND ----------

sponsors_data = [
    (as_of_date, "dod", "Department of Defense", "DoD", 285000000.0, 23.4, 23.4, 5.2),
    (as_of_date, "dhs", "Department of Homeland Security", "DHS", 198000000.0, 16.3, 39.7, -2.1),
    (as_of_date, "hhs", "Health and Human Services", "HHS", 153000000.0, 12.6, 52.3, 8.7),
    (as_of_date, "irs", "Internal Revenue Service", "IRS", 112000000.0, 9.2, 61.5, 3.4),
    (as_of_date, "va", "Veterans Affairs", "VA", 87000000.0, 7.1, 68.6, 12.3),
    (as_of_date, "doj", "Department of Justice", "DOJ", 54000000.0, 4.4, 73.0, -5.8),
    (as_of_date, "treasury", "Department of Treasury", "Treasury", 42000000.0, 3.5, 76.5, 1.2),
    (as_of_date, "ssa", "Social Security Administration", "SSA", 38000000.0, 3.1, 79.6, -1.5),
    (as_of_date, "fema", "Federal Emergency Management Agency", "FEMA", 31000000.0, 2.5, 82.1, 18.2),
    (as_of_date, "gsa", "General Services Administration", "GSA", 28000000.0, 2.3, 84.4, -3.2),
]

sponsors_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_name", StringType(), False),
    StructField("abbreviation", StringType(), False),
    StructField("revenue_amount", DoubleType(), False),
    StructField("revenue_percent", DoubleType(), False),
    StructField("cumulative_percent", DoubleType(), False),
    StructField("yoy_change", DoubleType(), False),
])

df = spark.createDataFrame(sponsors_data, sponsors_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_top_sponsors_concentration")
print(f"✓ Created gold_top_sponsors_concentration with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Diversification

# COMMAND ----------

diversification_data = [
    (as_of_date, "Geographic Region", "National Capital Region", 520000000.0, 42.7),
    (as_of_date, "Geographic Region", "Northeast", 195000000.0, 16.0),
    (as_of_date, "Geographic Region", "Southeast", 168000000.0, 13.8),
    (as_of_date, "Geographic Region", "Midwest", 134000000.0, 11.0),
    (as_of_date, "Geographic Region", "Southwest", 112000000.0, 9.2),
    (as_of_date, "Geographic Region", "West", 89000000.0, 7.3),
    (as_of_date, "Mission Area", "Cybersecurity", 298000000.0, 24.5),
    (as_of_date, "Mission Area", "Enterprise IT", 267000000.0, 21.9),
    (as_of_date, "Mission Area", "Healthcare IT", 189000000.0, 15.5),
    (as_of_date, "Mission Area", "Financial Systems", 156000000.0, 12.8),
    (as_of_date, "Mission Area", "Homeland Security", 143000000.0, 11.7),
    (as_of_date, "Mission Area", "Defense Systems", 112000000.0, 9.2),
    (as_of_date, "Mission Area", "Other", 53000000.0, 4.4),
]

diversification_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("category", StringType(), False),
    StructField("segment_name", StringType(), False),
    StructField("value", DoubleType(), False),
    StructField("percent", DoubleType(), False),
])

df = spark.createDataFrame(diversification_data, diversification_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_diversification")
print(f"✓ Created gold_diversification with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Retention Trend

# COMMAND ----------

retention_data = [
    (as_of_date, "2020", 42, 8, 5, 89.4),
    (as_of_date, "2021", 45, 6, 3, 93.8),
    (as_of_date, "2022", 48, 7, 4, 92.3),
    (as_of_date, "2023", 51, 5, 2, 96.2),
    (as_of_date, "2024", 54, 6, 3, 94.7),
]

retention_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("year", StringType(), False),
    StructField("retained_sponsors", IntegerType(), False),
    StructField("new_sponsors", IntegerType(), False),
    StructField("churned_sponsors", IntegerType(), False),
    StructField("retention_rate", DoubleType(), False),
])

df = spark.createDataFrame(retention_data, retention_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_retention_trend")
print(f"✓ Created gold_retention_trend with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Key Person Dependencies

# COMMAND ----------

key_person_data = [
    (as_of_date, "kp1", "FedRAMP Security Assessment", "Dr. Sarah Chen", 1, True, "high", "hssedi"),
    (as_of_date, "kp2", "CAS Compliance Advisory", "Michael Roberts", 0, False, "critical", "cems"),
    (as_of_date, "kp3", "Healthcare Analytics (CMS)", "Dr. Emily Watson", 2, True, "medium", "cms"),
    (as_of_date, "kp4", "DoD Acquisition Systems", "James Thompson", 1, True, "high", "nsc"),
    (as_of_date, "kp5", "Judicial Case Management", "Patricia Anderson", 0, False, "critical", "jsac"),
    (as_of_date, "kp6", "Veteran Benefits Modernization", "David Kim", 2, True, "low", "cve"),
    (as_of_date, "kp7", "Zero Trust Architecture", "Angela Martinez", 1, True, "medium", "hssedi"),
    (as_of_date, "kp8", "Financial Systems Integration", "Robert Lee", 0, False, "high", "cems"),
]

key_person_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("item_id", StringType(), False),
    StructField("capability", StringType(), False),
    StructField("primary_owner", StringType(), False),
    StructField("backup_count", IntegerType(), False),
    StructField("has_documentation", BooleanType(), False),
    StructField("risk_level", StringType(), False),
    StructField("ffrdc_id", StringType(), False),
])

df = spark.createDataFrame(key_person_data, key_person_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_key_person_dependencies")
print(f"✓ Created gold_key_person_dependencies with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bench Utilization

# COMMAND ----------

bench_data = [
    (as_of_date, "cems", "CEMS", 485, 78, 16.1, "healthy"),
    (as_of_date, "cve", "CVE", 312, 71, 22.8, "attention"),
    (as_of_date, "hssedi", "HSSEDI", 567, 102, 18.0, "healthy"),
    (as_of_date, "jsac", "JSAC", 198, 52, 26.3, "critical"),
    (as_of_date, "nsc", "NSC", 423, 68, 16.1, "healthy"),
    (as_of_date, "cms", "CMS", 289, 49, 17.0, "healthy"),
]

bench_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("total_headcount", IntegerType(), False),
    StructField("bench_count", IntegerType(), False),
    StructField("bench_percent", DoubleType(), False),
    StructField("status", StringType(), False),
])

df = spark.createDataFrame(bench_data, bench_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_bench_utilization")
print(f"✓ Created gold_bench_utilization with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Turnover Trend

# COMMAND ----------

turnover_data = [
    (as_of_date, "cems", "CEMS", "2024", 11.2, 8.5, 2.7, 13.5),
    (as_of_date, "cve", "CVE", "2024", 14.8, 12.1, 2.7, 13.5),
    (as_of_date, "hssedi", "HSSEDI", "2024", 9.7, 7.2, 2.5, 13.5),
    (as_of_date, "jsac", "JSAC", "2024", 18.2, 15.6, 2.6, 13.5),
    (as_of_date, "nsc", "NSC", "2024", 12.3, 9.8, 2.5, 13.5),
    (as_of_date, "cms", "CMS", "2024", 10.5, 8.1, 2.4, 13.5),
]

turnover_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("ffrdc_name", StringType(), False),
    StructField("period", StringType(), False),
    StructField("turnover_rate", DoubleType(), False),
    StructField("voluntary_rate", DoubleType(), False),
    StructField("involuntary_rate", DoubleType(), False),
    StructField("industry_benchmark", DoubleType(), False),
])

df = spark.createDataFrame(turnover_data, turnover_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_turnover_trend")
print(f"✓ Created gold_turnover_trend with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## GL Exceptions

# COMMAND ----------

gl_data = [
    (as_of_date, "gl1", date(2024, 12, 15), "Large manual journal entry - Intercompany adjustment", 2450000.0, "1500-IC", "cems", "under_review", "high"),
    (as_of_date, "gl2", date(2024, 12, 12), "Reversal of prior period accrual", 890000.0, "2100-ACC", "hssedi", "resolved", "medium"),
    (as_of_date, "gl3", date(2024, 12, 10), "Unusual vendor payment timing", 567000.0, "2000-AP", "nsc", "open", "medium"),
    (as_of_date, "gl4", date(2024, 12, 8), "Cost transfer between projects", 234000.0, "5100-DL", "cve", "open", "low"),
    (as_of_date, "gl5", date(2024, 12, 5), "Indirect rate adjustment entry", 1120000.0, "6500-OH", "cms", "escalated", "high"),
    (as_of_date, "gl6", date(2024, 12, 1), "Unbilled revenue reclassification", 678000.0, "1300-UB", "jsac", "under_review", "medium"),
]

gl_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("exception_id", StringType(), False),
    StructField("exception_date", DateType(), False),
    StructField("description", StringType(), False),
    StructField("amount", DoubleType(), False),
    StructField("account", StringType(), False),
    StructField("ffrdc_id", StringType(), False),
    StructField("status", StringType(), False),
    StructField("severity", StringType(), False),
])

df = spark.createDataFrame(gl_data, gl_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_gl_exceptions")
print(f"✓ Created gold_gl_exceptions with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Control Exceptions Trend

# COMMAND ----------

exceptions_trend_data = [
    (as_of_date, "Jul", 8, 3, 6),
    (as_of_date, "Aug", 12, 5, 10),
    (as_of_date, "Sep", 6, 2, 8),
    (as_of_date, "Oct", 9, 4, 7),
    (as_of_date, "Nov", 11, 3, 9),
    (as_of_date, "Dec", 14, 6, 5),
]

exceptions_trend_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("month", StringType(), False),
    StructField("unusual_entries", IntegerType(), False),
    StructField("failed_tests", IntegerType(), False),
    StructField("resolved", IntegerType(), False),
])

df = spark.createDataFrame(exceptions_trend_data, exceptions_trend_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_control_exceptions_trend")
print(f"✓ Created gold_control_exceptions_trend with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Covenant Compliance

# COMMAND ----------

covenant_data = [
    (as_of_date, "cov1", "Current Ratio", "Balance Sheet", 1.50, 2.15, True, 0.65, "green"),
    (as_of_date, "cov2", "Debt Service Coverage", "Cash Flow", 1.25, 1.89, True, 0.64, "green"),
    (as_of_date, "cov3", "Working Capital", "Balance Sheet", 50000000.0, 78500000.0, True, 28500000.0, "green"),
    (as_of_date, "cov4", "Net Worth", "Balance Sheet", 200000000.0, 342000000.0, True, 142000000.0, "green"),
    (as_of_date, "cov5", "Indirect Rate Cap", "Cost Accounting", 45.0, 42.8, True, -2.2, "yellow"),
    (as_of_date, "cov6", "Unbilled Receivables", "Balance Sheet", 90000000.0, 85000000.0, True, -5000000.0, "green"),
]

covenant_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("covenant_id", StringType(), False),
    StructField("covenant_name", StringType(), False),
    StructField("category", StringType(), False),
    StructField("threshold", DoubleType(), False),
    StructField("actual", DoubleType(), False),
    StructField("in_compliance", BooleanType(), False),
    StructField("headroom", DoubleType(), False),
    StructField("status", StringType(), False),
])

df = spark.createDataFrame(covenant_data, covenant_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_covenant_compliance")
print(f"✓ Created gold_covenant_compliance with {df.count()} rows")

# COMMAND ----------

print("=" * 60)
print("Risk & Compliance Schema - Seed Complete")
print("=" * 60)

