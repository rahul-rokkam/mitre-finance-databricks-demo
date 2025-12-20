# Databricks Delta Tables - Financial Command Center

This directory contains all artifacts needed to create and manage Delta tables in Databricks that back every visualization in the Financial Command Center application.

## Architecture Overview

```
financial-command-center (Unity Catalog)
├── financial-health (schema)
│   ├── dim_* (dimension tables)
│   ├── fact_* (fact tables at month grain)
│   └── gold_* (visualization-ready marts)
├── program-portfolio (schema)
│   ├── dim_*, fact_*, gold_*
├── sponsor-funding (schema)
│   ├── dim_*, fact_*, gold_*
├── risk-compliance (schema)
│   ├── dim_*, fact_*, gold_*
└── government-relations (schema)
    ├── dim_*, fact_*, gold_*
```

## Directory Structure

```
databricks/
├── README.md                      # This file
├── data_contracts/                # Visualization-to-table mappings
│   ├── README.md                  # Overview of all contracts
│   ├── financial_health.md        # Financial Health tab contracts
│   ├── program_portfolio.md       # Program Portfolio tab contracts
│   ├── sponsor_funding.md         # Sponsor Funding tab contracts
│   ├── risk_compliance.md         # Risk & Compliance tab contracts
│   └── government_relations.md    # Government Relations tab contracts
├── uc_bootstrap/                  # Unity Catalog setup scripts
│   ├── README.md
│   ├── 01_create_catalog_and_schemas.sql
│   ├── 02_create_shared_dimensions.sql
│   └── 03_grant_permissions.sql
├── dlt_pipelines/                 # Delta Live Tables pipeline notebooks
│   ├── README.md
│   ├── financial_health_pipeline.py
│   ├── program_portfolio_pipeline.py
│   ├── sponsor_funding_pipeline.py
│   ├── risk_compliance_pipeline.py
│   └── government_relations_pipeline.py
└── validation/                    # Validation scripts
    ├── README.md
    └── validate_gold_tables.py
```

## Quick Start

### 1. Bootstrap Unity Catalog

Run the SQL scripts in `uc_bootstrap/` in order:

```sql
-- In Databricks SQL or notebook
%run ./uc_bootstrap/01_create_catalog_and_schemas
%run ./uc_bootstrap/02_create_shared_dimensions
%run ./uc_bootstrap/03_grant_permissions
```

### 2. Create DLT Pipelines

For each schema, create a Delta Live Tables pipeline:

1. Import the corresponding notebook from `dlt_pipelines/` to your workspace
2. Create a new DLT pipeline with:
   - **Catalog**: `financial-command-center`
   - **Target Schema**: (matching schema name, e.g., `financial-health`)
   - **Source**: The imported notebook

### 3. Run Pipelines

Run each pipeline to materialize:
- Bronze tables (raw data ingestion)
- Silver tables (cleaned facts and dimensions)
- Gold tables (visualization-ready marts)

### 4. Validate

Run `validation/validate_gold_tables.py` to verify all tables exist and contain data.

## Visualization Coverage

| UI Tab | Schema | Visualizations | Gold Tables |
|--------|--------|---------------|-------------|
| Financial Health | `financial-health` | 8 | 9 |
| Program Portfolio | `program-portfolio` | 8 | 8 |
| Sponsor Funding | `sponsor-funding` | 12 | 12 |
| Risk & Compliance | `risk-compliance` | 17 | 17 |
| Government Relations | `government-relations` | 5 | 6 |
| **Total** | **5 schemas** | **50 visualizations** | **52 gold tables** |

## Data Flow

```
Source Systems           DLT Bronze         DLT Silver           DLT Gold              UI
     │                      │                  │                    │                  │
     ├─ ERP/GL ────────────►│ raw_finance      │                    │                  │
     ├─ Budget ────────────►│ raw_budget ─────►│ fact_finance_*     │                  │
     ├─ HR/Time ───────────►│ raw_headcount ──►│ fact_headcount ───►│ gold_*  ────────►│ Charts
     ├─ CRM ───────────────►│ raw_sponsor ────►│ dim_sponsor        │                  │ Tables
     ├─ Audit/GRC ─────────►│ raw_findings ───►│ fact_audit_*       │                  │ KPIs
     └─ BD/Pipeline ───────►│ raw_pipeline ───►│ fact_pipeline ────►│                  │
```

## Time Window Support

All fact tables store data at **month grain**. The UI time windows are computed at query time:

| Window | Definition |
|--------|------------|
| YTD | January 1 to current date |
| QTD | Quarter start to current date |
| MTD | Month start to current date |
| T12M | Trailing 12 months |

## Data Quality

DLT pipelines implement expectations for:
- Not-null primary keys
- Valid value ranges (percentages 0-100)
- Positive amounts
- Referential integrity

## Connecting the App

To connect the FastAPI backend to these tables:

1. Add routes that query the gold tables
2. Use the Databricks SDK or SQL Connector
3. Replace the `static-data.ts` files with API calls

Example query for Revenue vs Budget:

```sql
SELECT ffrdc_id, ffrdc_name, month, actual_revenue, budget_amount, variance, variance_pct
FROM `financial-command-center`.`financial-health`.gold_revenue_vs_budget
WHERE month >= :start_date AND month <= :end_date
ORDER BY ffrdc_name, month
```

## Maintenance

- **Daily refresh**: Schedule DLT pipelines for daily execution
- **Schema evolution**: Use DLT's schema evolution features
- **Monitoring**: Enable DLT metrics and alerts
- **Backfill**: Re-run pipelines with full refresh for historical data

