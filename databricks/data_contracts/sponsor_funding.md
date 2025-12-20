# Sponsor Funding & Cost Stewardship Data Contracts

## Schema: `financial-command-center`.`sponsor-funding`

## Visualizations and Required Tables

### 1. Stewardship Scorecard Table
**Visualization**: `StewardshipScorecardTable` - Detailed scorecard by sponsor
**Gold Table**: `gold_stewardship_scorecard`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| sponsor_abbreviation | STRING | Sponsor abbreviation |
| month | DATE | Month (first day) |
| cpi | DOUBLE | Cost Performance Index |
| actual_spend | DOUBLE | Actual spending |
| estimated_spend | DOUBLE | Planned spending |
| overhead_ratio | DOUBLE | Overhead percentage |
| indirect_rate_current | DOUBLE | Current indirect rate |
| indirect_rate_cap | DOUBLE | Rate cap |
| billable_utilization_pct | DOUBLE | Billable utilization |
| status | STRING | excellent/good/attention/critical |

**Grain**: One row per sponsor per month

---

### 2. CPI Distribution Chart
**Visualization**: `CpiDistributionChart` - Histogram of CPI values by sponsor
**Gold Table**: `gold_cpi_distribution`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| cpi | DOUBLE | Cost Performance Index |
| cpi_bucket | STRING | Bucket label (<0.9, 0.9-1.0, 1.0-1.1, >1.1) |

**Grain**: One row per sponsor per month

---

### 3. Utilization Chart
**Visualization**: `UtilizationChart` - Bar chart of billable utilization by sponsor
**Gold Table**: `gold_utilization`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| ffrdc_id | STRING | FFRDC identifier |
| month | DATE | Month (first day) |
| billable_utilization_pct | DOUBLE | Utilization percentage |

**Grain**: One row per sponsor-FFRDC pair per month

---

### 4. Overhead by FFRDC Chart
**Visualization**: `OverheadByFfrdcChart` - Bar chart comparing overhead ratios
**Gold Table**: `gold_overhead_by_ffrdc`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| overhead_ratio | DOUBLE | Overhead percentage |
| target_ratio | DOUBLE | Target overhead |

**Grain**: One row per FFRDC per month

---

### 5. Indirect Rate Trend Chart
**Visualization**: `IndirectRateTrendChart` - Line chart of indirect rate trends
**Gold Table**: `gold_indirect_rate_trend`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| month | DATE | Month (first day) |
| actual_rate | DOUBLE | Actual indirect rate |
| negotiated_cap | DOUBLE | Negotiated cap rate |

**Grain**: One row per sponsor per month

---

### 6. Cost Per FTE by FFRDC Chart
**Visualization**: `CostPerFteByFfrdcChart` - Bar chart comparing cost/FTE
**Gold Table**: `gold_cost_per_fte_by_ffrdc`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| cost_per_tech_fte | DOUBLE | Cost per technical FTE |
| industry_benchmark | DOUBLE | Industry benchmark |

**Grain**: One row per FFRDC per month

---

### 7. Bench Trend Chart
**Visualization**: `BenchTrendChart` - Line chart of bench percentage trend
**Gold Table**: `gold_bench_trend`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| bench_pct | DOUBLE | Bench percentage |

**Grain**: One row per FFRDC per month

---

### 8. Headcount vs Demand Chart
**Visualization**: `HeadcountVsDemandChart` - Dual-axis chart comparing headcount to demand
**Gold Table**: `gold_headcount_vs_demand`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC display name |
| month | DATE | Month (first day) |
| headcount | INT | Current headcount |
| demand | INT | Demand (required FTEs) |
| gap | INT | Headcount - Demand |

**Grain**: One row per FFRDC per month

---

### 9. Sponsor Health Table
**Visualization**: `SponsorHealthTable` - Multi-metric health dashboard
**Gold Table**: `gold_sponsor_health`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| defect_rate | DOUBLE | Defect rate percentage |
| rework_pct | DOUBLE | Rework percentage |
| on_time_delivery_pct | DOUBLE | On-time delivery rate |
| budget_variance_pct | DOUBLE | Budget variance |
| nps_score | DOUBLE | NPS score (-100 to 100) |
| health_score | DOUBLE | Composite health (0-100) |
| status | STRING | healthy/attention/critical |

**Grain**: One row per sponsor per month

---

### 10. NPS Trend Chart
**Visualization**: `NpsTrendChart` - Line chart of NPS scores over time
**Gold Table**: `gold_nps_trend`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| nps_score | DOUBLE | NPS score |

**Grain**: One row per sponsor per month

---

### 11. Quality Metrics Chart
**Visualization**: `QualityMetricsChart` - Multi-metric quality indicators
**Gold Table**: `gold_quality_metrics`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| month | DATE | Month (first day) |
| on_time_pct | DOUBLE | On-time delivery percentage |
| defect_rate | DOUBLE | Defect rate |
| rework_pct | DOUBLE | Rework percentage |

**Grain**: One row per sponsor per month

---

### 12. Renewals Table
**Visualization**: `RenewalsTable` - Contract renewal calendar
**Gold Table**: `gold_renewals_calendar`
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor display name |
| sponsor_abbreviation | STRING | Sponsor abbreviation |
| renewal_date | DATE | Contract renewal date |
| contract_value | DOUBLE | Contract value |
| annual_run_rate | DOUBLE | Annual run rate |
| nps_score | DOUBLE | Current NPS |
| health_status | STRING | healthy/attention/critical |
| risk_notes | STRING | Risk description |
| days_until_renewal | INT | Days until renewal |

**Grain**: One row per renewal event

---

## Dimension Tables

### dim_sponsor
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Primary key |
| sponsor_name | STRING | Full name |
| abbreviation | STRING | Short code |
| agency_group | STRING | Agency grouping |

### dim_ffrdc
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | Primary key |
| ffrdc_name | STRING | Full name |
| short_name | STRING | Abbreviation |

---

## Fact Tables (Silver)

### fact_cost_stewardship
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | FK to dim_sponsor |
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| cpi | DOUBLE | Cost Performance Index |
| actual_spend | DOUBLE | Actual spending |
| estimated_spend | DOUBLE | Planned spending |
| overhead_ratio | DOUBLE | Overhead percentage |
| indirect_rate | DOUBLE | Indirect rate |
| indirect_rate_cap | DOUBLE | Rate cap |
| billable_util_pct | DOUBLE | Billable utilization |

### fact_efficiency
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FK to dim_ffrdc |
| month | DATE | FK to dim_date_month |
| cost_per_fte | DOUBLE | Cost per FTE |
| industry_benchmark | DOUBLE | Benchmark cost |
| bench_pct | DOUBLE | Bench percentage |
| headcount | INT | Current headcount |
| demand | INT | Demand FTEs |

### fact_sponsor_experience
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | FK to dim_sponsor |
| month | DATE | FK to dim_date_month |
| defect_rate | DOUBLE | Defect rate |
| rework_pct | DOUBLE | Rework percentage |
| on_time_delivery_pct | DOUBLE | On-time delivery |
| budget_variance_pct | DOUBLE | Budget variance |
| nps_score | DOUBLE | NPS score |
| health_score | DOUBLE | Composite health |

### fact_contract_renewal
| Column | Type | Description |
|--------|------|-------------|
| contract_id | STRING | Contract identifier |
| sponsor_id | STRING | FK to dim_sponsor |
| renewal_date | DATE | Renewal date |
| contract_value | DOUBLE | Contract value |
| annual_run_rate | DOUBLE | Annual run rate |
| risk_notes | STRING | Risk description |

