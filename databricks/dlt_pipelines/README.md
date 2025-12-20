# Delta Live Tables Pipelines

This directory contains DLT pipeline notebooks for each schema in the Financial Command Center data platform.

## Pipeline Structure

Each pipeline follows the medallion architecture:
- **Bronze**: Raw data ingestion from source systems
- **Silver**: Cleaned and conformed dimension and fact tables
- **Gold**: Visualization-ready mart tables

## Pipeline Files

| File | Schema | Description |
|------|--------|-------------|
| `financial_health_pipeline.py` | `financial-health` | Core financial metrics, revenue/budget, margins |
| `program_portfolio_pipeline.py` | `program-portfolio` | Sponsor-FFRDC allocations, economics |
| `sponsor_funding_pipeline.py` | `sponsor-funding` | Cost stewardship, efficiency metrics |
| `risk_compliance_pipeline.py` | `risk-compliance` | Audit, concentration, talent risk |
| `government_relations_pipeline.py` | `government-relations` | Market share, win/loss, pipeline |

## Configuration

Each pipeline should be configured with:

```json
{
  "name": "financial-command-center-{schema-name}",
  "catalog": "financial-command-center",
  "target": "{schema-name}",
  "development": true,
  "continuous": false,
  "channel": "CURRENT",
  "photon": true,
  "configuration": {
    "pipelines.enableTrackHistory": "true"
  }
}
```

## Data Quality

All pipelines implement DLT expectations for:
- Not-null primary keys
- Valid value ranges (percentages 0-100, positive amounts)
- Referential integrity (fact tables reference dimension tables)
- Business rules (e.g., variance = actual - budget)

## Deployment

1. Import notebooks to your Databricks workspace
2. Create DLT pipeline for each notebook
3. Configure source connections (replace demo data with actual sources)
4. Run pipelines in development mode to validate
5. Switch to production mode for scheduled execution

