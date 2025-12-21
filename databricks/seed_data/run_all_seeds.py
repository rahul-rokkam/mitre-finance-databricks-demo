# Databricks notebook source
# MAGIC %md
# MAGIC # Seed All Delta Tables
# MAGIC 
# MAGIC This notebook runs all seed scripts to populate Delta tables for the Financial Command Center.
# MAGIC 
# MAGIC ## Schemas Populated
# MAGIC - `financial-command-center`.`financial-health`
# MAGIC - `financial-command-center`.`program-portfolio`
# MAGIC - `financial-command-center`.`sponsor-funding`
# MAGIC - `financial-command-center`.`risk-compliance`
# MAGIC - `financial-command-center`.`government-relations`

# COMMAND ----------

# MAGIC %md
# MAGIC ## Prerequisites
# MAGIC 
# MAGIC Before running this notebook, ensure:
# MAGIC 1. The Unity Catalog and schemas have been created (run `uc_bootstrap/01_create_catalog_and_schemas.sql`)
# MAGIC 2. You have write permissions to the `financial-command-center` catalog

# COMMAND ----------

print("=" * 70)
print("Financial Command Center - Delta Table Seeding")
print("=" * 70)
print()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Financial Health Schema

# COMMAND ----------

# MAGIC %run ./seed_financial_health

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Program Portfolio Schema

# COMMAND ----------

# MAGIC %run ./seed_program_portfolio

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Sponsor Funding Schema

# COMMAND ----------

# MAGIC %run ./seed_sponsor_funding

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Risk & Compliance Schema

# COMMAND ----------

# MAGIC %run ./seed_risk_compliance

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Government Relations Schema

# COMMAND ----------

# MAGIC %run ./seed_government_relations

# COMMAND ----------

# MAGIC %md
# MAGIC ## Summary

# COMMAND ----------

from pyspark.sql import functions as F

CATALOG = "treasury_corporate_financial_catalog"
schemas = ["financial-health", "program-portfolio", "sponsor-funding", "risk-compliance", "government-relations"]

print("=" * 70)
print("SEEDING COMPLETE - TABLE SUMMARY")
print("=" * 70)
print()

total_tables = 0
total_rows = 0

for schema in schemas:
    print(f"\n📁 {CATALOG}.{schema}")
    print("-" * 50)
    try:
        tables = spark.sql(f"SHOW TABLES IN `{CATALOG}`.`{schema}`").collect()
        for t in tables:
            try:
                count = spark.table(f"`{CATALOG}`.`{schema}`.{t.tableName}").count()
                print(f"   ✓ {t.tableName}: {count:,} rows")
                total_tables += 1
                total_rows += count
            except Exception as e:
                print(f"   ✗ {t.tableName}: Error - {str(e)[:50]}")
    except Exception as e:
        print(f"   ✗ Error listing tables: {str(e)[:50]}")

print()
print("=" * 70)
print(f"TOTAL: {total_tables} tables, {total_rows:,} rows")
print("=" * 70)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Next Steps
# MAGIC 
# MAGIC 1. **Verify data quality**: Run `validation/validate_gold_tables.py`
# MAGIC 2. **Connect backend**: Update FastAPI routes to query these Delta tables
# MAGIC 3. **Schedule refresh**: Set up a Databricks Job to refresh data periodically

