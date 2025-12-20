# Risk & Compliance Data Contracts

## Schema: `financial-command-center`.`risk-compliance`

## Visualizations and Required Tables

### Section 1: Audit & Control Dashboard

#### 1.1 Findings Aging Chart
**Visualization**: `FindingsAgingChart` - Bar chart of findings by age bucket
**Gold Table**: `gold_findings_aging`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| age_bucket | STRING | 0-30, 31-60, 61-90, >90 |
| finding_count | INT | Number of findings |
| risk_weighted | DOUBLE | Risk-weighted count |

**Grain**: One row per age bucket per snapshot

---

#### 1.2 Root Cause Tags Chart
**Visualization**: `RootCauseTagsChart` - Pie/bar chart of findings by root cause
**Gold Table**: `gold_root_cause_tags`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| root_cause_tag | STRING | Root cause category |
| finding_count | INT | Number of findings |
| percentage | DOUBLE | Percentage of total |

**Grain**: One row per root cause per snapshot

---

#### 1.3 Control Effectiveness Chart
**Visualization**: `ControlEffectivenessChart` - Stacked bar by control domain
**Gold Table**: `gold_control_effectiveness`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| control_domain | STRING | Control category |
| effective_count | INT | Effective controls |
| needs_improvement_count | INT | Needs improvement |
| ineffective_count | INT | Ineffective controls |
| effectiveness_rate | DOUBLE | Effectiveness percentage |

**Grain**: One row per control domain per snapshot

---

#### 1.4 Revenue Recognition Schedule Chart
**Visualization**: `RevRecScheduleChart` - Stacked area showing rev rec by type
**Gold Table**: `gold_revrec_schedule`
| Column | Type | Description |
|--------|------|-------------|
| month | DATE | Month (first day) |
| cost_reimbursable | DOUBLE | Cost reimbursable amount |
| fixed_price | DOUBLE | Fixed price amount |
| time_and_materials | DOUBLE | T&M amount |
| milestone | DOUBLE | Milestone-based amount |
| total | DOUBLE | Total recognized revenue |

**Grain**: One row per month

---

#### 1.5 Compliance Calendar Table
**Visualization**: `ComplianceCalendarTable` - Upcoming compliance events
**Gold Table**: `gold_compliance_calendar`
| Column | Type | Description |
|--------|------|-------------|
| event_id | STRING | Event identifier |
| title | STRING | Event title |
| event_type | STRING | audit/filing/certification/review |
| due_date | DATE | Due date |
| sponsor | STRING | Sponsor name |
| status | STRING | upcoming/in_progress/completed/overdue |
| days_until_due | INT | Days until due |

**Grain**: One row per compliance event

---

### Section 2: Concentration Risk

#### 2.1 Top Sponsors Concentration Chart
**Visualization**: `TopSponsorsConcentrationChart` - Pareto chart of sponsor concentration
**Gold Table**: `gold_sponsor_concentration`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| sponsor_id | STRING | Sponsor identifier |
| sponsor_name | STRING | Sponsor name |
| abbreviation | STRING | Sponsor abbreviation |
| revenue_amount | DOUBLE | Revenue from sponsor |
| revenue_pct | DOUBLE | Percentage of total |
| cumulative_pct | DOUBLE | Cumulative percentage |
| yoy_change | DOUBLE | Year-over-year change |

**Grain**: One row per sponsor per snapshot

---

#### 2.2 Geographic Diversification Chart
**Visualization**: `DiversificationChart` (geographic) - Pie/donut of revenue by region
**Gold Table**: `gold_diversification_geo`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| region | STRING | Geographic region |
| revenue_amount | DOUBLE | Revenue from region |
| revenue_pct | DOUBLE | Percentage of total |

**Grain**: One row per region per snapshot

---

#### 2.3 Mission Area Diversification Chart
**Visualization**: `DiversificationChart` (mission area) - Pie/donut by capability
**Gold Table**: `gold_diversification_mission_area`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| mission_area | STRING | Mission area |
| revenue_amount | DOUBLE | Revenue from area |
| revenue_pct | DOUBLE | Percentage of total |

