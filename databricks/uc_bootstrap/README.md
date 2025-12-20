# Unity Catalog Bootstrap Scripts

These SQL scripts set up the Unity Catalog structure for the Financial Command Center data platform.

## Prerequisites

- Databricks workspace with Unity Catalog enabled
- Account/Workspace admin or Metastore admin permissions
- Groups created: `data-consumers`, `data-engineers` (or adjust script to match your groups)

## Execution Order

Run scripts in the following order:

1. **01_create_catalog_and_schemas.sql** - Creates the catalog and all schemas
2. **02_create_shared_dimensions.sql** - Creates shared dimension tables
3. **03_grant_permissions.sql** - Configures access permissions

## Catalog Structure

```
financial-command-center (catalog)
├── financial-health (schema)
│   ├── dim_date_month
│   ├── dim_ffrdc
│   ├── dim_sponsor
│   ├── fact_* tables
│   └── gold_* tables
├── program-portfolio (schema)
│   ├── fact_* tables
│   └── gold_* tables
├── sponsor-funding (schema)
│   ├── fact_* tables
│   └── gold_* tables
├── risk-compliance (schema)
│   ├── fact_* tables
│   └── gold_* tables
└── government-relations (schema)
    ├── dim_mission_area
    ├── dim_competitor
    ├── fact_* tables
    └── gold_* tables
```

## Notes

- Schema names contain hyphens, so they must be quoted with backticks in SQL
- The `financial-health` schema contains shared dimension tables referenced by other schemas
- Each DLT pipeline targets one schema and creates its own tables

