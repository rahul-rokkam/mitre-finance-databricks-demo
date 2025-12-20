# Validation Scripts

This directory contains validation notebooks for the Financial Command Center data platform.

## Scripts

### validate_gold_tables.py

Validates that all expected Delta tables exist and contain data. Run this after deploying DLT pipelines to verify:

1. All schemas exist in the `financial-command-center` catalog
2. All expected tables (dimensions, facts, gold marts) are created
3. Tables contain data (non-zero row counts)
4. Each UI visualization has a corresponding gold table

## Running Validation

1. Import `validate_gold_tables.py` to your Databricks workspace
2. Run as a notebook with a cluster that has access to Unity Catalog
3. Review the output for any missing or empty tables

## Expected Output

When all pipelines have run successfully:

```
VALIDATION SUMMARY
==================================================
Total tables expected: 80+
Total tables found: 80+
Total tables with data: 80+

✅ All tables exist and contain data!
✅ All visualizations have backing Delta tables defined!
```

