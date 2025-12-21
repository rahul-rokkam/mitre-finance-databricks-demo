# Seed Data Scripts

This folder contains Python scripts to populate Delta tables with visualization data.

## Overview

These scripts convert the static visualization data from the UI components into Delta tables
that can be queried by the application backend. This enables:

1. **Data-driven dashboards**: Replace static TypeScript data with live queries
2. **Historical tracking**: Maintain time-series data for trend analysis
3. **FFRDC-specific views**: Enable drill-down by FFRDC/sponsor

## Catalog Structure

All tables are written to: `financial-command-center.<schema>.<table>`

| Schema | Description |
|--------|-------------|
| `financial-health` | Core financial KPIs, revenue/budget, margins, cash position |
| `program-portfolio` | Sponsor-FFRDC allocations, economics, sponsor health |
| `sponsor-funding` | Stewardship metrics, efficiency, sponsor experience |
| `risk-compliance` | Audit findings, concentration risk, talent risk |
| `government-relations` | Market share, win/loss, capability gaps, pipeline |

## Scripts

| Script | Target Schema | Description |
|--------|---------------|-------------|
| `seed_financial_health.py` | `financial-health` | KPIs, revenue/budget, margins, cash, signals |
| `seed_program_portfolio.py` | `program-portfolio` | Sponsor allocations, contract runway, health |
| `seed_sponsor_funding.py` | `sponsor-funding` | Stewardship, renewals, sponsor health |
| `seed_risk_compliance.py` | `risk-compliance` | Compliance calendar, covenants, GL exceptions |
| `seed_government_relations.py` | `government-relations` | Pipeline, win/loss, capability gaps |
| `run_all_seeds.py` | All | Master runner to execute all seeds |

## Usage

### Option 1: Run via Databricks Notebook

Upload `run_all_seeds.py` as a notebook and execute:

```python
%run ./run_all_seeds
```

### Option 2: Run Individual Seeds

```python
%run ./seed_financial_health
```

### Option 3: Run via databricks CLI

```bash
databricks workspace import_dir ./seed_data /Workspace/Users/<email>/mitre-finance/seed_data
databricks jobs run-now --job-id <job_id>
```

## Table Naming Convention

Gold layer tables (ready for visualization):
- `gold_<entity>` - Aggregated/transformed data for UI consumption

Example: `gold_kpi_summary`, `gold_revenue_vs_budget`, `gold_aging_buckets`

