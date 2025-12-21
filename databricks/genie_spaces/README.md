# Genie Spaces Setup

This folder contains scripts to create and configure Databricks AI/BI Genie spaces for the Financial Command Center.

## Overview

The Financial Command Center uses 5 Genie spaces, one for each data schema:

| Schema | Genie Space Name | Purpose |
|--------|------------------|---------|
| `financial-health` | Financial Health | Revenue, budget, margins, cash position |
| `program-portfolio` | Program Portfolio | Sponsor allocations, FFRDC economics |
| `sponsor-funding` | Sponsor Funding & Cost Stewardship | Efficiency, utilization, sponsor satisfaction |
| `risk-compliance` | Risk & Compliance | Audit findings, concentration risk, controls |
| `government-relations` | Government Relations | Market share, win/loss, strategic pipeline |

## Prerequisites

Before running the setup script, ensure you have:

1. **Unity Catalog Access**: Access to the `treasury_corporate_financial_catalog` catalog
2. **SQL Warehouse**: A Pro or Serverless SQL warehouse with `CAN USE` permission
3. **Table Permissions**: `SELECT` permission on all tables in the 5 schemas
4. **Databricks CLI**: Configured with appropriate credentials

## Setup Instructions

### 1. Import the Notebook

Import `setup_genie_spaces.py` into your Databricks workspace:

```bash
databricks workspace import ./setup_genie_spaces.py /Workspace/Users/<your-email>/setup_genie_spaces -f AUTO
```

### 2. Run the Notebook

1. Open the notebook in Databricks
2. Run all cells in order
3. When prompted, enter your SQL Warehouse ID in the widget
4. The notebook will create all 5 Genie spaces

### 3. Copy Configuration

After the spaces are created, the notebook outputs configuration for:

**app.yml** (for Databricks Apps):
```yaml
env:
  - name: FINANCIAL_COMMAND_CENTER_GENIE_SPACE_FINANCIAL_HEALTH
    value: "<space_id>"
  - name: FINANCIAL_COMMAND_CENTER_GENIE_SPACE_PROGRAM_PORTFOLIO
    value: "<space_id>"
  # ... etc
```

**.env** (for local development):
```
FINANCIAL_COMMAND_CENTER_GENIE_SPACE_FINANCIAL_HEALTH="<space_id>"
FINANCIAL_COMMAND_CENTER_GENIE_SPACE_PROGRAM_PORTFOLIO="<space_id>"
# ... etc
```

### 4. Grant Permissions

For each Genie space, grant access to the app's service principal:

1. Go to each Genie space in the Databricks UI (AI/BI > Genie)
2. Click **Share**
3. Add your app's service principal with **Can Run** permission

Also ensure the service principal has:
- `CAN USE` on the SQL warehouse
- `SELECT` on all tables in each schema

## API Reference

The Genie spaces are created using the [Databricks Genie API](https://docs.databricks.com/api/workspace/genie/createspace):

```
POST /api/2.0/genie/spaces
```

Each space includes:
- **Sample Questions**: Pre-configured questions to help users get started
- **Instructions**: Context about the data and terminology
- **Data Sources**: All tables from the corresponding schema

## Troubleshooting

### "No tables found" error
Ensure the seed data notebooks have been run to create tables in each schema.

### "Permission denied" error
Verify you have:
- `USE CATALOG` on `treasury_corporate_financial_catalog`
- `USE SCHEMA` on each schema
- Access to create Genie spaces (workspace admin or appropriate permissions)

### Genie space not responding
Check that:
- The SQL warehouse is running
- The service principal has all required permissions
- Tables contain data (not empty)

## Related Documentation

- [Set up and manage an AI/BI Genie space](https://docs.databricks.com/genie/set-up)
- [Genie Conversation API](https://docs.databricks.com/genie/conversation-api)
- [Genie API Reference](https://docs.databricks.com/api/workspace/genie)