**Grain**: One row per mission area per snapshot

---

#### 2.4 Retention Trend Chart
**Visualization**: `RetentionTrendChart` - Bar/line chart of sponsor retention
**Gold Table**: `gold_retention_trend`
| Column | Type | Description |
|--------|------|-------------|
| year | STRING | Fiscal year |
| retained_sponsors | INT | Retained from prior year |
| new_sponsors | INT | New sponsors |
| churned_sponsors | INT | Lost sponsors |
| retention_rate | DOUBLE | Retention percentage |

**Grain**: One row per year

---

### Section 3: Talent & Capability Risk

#### 3.1 Key Person Dependency Table
**Visualization**: `KeyPersonDependencyTable` - Risk matrix of key dependencies
**Gold Table**: `gold_key_person_dependencies`
| Column | Type | Description |
|--------|------|-------------|
| dependency_id | STRING | Dependency identifier |
| capability | STRING | Critical capability |
| primary_owner | STRING | Key person name |
| backup_count | INT | Number of backups |
| has_documentation | BOOLEAN | Documentation exists |
| risk_level | STRING | low/medium/high/critical |
| ffrdc_id | STRING | FFRDC identifier |
| last_review_date | DATE | Last review |

**Grain**: One row per key person dependency

---

#### 3.2 Bench Utilization Chart
**Visualization**: `BenchUtilizationChart` - Bar chart of bench by FFRDC
**Gold Table**: `gold_bench_utilization`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC name |
| month | DATE | Month (first day) |
| total_headcount | INT | Total FTEs |
| bench_count | INT | Bench FTEs |
| bench_pct | DOUBLE | Bench percentage |
| status | STRING | healthy/attention/critical |

**Grain**: One row per FFRDC per month

---

#### 3.3 Turnover Rate Chart
**Visualization**: `TurnoverRateChart` - Line chart of turnover trends
**Gold Table**: `gold_turnover_trend`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC name |
| period | STRING | Time period (e.g., 2024-Q1) |
| turnover_rate | DOUBLE | Total turnover rate |
| voluntary_rate | DOUBLE | Voluntary turnover |
| involuntary_rate | DOUBLE | Involuntary turnover |
| industry_benchmark | DOUBLE | Industry benchmark |

**Grain**: One row per FFRDC per period

---

### Section 4: Financial Control Exceptions

#### 4.1 Control Exceptions Trend Chart
**Visualization**: `ControlExceptionsTrendChart` - Area chart of exception trends
**Gold Table**: `gold_control_exceptions_trend`
| Column | Type | Description |
|--------|------|-------------|
| month | DATE | Month (first day) |
| unusual_entries | INT | Unusual journal entries |
| failed_tests | INT | Failed control tests |
| resolved | INT | Resolved exceptions |
| net_open | INT | Net open exceptions |

**Grain**: One row per month

---

#### 4.2 Failed Audit Tests Chart
**Visualization**: `FailedAuditTestsChart` - Bar chart by control domain
**Gold Table**: `gold_failed_audit_tests`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| control_domain | STRING | Control category |
| test_count | INT | Total tests |
| failed_count | INT | Failed tests |
| pass_rate | DOUBLE | Pass rate percentage |

**Grain**: One row per control domain per snapshot

---

#### 4.3 GL Exceptions Table
**Visualization**: `GLExceptionsTable` - List of general ledger exceptions
**Gold Table**: `gold_gl_exceptions`
| Column | Type | Description |
|--------|------|-------------|
| exception_id | STRING | Exception identifier |
| exception_date | DATE | Exception date |
| description | STRING | Exception description |
| amount | DOUBLE | Dollar amount |
| account | STRING | GL account |
| ffrdc_id | STRING | FFRDC identifier |
| status | STRING | open/under_review/resolved/escalated |
| severity | STRING | low/medium/high/critical |

**Grain**: One row per exception

---

