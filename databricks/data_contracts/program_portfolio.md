# Program Portfolio Data Contracts

## Schema: `financial-command-center`.`program-portfolio`

## Visualizations and Required Tables

### 1. Sponsor-FFRDC Allocation Chart
**Visualization**: `SponsorFfrdcAllocationChart` - Stacked bar showing funding by sponsor across FFRDCs
**Gold Table**: `gold_sponsor_ffrdc_allocation`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| sponsor_abbreviation | STRING | Sponsor abbreviation |
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| funding_amount | DOUBLE | Funding allocation |
| total_sponsor_funding | DOUBLE | Total funding for sponsor |
| pct_of_sponsor_total | DOUBLE | Percentage of sponsor's total |

**Grain**: One row per sponsor-FFRDC pair per month

---

### 2. Sponsor YTD Budget Trend Chart
**Visualization**: `SponsorYtdBudgetTrendChart` - Line chart showing YTD budget trend by sponsor
**Gold Table**: `gold_sponsor_ytd_trend`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| ytd_funding | DOUBLE | Year-to-date funding |
| annual_budget | DOUBLE | Annual budget |
| pct_of_budget | DOUBLE | YTD as % of annual |
| growth_pct | DOUBLE | YoY growth percentage |

**Grain**: One row per sponsor per month

---

### 3. FFRDC Revenue/Cost Waterfall Chart
**Visualization**: `FfrdcRevenueCostWaterfallChart` - Waterfall showing revenue to margin breakdown
**Gold Table**: `gold_ffrdc_waterfall`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| revenue | DOUBLE | Total revenue |
| cost_of_delivery | DOUBLE | Direct costs |
| gross_profit | DOUBLE | Revenue - CoD |
| margin_pct | DOUBLE | Gross margin percentage |

**Grain**: One row per FFRDC per month

---

### 4. Cost Per FTE Chart
**Visualization**: `CostPerFteChart` - Bar chart comparing cost/FTE by FFRDC
**Gold Table**: `gold_cost_per_fte`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| cost_per_fte | DOUBLE | Cost per FTE |
| headcount | INT | FTE count |
| total_cost | DOUBLE | Total cost |

**Grain**: One row per FFRDC per month

---

### 5. Pricing Rate Trends Chart
**Visualization**: `PricingRateTrendsChart` - Line chart showing rate trends
**Gold Table**: `gold_pricing_rate_trends`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| negotiated_rate_index | DOUBLE | Rate index (100 = baseline) |
| inflation_index | DOUBLE | Inflation adjustment |
| labor_cost_index | DOUBLE | Labor cost index |

**Grain**: One row per FFRDC per month

---

### 6. Sponsor Health Scatter Chart
**Visualization**: `SponsorHealthScatterChart` - Scatter plot of sponsor health metrics
**Gold Table**: `gold_sponsor_health_scatter`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| cpi | DOUBLE | Cost Performance Index |
| utilization_pct | DOUBLE | Utilization percentage |
| funding_volume | DOUBLE | Total funding (bubble size) |
| status | STRING | healthy/attention/critical |

**Grain**: One row per sponsor per month

---

### 7. Sponsor Health Heatmap Table
**Visualization**: `SponsorHealthHeatmapTable` - Matrix showing health metrics by sponsor
**Gold Table**: `gold_sponsor_health_heatmap`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| cpi | DOUBLE | Cost Performance Index |
| utilization_pct | DOUBLE | Utilization percentage |
| runway_months | INT | Contract runway |
| status | STRING | healthy/attention/critical |

**Grain**: One row per sponsor per month

---

### 8. Contract Runway Table
**Visualization**: `ContractRunwayTable` - Table showing contract expiration timelines
**Gold Table**: `gold_contract_runway`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| as_of_date | DATE | Snapshot date |
| contract_value | DOUBLE | Total contract value |
| runway_months | INT | Months until expiration |
| next_renewal_date | DATE | Next renewal date |
| status | STRING | healthy/attention/critical |

**Grain**: One row per sponsor per snapshot

---

## Dimension Tables

### dim_sponsor
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Primary key |
| sponsor_name | STRING | Full name |
| abbreviation | STRING | Short code |
| agency_group | STRING | Agency grouping (Defense, etc.) |

### dim_ffrdc
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | Primary key |
| ffrdc_name | STRING | Full name |
| short_name | STRING | Abbreviation |

### dim_contract
| Column | Type | Description |
|--------|------|-------------|
| contract_id | STRING | Primary key |
| sponsor_id | STRING | FK to dim_sponsor |
| contract_name | STRING | Contract name |
| start_date | DATE | Contract start |
| end_date | DATE | Contract end |
| total_value | DOUBLE | Total contract value |

---

## Fact Tables (Silver)

### fact_sponsor_ffrdc_funding
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | FK to dim_sponsor |
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| funding_amount | DOUBLE | Monthly funding |
| ytd_funding | DOUBLE | Year-to-date cumulative |
| annual_budget | DOUBLE | Annual budget |

### fact_ffrdc_economics
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| revenue | DOUBLE | Revenue |
| cost_of_delivery | DOUBLE | Direct costs |
| margin_pct | DOUBLE | Margin percentage |
| cost_per_fte | DOUBLE | Cost per FTE |
| headcount | INT | FTE count |
| negotiated_rate_index | DOUBLE | Rate index |
| inflation_index | DOUBLE | Inflation index |
| labor_cost_index | DOUBLE | Labor cost index |

### fact_sponsor_health
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | FK to dim_sponsor |
| month | DATE | FK to dim_date_month |
| funding_volume | DOUBLE | Total funding |
| cpi | DOUBLE | Cost Performance Index |
| utilization_pct | DOUBLE | Utilization rate |
| runway_months | INT | Contract runway |
| contract_value | DOUBLE | Contract value |
| next_renewal_date | DATE | Next renewal |
| status | STRING | Health status |

