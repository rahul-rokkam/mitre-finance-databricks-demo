# Government Relations Data Contracts

## Schema: `financial-command-center`.`government-relations`

## Visualizations and Required Tables

### 1. Market Share by Mission Area Chart
**Visualization**: `MarketShareByMissionAreaChart` - Bar/grouped bar of market share
**Gold Table**: `gold_market_share_by_mission_area`
| Column | Type | Description |
|--------|------|-------------|
| mission_area_id | STRING | Mission area identifier |
| mission_area_name | STRING | Mission area name |
| fiscal_year | STRING | Fiscal year (e.g., FY25) |
| total_available_market | DOUBLE | TAM in dollars |
| mitre_share_pct | DOUBLE | MITRE's market share % |
| mitre_revenue | DOUBLE | MITRE revenue in area |
| growth_trajectory | DOUBLE | YoY TAM growth % |
| mitre_growth_trajectory | DOUBLE | YoY MITRE growth % |

**Grain**: One row per mission area per fiscal year

---

### 2. Competitor Share Detail (sub-table of market share)
**Gold Table**: `gold_competitor_share`
| Column | Type | Description |
|--------|------|-------------|
| mission_area_id | STRING | Mission area identifier |
| fiscal_year | STRING | Fiscal year |
| competitor_id | STRING | Competitor identifier |
| competitor_name | STRING | Competitor name |
| competitor_abbreviation | STRING | Competitor short code |
| share_pct | DOUBLE | Market share percentage |

**Grain**: One row per mission area-competitor pair per year

---

### 3. Win/Loss by Competitor Chart
**Visualization**: `WinLossByCompetitorChart` - Bar chart of wins/losses vs competitors
**Gold Table**: `gold_win_loss_by_competitor`
| Column | Type | Description |
|--------|------|-------------|
| competitor_id | STRING | Competitor identifier |
| competitor_name | STRING | Competitor name |
| competitor_abbreviation | STRING | Competitor short code |
| competitor_type | STRING | FFRDC/UARC/Industry |
| fiscal_year | STRING | Fiscal year |
| wins | INT | Number of wins |
| losses | INT | Number of losses |
| net_wins | INT | Wins - Losses |
| win_rate | DOUBLE | Win rate percentage |
| total_opportunities | INT | Total head-to-head |
| recent_trend | STRING | improving/stable/declining |

**Grain**: One row per competitor per fiscal year

---

### 4. Capability Gaps Table
**Visualization**: `CapabilityGapsTable` - Table of capability gaps
**Gold Table**: `gold_capability_gaps`
| Column | Type | Description |
|--------|------|-------------|
| gap_id | STRING | Gap identifier |
| capability | STRING | Capability name |
| description | STRING | Gap description |
| mission_areas | ARRAY<STRING> | Affected mission areas |
| severity | STRING | critical/high/medium/low |
| status | STRING | identified/addressing/resolved |
| sponsor_demand | INT | Number of sponsors requesting |
| estimated_impact | DOUBLE | Opportunity if filled |
| identified_date | DATE | When gap was identified |
| target_resolution_date | DATE | Target resolution (nullable) |

**Grain**: One row per capability gap

---

### 5. Pipeline Prioritization Scatter
**Visualization**: `PipelinePrioritizationScatter` - Bubble chart of pipeline items
**Gold Table**: `gold_pipeline_prioritization`
| Column | Type | Description |
|--------|------|-------------|
| item_id | STRING | Pipeline item identifier |
| name | STRING | Item name |
| item_type | STRING | Acquisition/Partnership/Investment |
| stage | STRING | Sourcing/Screening/Due Diligence/Negotiation |
| strategic_value | DOUBLE | Strategic value (1-10) |
| complexity | DOUBLE | Complexity (1-10) |
| estimated_impact | DOUBLE | Revenue impact (bubble size) |
| confidence_level | STRING | high/medium/low |

**Grain**: One row per pipeline item

---

