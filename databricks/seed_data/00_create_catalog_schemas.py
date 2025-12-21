# Databricks notebook source
# MAGIC %md
# MAGIC # Create Unity Catalog and Schemas
# MAGIC 
# MAGIC This notebook creates the required catalog and schemas for the Financial Command Center.

# COMMAND ----------

# MAGIC %sql
# MAGIC -- Use the existing catalog
# MAGIC USE CATALOG `treasury_corporate_financial_catalog`;

# COMMAND ----------

# MAGIC %sql
# MAGIC -- Create schemas
# MAGIC CREATE SCHEMA IF NOT EXISTS `financial-health`
# MAGIC COMMENT 'Financial Health Snapshot - Core financial KPIs, revenue/budget, margins, cash position';

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE SCHEMA IF NOT EXISTS `program-portfolio`
# MAGIC COMMENT 'Program Portfolio & Sponsor Funding Analytics - Sponsor-FFRDC allocations, economics, sponsor health';

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE SCHEMA IF NOT EXISTS `sponsor-funding`
# MAGIC COMMENT 'Sponsor Funding & Cost Stewardship - Stewardship metrics, efficiency, sponsor experience';

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE SCHEMA IF NOT EXISTS `risk-compliance`
# MAGIC COMMENT 'Risk & Compliance Monitoring - Audit findings, concentration risk, talent risk, control exceptions';

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE SCHEMA IF NOT EXISTS `government-relations`
# MAGIC COMMENT 'Government Relations & Strategic Positioning - Market share, win/loss, capability gaps, strategic pipeline';

# COMMAND ----------

# MAGIC %sql
# MAGIC -- Verify creation
# MAGIC SHOW SCHEMAS IN `treasury_corporate_financial_catalog`;

# COMMAND ----------

print("✓ Catalog and schemas created successfully!")

