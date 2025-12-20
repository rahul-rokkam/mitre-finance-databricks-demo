# Databricks notebook source
# MAGIC %md
# MAGIC # Government Relations DLT Pipeline
# MAGIC 
# MAGIC This Delta Live Tables pipeline creates all tables needed for the Government Relations dashboard.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`government-relations`
# MAGIC 
# MAGIC ## Tables Created
# MAGIC - **Dimensions**: dim_mission_area, dim_competitor, dim_fiscal_year
# MAGIC - **Facts**: fact_market_share, fact_competitor_share, fact_win_loss, fact_capability_gap, fact_pipeline
# MAGIC - **Gold**: gold_market_share_by_mission_area, gold_competitor_share, gold_win_loss_by_competitor, gold_capability_gaps, gold_pipeline_prioritization, gold_pipeline_table

# COMMAND ----------

import dlt
from pyspark.sql import functions as F
from pyspark.sql.types import *
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bronze Layer - Raw Data Ingestion

# COMMAND ----------

@dlt.table(name="raw_mission_area", comment="Raw mission area reference data")
def raw_mission_area():
    data = [
        ("defense", "Defense", "National defense and military systems"),
        ("cybersecurity", "Cybersecurity", "Cyber defense and information security"),
        ("health", "Health", "Healthcare systems and public health"),
        ("aviation", "Aviation", "Aviation safety and air traffic systems"),
        ("climate", "Climate", "Climate research and environmental systems"),
        ("homeland", "Homeland Security", "Border security and emergency management"),
        ("intelligence", "Intelligence", "Intelligence community support"),
    ]
    schema = StructType([
        StructField("mission_area_id", StringType(), False),
        StructField("mission_area_name", StringType(), False),
        StructField("description", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_competitor", comment="Raw competitor reference data")
def raw_competitor():
    data = [
        ("aerospace", "Aerospace Corporation", "Aerospace", "FFRDC"),
        ("ida", "Institute for Defense Analyses", "IDA", "FFRDC"),
        ("rand", "RAND Corporation", "RAND", "FFRDC"),
        ("sei", "Software Engineering Institute", "SEI", "FFRDC"),
        ("apl", "Johns Hopkins APL", "APL", "UARC"),
        ("lincoln", "MIT Lincoln Laboratory", "Lincoln", "FFRDC"),
        ("sandia", "Sandia National Laboratories", "Sandia", "FFRDC"),
        ("booz", "Booz Allen Hamilton", "BAH", "Industry"),
        ("leidos", "Leidos", "Leidos", "Industry"),
        ("saic", "SAIC", "SAIC", "Industry"),
    ]
    schema = StructType([
        StructField("competitor_id", StringType(), False),
        StructField("competitor_name", StringType(), False),
        StructField("abbreviation", StringType(), False),
        StructField("competitor_type", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_fiscal_year", comment="Fiscal year dimension")
def raw_fiscal_year():
    data = [
        ("FY23", date(2022, 10, 1), date(2023, 9, 30)),
        ("FY24", date(2023, 10, 1), date(2024, 9, 30)),
        ("FY25", date(2024, 10, 1), date(2025, 9, 30)),
        ("FY26", date(2025, 10, 1), date(2026, 9, 30)),
    ]
    schema = StructType([
        StructField("fiscal_year", StringType(), False),
        StructField("start_date", DateType(), False),
        StructField("end_date", DateType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_market_share", comment="Raw market share by mission area")
def raw_market_share():
    import random
    random.seed(80)
    
    mission_areas = [
        ("defense", "Defense", 2_500_000_000),
        ("cybersecurity", "Cybersecurity", 1_800_000_000),
        ("health", "Health", 1_200_000_000),
        ("aviation", "Aviation", 950_000_000),
        ("climate", "Climate", 600_000_000),
        ("homeland", "Homeland Security", 850_000_000),
        ("intelligence", "Intelligence", 1_100_000_000),
    ]
    
    data = []
    for area_id, area_name, tam in mission_areas:
        for fy in ["FY24", "FY25"]:
            mitre_share = random.uniform(8, 22)
            mitre_revenue = tam * (mitre_share / 100)
            tam_growth = random.uniform(-2, 8)
            mitre_growth = random.uniform(-3, 12)
            
            data.append((
                area_id, area_name, fy,
                float(tam), float(mitre_share), float(mitre_revenue),
                float(tam_growth), float(mitre_growth)
            ))
    
    schema = StructType([
        StructField("mission_area_id", StringType(), False),
        StructField("mission_area_name", StringType(), False),
        StructField("fiscal_year", StringType(), False),
        StructField("total_available_market", DoubleType(), False),
        StructField("mitre_share_pct", DoubleType(), False),
        StructField("mitre_revenue", DoubleType(), False),
        StructField("growth_trajectory", DoubleType(), False),
        StructField("mitre_growth_trajectory", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_competitor_share", comment="Raw competitor market share")
def raw_competitor_share():
    import random
    random.seed(81)
    
    mission_areas = ["defense", "cybersecurity", "health", "aviation", "homeland"]
    competitors = ["aerospace", "ida", "rand", "sei", "apl", "lincoln"]
    
    data = []
    for area in mission_areas:
        for comp in random.sample(competitors, 4):
            share = random.uniform(3, 18)
            for fy in ["FY24", "FY25"]:
                data.append((area, fy, comp, f"{comp.upper()}", f"{comp.title()}", float(share * random.uniform(0.9, 1.1))))
    
    schema = StructType([
        StructField("mission_area_id", StringType(), False),
        StructField("fiscal_year", StringType(), False),
        StructField("competitor_id", StringType(), False),
        StructField("competitor_abbreviation", StringType(), False),
        StructField("competitor_name", StringType(), False),
        StructField("share_pct", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_win_loss", comment="Raw win/loss records vs competitors")
def raw_win_loss():
    import random
    random.seed(82)
    
    competitors = [
        ("aerospace", "Aerospace Corporation", "Aerospace", "FFRDC"),
        ("ida", "IDA", "IDA", "FFRDC"),
        ("rand", "RAND", "RAND", "FFRDC"),
        ("apl", "Johns Hopkins APL", "APL", "UARC"),
        ("booz", "Booz Allen", "BAH", "Industry"),
        ("leidos", "Leidos", "Leidos", "Industry"),
    ]
    
    data = []
    for comp_id, comp_name, abbrev, comp_type in competitors:
        wins = random.randint(8, 25)
        losses = random.randint(5, 18)
        total = wins + losses
        net = wins - losses
        win_rate = wins / total * 100
        trend = random.choice(["improving", "stable", "declining"])
        
        for fy in ["FY24", "FY25"]:
            data.append((
                comp_id, comp_name, abbrev, comp_type, fy,
                wins + random.randint(-3, 3),
                losses + random.randint(-2, 2),
                net,
                float(win_rate + random.uniform(-5, 5)),
                total,
                trend
            ))
    
    schema = StructType([
        StructField("competitor_id", StringType(), False),
        StructField("competitor_name", StringType(), False),
        StructField("competitor_abbreviation", StringType(), False),
        StructField("competitor_type", StringType(), False),
        StructField("fiscal_year", StringType(), False),
        StructField("wins", IntegerType(), False),
        StructField("losses", IntegerType(), False),
        StructField("net_wins", IntegerType(), False),
        StructField("win_rate", DoubleType(), False),
        StructField("total_opportunities", IntegerType(), False),
        StructField("recent_trend", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_capability_gap", comment="Raw capability gaps")
def raw_capability_gap():
    import random
    random.seed(83)
    
    gaps = [
        ("gap-1", "Quantum Computing", "Limited quantum algorithm expertise", ["Defense", "Intelligence"]),
        ("gap-2", "AI/ML Operations", "Need MLOps and AI governance capabilities", ["Cybersecurity", "Health"]),
        ("gap-3", "Space Systems", "Space domain awareness expertise", ["Defense", "Intelligence"]),
        ("gap-4", "5G/6G Security", "Advanced wireless security research", ["Cybersecurity", "Homeland Security"]),
        ("gap-5", "Climate Modeling", "High-fidelity climate simulation", ["Climate", "Aviation"]),
    ]
    
    severities = ["critical", "high", "medium", "low"]
    statuses = ["identified", "addressing", "resolved"]
    today = date.today()
    
    data = []
    for gap_id, capability, description, areas in gaps:
        data.append((
            gap_id,
            capability,
            description,
            areas,
            random.choice(severities),
            random.choice(statuses),
            random.randint(2, 8),
            float(random.uniform(10_000_000, 100_000_000)),
            today - relativedelta(months=random.randint(1, 12)),
            today + relativedelta(months=random.randint(6, 24)) if random.random() > 0.3 else None
        ))
    
    schema = StructType([
        StructField("gap_id", StringType(), False),
        StructField("capability", StringType(), False),
        StructField("description", StringType(), False),
        StructField("mission_areas", ArrayType(StringType()), False),
        StructField("severity", StringType(), False),
        StructField("status", StringType(), False),
        StructField("sponsor_demand", IntegerType(), False),
        StructField("estimated_impact", DoubleType(), False),
        StructField("identified_date", DateType(), False),
        StructField("target_resolution_date", DateType(), True),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_pipeline", comment="Raw strategic pipeline")
def raw_pipeline():
    import random
    random.seed(84)
    
    items = [
        ("pipe-1", "TechCo Acquisition", "Acquisition", "Quantum computing startup", "Quantum Computing"),
        ("pipe-2", "University Partnership", "Partnership", "AI research collaboration", "AI/ML Operations"),
        ("pipe-3", "Space Venture", "Investment", "Space domain awareness tech", "Space Systems"),
        ("pipe-4", "Cyber Firm Acquisition", "Acquisition", "5G security specialists", "5G/6G Security"),
        ("pipe-5", "Climate Research Partnership", "Partnership", "Climate modeling consortium", "Climate Modeling"),
        ("pipe-6", "Defense Analytics", "Acquisition", "Defense data analytics", "Data Analytics"),
    ]
    
    stages = ["Sourcing", "Screening", "Due Diligence", "Negotiation"]
    confidence = ["high", "medium", "low"]
    today = date.today()
    
    data = []
    for item_id, name, item_type, desc, gap in items:
        areas = random.sample(["Defense", "Cybersecurity", "Health", "Aviation", "Intelligence"], random.randint(1, 3))
        
        data.append((
            item_id,
            name,
            item_type,
            desc,
            gap,
            areas,
            random.choice(stages),
            random.choice(confidence),
            float(random.uniform(20_000_000, 150_000_000)),
            float(random.uniform(5, 10)),
            float(random.uniform(10_000_000, 80_000_000)),
            float(random.uniform(3, 9)),
            today + relativedelta(months=random.randint(3, 18)) if random.random() > 0.2 else None,
            f"Owner {random.randint(1, 5)}",
            today - relativedelta(days=random.randint(1, 30)),
            f"Pipeline notes for {name}"
        ))
    
    schema = StructType([
        StructField("item_id", StringType(), False),
        StructField("name", StringType(), False),
        StructField("item_type", StringType(), False),
        StructField("description", StringType(), False),
        StructField("capability_gap_addressed", StringType(), False),
        StructField("mission_areas", ArrayType(StringType()), False),
        StructField("stage", StringType(), False),
        StructField("confidence_level", StringType(), False),
        StructField("estimated_impact", DoubleType(), False),
        StructField("strategic_value", DoubleType(), False),
        StructField("estimated_cost", DoubleType(), False),
        StructField("complexity", DoubleType(), False),
        StructField("expected_close_date", DateType(), True),
        StructField("lead_owner", StringType(), False),
        StructField("last_updated", DateType(), False),
        StructField("notes", StringType(), True),
    ])
    return spark.createDataFrame(data, schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Dimension and Fact Tables

# COMMAND ----------

@dlt.table(name="dim_mission_area", comment="Mission area dimension")
@dlt.expect_or_fail("valid_id", "mission_area_id IS NOT NULL")
def dim_mission_area():
    return dlt.read("raw_mission_area")


@dlt.table(name="dim_competitor", comment="Competitor dimension")
@dlt.expect_or_fail("valid_id", "competitor_id IS NOT NULL")
def dim_competitor():
    return dlt.read("raw_competitor")


@dlt.table(name="dim_fiscal_year", comment="Fiscal year dimension")
def dim_fiscal_year():
    return dlt.read("raw_fiscal_year")


@dlt.table(name="fact_market_share", comment="Market share by mission area")
@dlt.expect("valid_share", "mitre_share_pct >= 0 AND mitre_share_pct <= 100")
def fact_market_share():
    return dlt.read("raw_market_share")


@dlt.table(name="fact_competitor_share", comment="Competitor market share")
@dlt.expect("valid_share", "share_pct >= 0 AND share_pct <= 100")
def fact_competitor_share():
    return dlt.read("raw_competitor_share")


@dlt.table(name="fact_win_loss", comment="Win/loss records")
@dlt.expect("valid_rate", "win_rate >= 0 AND win_rate <= 100")
def fact_win_loss():
    return dlt.read("raw_win_loss")


@dlt.table(name="fact_capability_gap", comment="Capability gaps")
@dlt.expect_or_fail("valid_gap_id", "gap_id IS NOT NULL")
def fact_capability_gap():
    return dlt.read("raw_capability_gap")


@dlt.table(name="fact_pipeline", comment="Strategic pipeline")
@dlt.expect_or_fail("valid_item_id", "item_id IS NOT NULL")
@dlt.expect("valid_strategic_value", "strategic_value >= 1 AND strategic_value <= 10")
def fact_pipeline():
    return dlt.read("raw_pipeline")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gold Layer - Visualization Marts

# COMMAND ----------

@dlt.table(name="gold_market_share_by_mission_area", comment="Market share by mission area - powers MarketShareByMissionAreaChart")
def gold_market_share_by_mission_area():
    return dlt.read("fact_market_share")


@dlt.table(name="gold_competitor_share", comment="Competitor share detail - sub-table of market share")
def gold_competitor_share():
    return dlt.read("fact_competitor_share")


@dlt.table(name="gold_win_loss_by_competitor", comment="Win/loss by competitor - powers WinLossByCompetitorChart")
def gold_win_loss_by_competitor():
    return dlt.read("fact_win_loss")


@dlt.table(name="gold_capability_gaps", comment="Capability gaps - powers CapabilityGapsTable")
def gold_capability_gaps():
    return dlt.read("fact_capability_gap")


@dlt.table(name="gold_pipeline_prioritization", comment="Pipeline prioritization - powers PipelinePrioritizationScatter")
def gold_pipeline_prioritization():
    pipeline = dlt.read("fact_pipeline")
    
    return (
        pipeline
        .select(
            "item_id",
            "name",
            "item_type",
            "stage",
            "strategic_value",
            "complexity",
            "estimated_impact",
            "confidence_level"
        )
    )


@dlt.table(name="gold_pipeline_table", comment="Full pipeline table - powers PipelineTable")
def gold_pipeline_table():
    return dlt.read("fact_pipeline")