### 6. Pipeline Table
**Visualization**: `PipelineTable` - Detailed pipeline list
**Gold Table**: `gold_pipeline_table`
| Column | Type | Description |
|--------|------|-------------|
| item_id | STRING | Pipeline item identifier |
| name | STRING | Item name |
| item_type | STRING | Acquisition/Partnership/Investment |
| description | STRING | Item description |
| capability_gap_addressed | STRING | Gap being addressed |
| mission_areas | ARRAY<STRING> | Mission areas impacted |
| stage | STRING | Current stage |
| confidence_level | STRING | Confidence level |
| estimated_impact | DOUBLE | Revenue impact |
| strategic_value | DOUBLE | Strategic value score |
| estimated_cost | DOUBLE | Cost to acquire/invest |
| complexity | DOUBLE | Complexity score |
| expected_close_date | DATE | Expected close (nullable) |
| lead_owner | STRING | Owner name |
| last_updated | DATE | Last update date |
| notes | STRING | Additional notes |

**Grain**: One row per pipeline item

---

## Dimension Tables

### dim_mission_area
| Column | Type | Description |
|--------|------|-------------|
| mission_area_id | STRING | Primary key |
| mission_area_name | STRING | Name |
| description | STRING | Description |

### dim_competitor
| Column | Type | Description |
|--------|------|-------------|
| competitor_id | STRING | Primary key |
| competitor_name | STRING | Full name |
| abbreviation | STRING | Short code |
| competitor_type | STRING | FFRDC/UARC/Industry |

### dim_fiscal_year
| Column | Type | Description |
|--------|------|-------------|
| fiscal_year | STRING | Primary key (e.g., FY25) |
| start_date | DATE | FY start date |
| end_date | DATE | FY end date |

---

## Fact Tables (Silver)

### fact_market_share
| Column | Type | Description |
|--------|------|-------------|
| mission_area_id | STRING | FK to dim_mission_area |
| fiscal_year | STRING | FK to dim_fiscal_year |
| total_available_market | DOUBLE | TAM in dollars |
| mitre_share_pct | DOUBLE | MITRE market share |
| mitre_revenue | DOUBLE | MITRE revenue |
| growth_trajectory | DOUBLE | YoY TAM growth |
| mitre_growth_trajectory | DOUBLE | YoY MITRE growth |

### fact_competitor_share
| Column | Type | Description |
|--------|------|-------------|
| mission_area_id | STRING | FK to dim_mission_area |
| competitor_id | STRING | FK to dim_competitor |
| fiscal_year | STRING | FK to dim_fiscal_year |
| share_pct | DOUBLE | Market share percentage |

### fact_win_loss
| Column | Type | Description |
|--------|------|-------------|
| opportunity_id | STRING | Opportunity identifier |
| competitor_id | STRING | FK to dim_competitor |
| mission_area_id | STRING | FK to dim_mission_area |
| fiscal_year | STRING | FK to dim_fiscal_year |
| outcome | STRING | win/loss |
| opportunity_value | DOUBLE | Dollar value |

### fact_capability_gap
| Column | Type | Description |
|--------|------|-------------|
| gap_id | STRING | Primary key |
| capability | STRING | Capability name |
| description | STRING | Gap description |
| severity | STRING | Severity level |
| status | STRING | Current status |
| sponsor_demand | INT | Sponsor count |
| estimated_impact | DOUBLE | Opportunity value |
| identified_date | DATE | Identification date |
| target_resolution_date | DATE | Target date |

### fact_pipeline
| Column | Type | Description |
|--------|------|-------------|
| item_id | STRING | Primary key |
| name | STRING | Item name |
| item_type | STRING | Type |
| capability_gap_addressed | STRING | Gap ID |
| stage | STRING | Current stage |
| confidence_level | STRING | Confidence |
| estimated_impact | DOUBLE | Revenue impact |
| strategic_value | DOUBLE | Strategic score |
| estimated_cost | DOUBLE | Cost |
| complexity | DOUBLE | Complexity score |
| expected_close_date | DATE | Expected close |
| lead_owner | STRING | Owner |
| last_updated | DATE | Last update |

