# Databricks notebook source
# MAGIC %md
# MAGIC # Seed Government Relations Delta Tables
# MAGIC 
# MAGIC This notebook populates the `government-relations` schema with visualization data.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`government-relations`

# COMMAND ----------

from pyspark.sql.types import *
from datetime import date

CATALOG = "treasury_corporate_financial_catalog"
SCHEMA = "government-relations"
as_of_date = date(2024, 12, 15)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Mission Areas Dimension

# COMMAND ----------

mission_areas_data = [
    ("defense", "Defense", "Department of Defense programs and initiatives"),
    ("cyber", "Cybersecurity", "Cybersecurity and critical infrastructure protection"),
    ("health", "Health", "Healthcare systems and public health initiatives"),
    ("aviation", "Aviation", "Aviation safety, air traffic, and aerospace"),
    ("climate", "Climate", "Climate science, sustainability, and environmental programs"),
    ("homeland", "Homeland Security", "DHS and domestic security programs"),
    ("intel", "Intelligence", "Intelligence community programs and analysis"),
]

mission_areas_schema = StructType([
    StructField("mission_area_id", StringType(), False),
    StructField("name", StringType(), False),
    StructField("description", StringType(), False),
])

df = spark.createDataFrame(mission_areas_data, mission_areas_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_mission_areas_dim")
print(f"✓ Created gold_mission_areas_dim with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Competitors Dimension

# COMMAND ----------

competitors_data = [
    ("lincoln", "MIT Lincoln Laboratory", "Lincoln Labs", "FFRDC"),
    ("rand", "RAND Corporation", "RAND", "FFRDC"),
    ("aerospace", "The Aerospace Corporation", "Aerospace", "FFRDC"),
    ("ida", "Institute for Defense Analyses", "IDA", "FFRDC"),
    ("cna", "CNA Corporation", "CNA", "FFRDC"),
    ("jhuapl", "Johns Hopkins APL", "JHU APL", "UARC"),
    ("sandia", "Sandia National Laboratories", "Sandia", "FFRDC"),
]

competitors_schema = StructType([
    StructField("competitor_id", StringType(), False),
    StructField("name", StringType(), False),
    StructField("abbreviation", StringType(), False),
    StructField("type", StringType(), False),
])

df = spark.createDataFrame(competitors_data, competitors_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_competitors_dim")
print(f"✓ Created gold_competitors_dim with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Market Share by Mission Area

# COMMAND ----------

market_share_data = [
    (as_of_date, "defense", "Defense", 4800000000.0, 18.5, 888000000.0, 3.2, 4.1),
    (as_of_date, "cyber", "Cybersecurity", 2100000000.0, 28.4, 596400000.0, 8.7, 12.3),
    (as_of_date, "health", "Health", 1400000000.0, 32.1, 449400000.0, 5.4, 6.8),
    (as_of_date, "aviation", "Aviation", 1200000000.0, 45.2, 542400000.0, 2.1, 1.8),
    (as_of_date, "climate", "Climate", 680000000.0, 15.3, 104040000.0, 14.2, 22.5),
    (as_of_date, "homeland", "Homeland Security", 980000000.0, 38.6, 378280000.0, 4.5, 5.2),
    (as_of_date, "intel", "Intelligence", 1850000000.0, 21.7, 401450000.0, 6.3, 7.9),
]

market_share_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("mission_area_id", StringType(), False),
    StructField("mission_area_name", StringType(), False),
    StructField("total_available_market", DoubleType(), False),
    StructField("mitre_share", DoubleType(), False),
    StructField("mitre_revenue", DoubleType(), False),
    StructField("market_growth_trajectory", DoubleType(), False),
    StructField("mitre_growth_trajectory", DoubleType(), False),
])

df = spark.createDataFrame(market_share_data, market_share_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_market_share_by_mission_area")
print(f"✓ Created gold_market_share_by_mission_area with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Win/Loss Records by Competitor

# COMMAND ----------

win_loss_data = [
    (as_of_date, "lincoln", "Lincoln Labs", 12, 18, -6, 40.0, 30, "improving"),
    (as_of_date, "rand", "RAND", 22, 8, 14, 73.3, 30, "stable"),
    (as_of_date, "aerospace", "Aerospace", 14, 11, 3, 56.0, 25, "stable"),
    (as_of_date, "ida", "IDA", 18, 12, 6, 60.0, 30, "improving"),
    (as_of_date, "cna", "CNA", 16, 4, 12, 80.0, 20, "stable"),
    (as_of_date, "jhuapl", "JHU APL", 8, 14, -6, 36.4, 22, "declining"),
    (as_of_date, "sandia", "Sandia", 11, 9, 2, 55.0, 20, "improving"),
]

win_loss_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("competitor_id", StringType(), False),
    StructField("competitor_abbreviation", StringType(), False),
    StructField("wins", IntegerType(), False),
    StructField("losses", IntegerType(), False),
    StructField("net_wins", IntegerType(), False),
    StructField("win_rate", DoubleType(), False),
    StructField("total_opportunities", IntegerType(), False),
    StructField("recent_trend", StringType(), False),
])

df = spark.createDataFrame(win_loss_data, win_loss_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_win_loss_by_competitor")
print(f"✓ Created gold_win_loss_by_competitor with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Win/Loss by Mission Area

# COMMAND ----------

win_loss_ma_data = [
    (as_of_date, "defense", "Defense", 24, 31, 43.6),
    (as_of_date, "cyber", "Cybersecurity", 28, 12, 70.0),
    (as_of_date, "health", "Health", 18, 6, 75.0),
    (as_of_date, "aviation", "Aviation", 15, 5, 75.0),
    (as_of_date, "climate", "Climate", 8, 4, 66.7),
    (as_of_date, "homeland", "Homeland Security", 14, 8, 63.6),
    (as_of_date, "intel", "Intelligence", 19, 22, 46.3),
]

win_loss_ma_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("mission_area_id", StringType(), False),
    StructField("mission_area_name", StringType(), False),
    StructField("wins", IntegerType(), False),
    StructField("losses", IntegerType(), False),
    StructField("win_rate", DoubleType(), False),
])

df = spark.createDataFrame(win_loss_ma_data, win_loss_ma_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_win_loss_by_mission_area")
print(f"✓ Created gold_win_loss_by_mission_area with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Capability Gaps

# COMMAND ----------

gaps_data = [
    (as_of_date, "gap-1", "Quantum Computing Security", "Post-quantum cryptography and quantum-resistant security protocols", "Cybersecurity,Defense,Intelligence", "critical", "addressing", 8, 145000000.0, date(2024, 3, 15), date(2025, 6, 30)),
    (as_of_date, "gap-2", "AI/ML Safety & Assurance", "Testing and evaluation frameworks for AI system safety and reliability", "Defense,Aviation,Health", "critical", "addressing", 12, 220000000.0, date(2024, 1, 10), date(2025, 3, 31)),
    (as_of_date, "gap-3", "Space Domain Awareness", "Satellite tracking, space debris monitoring, and orbital analysis", "Defense,Intelligence", "high", "identified", 5, 85000000.0, date(2024, 6, 20), None),
    (as_of_date, "gap-4", "Climate Modeling Integration", "Integration of climate models with infrastructure resilience planning", "Climate,Homeland Security", "medium", "identified", 4, 45000000.0, date(2024, 8, 5), None),
    (as_of_date, "gap-5", "5G/6G Security Architecture", "Next-generation wireless network security frameworks", "Defense,Cybersecurity", "high", "addressing", 7, 95000000.0, date(2024, 2, 28), date(2025, 9, 30)),
]

gaps_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("gap_id", StringType(), False),
    StructField("capability", StringType(), False),
    StructField("description", StringType(), False),
    StructField("mission_areas", StringType(), False),
    StructField("severity", StringType(), False),
    StructField("status", StringType(), False),
    StructField("sponsor_demand", IntegerType(), False),
    StructField("estimated_impact", DoubleType(), False),
    StructField("identified_date", DateType(), False),
    StructField("target_resolution_date", DateType(), True),
])

df = spark.createDataFrame(gaps_data, gaps_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_capability_gaps")
print(f"✓ Created gold_capability_gaps with {df.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Strategic Pipeline

# COMMAND ----------

pipeline_data = [
    (as_of_date, "pipe-1", "Next-Gen Air Traffic Management", "dod", "DoD", "aviation", "Aviation", 85000000.0, "high", 72.0, date(2025, 3, 15), "proposal"),
    (as_of_date, "pipe-2", "Zero Trust Cyber Framework", "dhs", "DHS", "cyber", "Cybersecurity", 125000000.0, "high", 85.0, date(2025, 2, 28), "proposal"),
    (as_of_date, "pipe-3", "Healthcare AI Standards", "hhs", "HHS", "health", "Health", 45000000.0, "medium", 65.0, date(2025, 4, 30), "qualification"),
    (as_of_date, "pipe-4", "Climate Resilience Modeling", "doe", "DOE", "climate", "Climate", 38000000.0, "medium", 58.0, date(2025, 6, 15), "qualification"),
    (as_of_date, "pipe-5", "Border Security Analytics", "dhs", "DHS", "homeland", "Homeland Security", 92000000.0, "high", 78.0, date(2025, 1, 31), "negotiation"),
    (as_of_date, "pipe-6", "Intel Community Data Platform", "cia", "IC", "intel", "Intelligence", 156000000.0, "high", 45.0, date(2025, 8, 30), "identification"),
    (as_of_date, "pipe-7", "DoD Cloud Migration", "dod", "DoD", "defense", "Defense", 210000000.0, "high", 68.0, date(2025, 5, 15), "proposal"),
]

pipeline_schema = StructType([
    StructField("as_of_date", DateType(), False),
    StructField("pipeline_id", StringType(), False),
    StructField("opportunity_name", StringType(), False),
    StructField("sponsor_id", StringType(), False),
    StructField("sponsor_abbreviation", StringType(), False),
    StructField("mission_area_id", StringType(), False),
    StructField("mission_area_name", StringType(), False),
    StructField("estimated_value", DoubleType(), False),
    StructField("priority", StringType(), False),
    StructField("probability", DoubleType(), False),
    StructField("target_award_date", DateType(), False),
    StructField("stage", StringType(), False),
])

df = spark.createDataFrame(pipeline_data, pipeline_schema)
df.write.format("delta").mode("overwrite").saveAsTable(f"`{CATALOG}`.`{SCHEMA}`.gold_strategic_pipeline")
print(f"✓ Created gold_strategic_pipeline with {df.count()} rows")

# COMMAND ----------

print("=" * 60)
print("Government Relations Schema - Seed Complete")
print("=" * 60)

