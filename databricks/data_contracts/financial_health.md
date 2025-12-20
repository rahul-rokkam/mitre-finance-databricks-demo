# Financial Health Data Contracts

## Schema: `financial-command-center`.`financial-health`

## Visualizations and Required Tables

### 1. KPI Cards
**Visualization**: Summary KPI cards (YTD Revenue, Gross Margin %, Headcount, etc.)
**Gold Table**: `gold_kpi_summary`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| kpi_id | STRING | KPI identifier |
| kpi_label | STRING | Display label |
| value | DOUBLE | Current value |
| unit | STRING | currency/percent/days/count/ratio |
| delta | DOUBLE | Change from prior period |
| delta_label | STRING | Description of delta period |
| status | STRING | green/yellow/red |
| sparkline_data | ARRAY<DOUBLE> | Mini trend data |

---

### 2. Revenue vs Budget Chart
**Visualization**: `RevenueVsBudgetChart` - Bar chart comparing actual vs budget by FFRDC
**Gold Table**: `gold_revenue_vs_budget`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| actual_revenue | DOUBLE | Actual revenue amount |
| budget_amount | DOUBLE | Budgeted amount |
| variance | DOUBLE | Actual - Budget |
| variance_pct | DOUBLE | Variance as percentage |

**Grain**: One row per FFRDC per month

---

### 3. Gross Margin Trend Chart
**Visualization**: `GrossMarginChart` - Line chart showing margin trends by FFRDC
**Gold Table**: `gold_gross_margin_trend`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| gross_margin_pct | DOUBLE | Gross margin percentage |
| current_margin | DOUBLE | Current period margin |
| prior_margin | DOUBLE | Prior period margin |
| change_pct | DOUBLE | Period-over-period change |

**Grain**: One row per FFRDC per month

---

### 4. Operating Expense Ratio Chart
**Visualization**: `OpexRatioChart` - Area chart showing opex trend
**Gold Table**: `gold_opex_trend`
| Column | Type | Description |
|--------|------|-------------|
| month | DATE | Month (first day) |
| actual_opex | DOUBLE | Actual operating expenses |
| budget_opex | DOUBLE | Budgeted operating expenses |
| opex_ratio_pct | DOUBLE | Opex as % of revenue |

**Grain**: One row per month (aggregated across FFRDCs)

---

### 5. Headcount & Utilization Chart
**Visualization**: `HeadcountUtilChart` - Bar chart showing headcount and utilization by FFRDC
**Gold Table**: `gold_headcount_utilization`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| headcount | INT | Total headcount |
| utilization_pct | DOUBLE | Utilization percentage |
| billable_hours | DOUBLE | Billable hours |
| total_hours | DOUBLE | Total available hours |

**Grain**: One row per FFRDC per month

---

### 6. Indirect Rate Chart
**Visualization**: `IndirectRateChart` - Bar chart comparing actual vs cap rates by FFRDC
**Gold Table**: `gold_indirect_rate`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| actual_rate | DOUBLE | Actual indirect rate |
| cap_rate | DOUBLE | Negotiated cap rate |
| variance | DOUBLE | Actual - Cap |

**Grain**: One row per FFRDC per month

---

### 7. Aging Table (Cash & Working Capital)
**Visualization**: `AgingTable` - Table showing AR/AP aging buckets
**Gold Table**: `gold_cash_position`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| cash_balance | DOUBLE | Total cash balance |
| working_capital | DOUBLE | Working capital |
| dso | INT | Days sales outstanding |
| dpo | INT | Days payable outstanding |

**Gold Table**: `gold_aging_buckets`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| aging_bucket | STRING | Bucket label (0-30, 31-60, etc.) |
| ar_amount | DOUBLE | Accounts receivable |
| ap_amount | DOUBLE | Accounts payable |
| net_amount | DOUBLE | AR - AP |

**Grain**: One row per aging bucket per snapshot date

---

### 8. Signals List
**Visualization**: `SignalsList` - List of governance signals/alerts
**Gold Table**: `gold_signals`
| Column | Type | Description |
|--------|------|-------------|
| signal_id | STRING | Signal identifier |
| as_of_date | DATE | Signal date |
| signal_type | STRING | warning/critical/info |
| message | STRING | Signal message |
| kpi_id | STRING | Related KPI |
| ffrdc_id | STRING | Related FFRDC (nullable) |
| value | DOUBLE | Metric value (nullable) |
| threshold | DOUBLE | Threshold breached (nullable) |

**Grain**: One row per signal

---

## Dimension Tables

### dim_ffrdc
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | Primary key |
| ffrdc_name | STRING | Full name |
| short_name | STRING | Abbreviation |

### dim_date_month
| Column | Type | Description |
|--------|------|-------------|
| month | DATE | First day of month (PK) |
| year | INT | Calendar year |
| quarter | INT | Calendar quarter (1-4) |
| month_num | INT | Month number (1-12) |
| month_name | STRING | Month name |
| fiscal_year | STRING | Fiscal year (e.g., FY25) |
| fiscal_quarter | INT | Fiscal quarter |

---

## Fact Tables (Silver)

### fact_finance_monthly
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| revenue | DOUBLE | Revenue amount |
| cost_of_delivery | DOUBLE | Direct costs |
| gross_margin | DOUBLE | Revenue - Cost |
| gross_margin_pct | DOUBLE | Margin percentage |
| opex | DOUBLE | Operating expenses |
| headcount | INT | FTE count |
| utilization_pct | DOUBLE | Utilization rate |
| billable_hours | DOUBLE | Billable hours |
| total_hours | DOUBLE | Total hours |

### fact_budget_monthly
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| budget_amount | DOUBLE | Budgeted revenue/spend |
| budget_type | STRING | revenue/opex/capex |

### fact_indirect_rate
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| actual_rate | DOUBLE | Actual indirect rate |
| cap_rate | DOUBLE | Negotiated cap rate |

### fact_cash_metrics
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| cash_balance | DOUBLE | Cash balance |
| working_capital | DOUBLE | Working capital |
| dso | INT | Days sales outstanding |
| dpo | INT | Days payable outstanding |

### fact_ar_ap_aging
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| aging_bucket | STRING | Bucket label |
| ar_amount | DOUBLE | AR balance |
| ap_amount | DOUBLE | AP balance |