#### 4.4 Covenant Compliance Table
**Visualization**: `CovenantComplianceTable` - Financial covenant status
**Gold Table**: `gold_covenant_compliance`
| Column | Type | Description |
|--------|------|-------------|
| as_of_date | DATE | Snapshot date |
| covenant | STRING | Covenant name |
| threshold | DOUBLE | Covenant threshold |
| current_value | DOUBLE | Current value |
| status | STRING | compliant/warning/breach |
| headroom | DOUBLE | Absolute headroom |
| headroom_pct | DOUBLE | Headroom percentage |

**Grain**: One row per covenant per snapshot

---

#### 4.5 Budget Variance Root Cause Chart
**Visualization**: `BudgetVarianceRootCauseChart` - Stacked bar of variance by cause
**Gold Table**: `gold_budget_variance_root_cause`
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | FFRDC identifier |
| ffrdc_name | STRING | FFRDC name |
| month | DATE | Month (first day) |
| labor_variance | DOUBLE | Labor variance |
| material_variance | DOUBLE | Material variance |
| subcontract_variance | DOUBLE | Subcontract variance |
| overhead_variance | DOUBLE | Overhead variance |
| total_variance | DOUBLE | Total variance |

**Grain**: One row per FFRDC per month

---

## Dimension Tables

### dim_ffrdc
| Column | Type | Description |
|--------|------|-------------|
| ffrdc_id | STRING | Primary key |
| ffrdc_name | STRING | Full name |
| short_name | STRING | Abbreviation |

### dim_sponsor
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | Primary key |
| sponsor_name | STRING | Full name |
| abbreviation | STRING | Short code |

### dim_control
| Column | Type | Description |
|--------|------|-------------|
| control_id | STRING | Primary key |
| control_name | STRING | Control name |
| control_domain | STRING | Category/domain |

### dim_region
| Column | Type | Description |
|--------|------|-------------|
| region_id | STRING | Primary key |
| region_name | STRING | Region name |

### dim_covenant
| Column | Type | Description |
|--------|------|-------------|
| covenant_id | STRING | Primary key |
| covenant_name | STRING | Covenant name |
| threshold_type | STRING | min/max |
| threshold_value | DOUBLE | Threshold |

---

## Fact Tables (Silver)

### fact_audit_finding
| Column | Type | Description |
|--------|------|-------------|
| finding_id | STRING | Primary key |
| opened_date | DATE | Finding opened |
| closed_date | DATE | Finding closed (nullable) |
| age_days | INT | Current age |
| status | STRING | open/in_progress/remediated/accepted |
| risk_level | STRING | low/medium/high/critical |
| root_cause | STRING | Root cause category |
| ffrdc_id | STRING | FK to dim_ffrdc |
| assignee | STRING | Assigned person |

### fact_control_test
| Column | Type | Description |
|--------|------|-------------|
| control_id | STRING | FK to dim_control |
| test_date | DATE | Test execution date |
| passed | BOOLEAN | Pass/fail |
| effectiveness_score | DOUBLE | Effectiveness score |

### fact_revenue_concentration
| Column | Type | Description |
|--------|------|-------------|
| sponsor_id | STRING | FK to dim_sponsor |
| month | DATE | Month |
| revenue_amount | DOUBLE | Revenue from sponsor |

### fact_key_person_dependency
| Column | Type | Description |
|--------|------|-------------|
| dependency_id | STRING | Primary key |
| capability | STRING | Capability name |
| employee_id | STRING | Employee identifier |
| ffrdc_id | STRING | FK to dim_ffrdc |
| backup_count | INT | Number of backups |
| has_documentation | BOOLEAN | Documentation exists |
| risk_level | STRING | Risk level |

### fact_gl_exception
| Column | Type | Description |
|--------|------|-------------|
| exception_id | STRING | Primary key |
| exception_date | DATE | Exception date |
| account | STRING | GL account |
| amount | DOUBLE | Dollar amount |
| ffrdc_id | STRING | FK to dim_ffrdc |
| status | STRING | Exception status |
| severity | STRING | Severity level |

