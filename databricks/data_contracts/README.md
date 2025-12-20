# Data Contracts: Visualization to Delta Table Mapping

This document defines the data contracts between UI visualizations and their backing Delta tables in Unity Catalog.

## Catalog: `financial-command-center`

## Schema Overview

| Schema | UI Tab | Description |
|--------|--------|-------------|
| `financial-health` | Financial Health Snapshot | Core financial KPIs, revenue/budget, margins, cash position |
| `program-portfolio` | Program Portfolio | Sponsor-FFRDC allocations, economics, sponsor health |
| `sponsor-funding` | Sponsor Funding & Cost Stewardship | Stewardship metrics, efficiency, sponsor experience |
| `risk-compliance` | Risk & Compliance Monitoring | Audit findings, concentration risk, talent risk, control exceptions |
| `government-relations` | Government Relations | Market share, win/loss, capability gaps, strategic pipeline |

## Time Window Support

All facts are stored at **month grain**. The UI time windows (`YTD`, `QTD`, `MTD`, `T12M`) are computed at query time:

- **YTD**: January 1 to current date
- **QTD**: Quarter start to current date
- **MTD**: Month start to current date
- **T12M**: Trailing 12 months from current date

## Filter Dimensions

Common filter dimensions across tabs:
- `ffrdc_id` - FFRDC entity filter
- `sponsor_id` - Sponsor entity filter
- `mission_area_id` - Mission area filter (government-relations)
- `month` / `as_of_date` - Time dimension

