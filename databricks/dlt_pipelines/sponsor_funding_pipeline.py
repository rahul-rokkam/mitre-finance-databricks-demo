# Databricks notebook source
# MAGIC %md
# MAGIC # Sponsor Funding & Cost Stewardship DLT Pipeline
# MAGIC 
# MAGIC This Delta Live Tables pipeline creates all tables needed for the Sponsor Funding dashboard.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`sponsor-funding`
# MAGIC 
# MAGIC ## Tables Created
# MAGIC - **Facts**: fact_cost_stewardship, fact_efficiency, fact_sponsor_experience, fact_contract_renewal
# MAGIC - **Gold**: gold_stewardship_scorecard, gold_cpi_distribution, gold_utilization, gold_overhead_by_ffrdc, gold_indirect_rate_trend, gold_cost_per_fte_by_ffrdc, gold_bench_trend, gold_headcount_vs_demand, gold_sponsor_health, gold_nps_trend, gold_quality_metrics, gold_renewals_calendar

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

@dlt.table(
    name="raw_sponsor",
    comment="Raw sponsor reference data"
)
def raw_sponsor():
    """Ingest sponsor master data."""
    data = [
        ("dod", "Department of Defense", "DoD", "Defense"),
        ("dhs", "Department of Homeland Security", "DHS", "Homeland Security"),
        ("hhs", "Department of Health and Human Services", "HHS", "Health"),
        ("dot", "Department of Transportation", "DOT", "Transportation"),
        ("treasury", "Department of Treasury", "Treasury", "Finance"),
        ("ssa", "Social Security Administration", "SSA", "Social Services"),
    ]
    schema = StructType([
        StructField("sponsor_id", StringType(), False),
        StructField("sponsor_name", StringType(), False),
        StructField("abbreviation", StringType(), False),
        StructField("agency_group", StringType(), True),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_ffrdc",
    comment="Raw FFRDC reference data"
)
def raw_ffrdc():
    """Ingest FFRDC master data."""
    data = [
        ("cisa", "CISA Research Center", "CISA"),
        ("cms", "CMS Health Innovation Center", "CMS"),
        ("dhs", "DHS Science & Technology Center", "DHS"),
        ("dod", "DoD Systems Engineering Center", "DoD"),
        ("faa", "FAA Aviation Safety Center", "FAA"),
        ("irs", "IRS Tax Administration Center", "IRS"),
    ]
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("ffrdc_name", StringType(), False),
        StructField("short_name", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_cost_stewardship",
    comment="Raw cost stewardship metrics by sponsor"
)
def raw_cost_stewardship():
    """Ingest stewardship data."""
    import random
    random.seed(50)
    
    sponsors = ["dod", "dhs", "hhs", "dot", "treasury", "ssa"]
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for sponsor in sponsors:
        for month in months:
            actual_spend = random.uniform(5_000_000, 50_000_000)
            est_spend = actual_spend * random.uniform(0.9, 1.1)
            cpi = est_spend / actual_spend
            overhead = random.uniform(15, 28)
            indirect = random.uniform(0.32, 0.48)
            indirect_cap = indirect * random.uniform(1.0, 1.15)
            util = random.uniform(72, 92)
            
            if cpi < 0.95:
                status = "critical"
            elif cpi < 1.0:
                status = "attention"
            elif cpi >= 1.05:
                status = "excellent"
            else:
                status = "good"
            
            data.append((
                sponsor,
                random.choice(ffrdcs),
                month,
                float(cpi),
                float(actual_spend),
                float(est_spend),
                float(overhead),
                float(indirect),
                float(indirect_cap),
                float(util),
                status
            ))
    
    schema = StructType([
        StructField("sponsor_id", StringType(), False),
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("cpi", DoubleType(), False),
        StructField("actual_spend", DoubleType(), False),
        StructField("estimated_spend", DoubleType(), False),
        StructField("overhead_ratio", DoubleType(), False),
        StructField("indirect_rate", DoubleType(), False),
        StructField("indirect_rate_cap", DoubleType(), False),
        StructField("billable_util_pct", DoubleType(), False),
        StructField("status", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_efficiency",
    comment="Raw efficiency metrics by FFRDC"
)
def raw_efficiency():
    """Ingest efficiency data."""
    import random
    random.seed(51)
    
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for ffrdc in ffrdcs:
        headcount = random.randint(250, 500)
        for month in months:
            cost_fte = random.uniform(180_000, 280_000)
            benchmark = 220_000.0
            bench_pct = random.uniform(5, 18)
            demand = int(headcount * random.uniform(0.95, 1.12))
            
            data.append((
                ffrdc,
                month,
                float(cost_fte),
                benchmark,
                float(bench_pct),
                headcount,
                demand
            ))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("cost_per_fte", DoubleType(), False),
        StructField("industry_benchmark", DoubleType(), False),
        StructField("bench_pct", DoubleType(), False),
        StructField("headcount", IntegerType(), False),
        StructField("demand", IntegerType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_sponsor_experience",
    comment="Raw sponsor experience/health metrics"
)
def raw_sponsor_experience():
    """Ingest sponsor experience data."""
    import random
    random.seed(52)
    
    sponsors = ["dod", "dhs", "hhs", "dot", "treasury", "ssa"]
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for sponsor in sponsors:
        base_nps = random.randint(20, 70)
        for month in months:
            defect = random.uniform(1, 8)
            rework = random.uniform(2, 12)
            on_time = random.uniform(82, 98)
            budget_var = random.uniform(-10, 15)
            nps = base_nps + random.randint(-10, 10)
            health = random.uniform(60, 95)
            
            if health < 70:
                status = "critical"
            elif health < 80:
                status = "attention"
            else:
                status = "healthy"
            
            data.append((
                sponsor,
                month,
                float(defect),
                float(rework),
                float(on_time),
                float(budget_var),
                float(nps),
                float(health),
                status
            ))
    
    schema = StructType([
        StructField("sponsor_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("defect_rate", DoubleType(), False),
        StructField("rework_pct", DoubleType(), False),
        StructField("on_time_delivery_pct", DoubleType(), False),
        StructField("budget_variance_pct", DoubleType(), False),
        StructField("nps_score", DoubleType(), False),
        StructField("health_score", DoubleType(), False),
        StructField("status", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_contract_renewal",
    comment="Raw contract renewal data"
)
def raw_contract_renewal():
    """Ingest renewal calendar data."""
    import random
    random.seed(53)
    
    sponsors = ["dod", "dhs", "hhs", "dot", "treasury", "ssa"]
    today = date.today()
    
    data = []
    for i, sponsor in enumerate(sponsors):
        renewal = today + relativedelta(months=random.randint(1, 18))
        value = random.uniform(20_000_000, 200_000_000)
        run_rate = value / random.uniform(2, 5)
        nps = random.randint(30, 80)
        days = (renewal - today).days
        
        if nps < 40 or days < 60:
            status = "critical"
        elif nps < 55 or days < 120:
            status = "attention"
        else:
            status = "healthy"
        
        risk_notes = "Low risk" if status == "healthy" else "Monitor closely" if status == "attention" else "Immediate action needed"
        
        data.append((
            f"contract-{i+1}",
            sponsor,
            renewal,
            float(value),
            float(run_rate),
            float(nps),
            status,
            risk_notes,
            days
        ))
    
    schema = StructType([
        StructField("contract_id", StringType(), False),
        StructField("sponsor_id", StringType(), False),
        StructField("renewal_date", DateType(), False),
        StructField("contract_value", DoubleType(), False),
        StructField("annual_run_rate", DoubleType(), False),
        StructField("nps_score", DoubleType(), False),
        StructField("health_status", StringType(), False),
        StructField("risk_notes", StringType(), False),
        StructField("days_until_renewal", IntegerType(), False),
    ])
    return spark.createDataFrame(data, schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Fact Tables

# COMMAND ----------

@dlt.table(name="dim_sponsor", comment="Sponsor dimension")
def dim_sponsor():
    return dlt.read("raw_sponsor")

@dlt.table(name="dim_ffrdc", comment="FFRDC dimension")
def dim_ffrdc():
    return dlt.read("raw_ffrdc")

@dlt.table(
    name="fact_cost_stewardship",
    comment="Cost stewardship metrics"
)
@dlt.expect("valid_cpi", "cpi > 0")
@dlt.expect("valid_util", "billable_util_pct >= 0 AND billable_util_pct <= 100")
def fact_cost_stewardship():
    return dlt.read("raw_cost_stewardship")


@dlt.table(
    name="fact_efficiency",
    comment="Efficiency metrics by FFRDC"
)
@dlt.expect("positive_cost", "cost_per_fte > 0")
@dlt.expect("valid_bench", "bench_pct >= 0 AND bench_pct <= 100")
def fact_efficiency():
    return dlt.read("raw_efficiency")


@dlt.table(
    name="fact_sponsor_experience",
    comment="Sponsor experience metrics"
)
@dlt.expect("valid_health", "health_score >= 0 AND health_score <= 100")
def fact_sponsor_experience():
    return dlt.read("raw_sponsor_experience")


@dlt.table(
    name="fact_contract_renewal",
    comment="Contract renewal events"
)
@dlt.expect("positive_value", "contract_value > 0")
def fact_contract_renewal():
    return dlt.read("raw_contract_renewal")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gold Layer - Visualization Marts

# COMMAND ----------

@dlt.table(name="gold_stewardship_scorecard", comment="Stewardship scorecard - powers StewardshipScorecardTable")
def gold_stewardship_scorecard():
    stew = dlt.read("fact_cost_stewardship")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        stew
        .join(sponsor, "sponsor_id", "left")
        .select(
            "sponsor_id", "sponsor_name", F.col("abbreviation").alias("sponsor_abbreviation"),
            "month", "cpi", "actual_spend", "estimated_spend", "overhead_ratio",
            F.col("indirect_rate").alias("indirect_rate_current"),
            F.col("indirect_rate_cap"),
            "billable_util_pct", "status"
        )
    )


@dlt.table(name="gold_cpi_distribution", comment="CPI distribution - powers CpiDistributionChart")
def gold_cpi_distribution():
    stew = dlt.read("fact_cost_stewardship")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        stew
        .join(sponsor, "sponsor_id", "left")
        .withColumn("cpi_bucket", 
            F.when(F.col("cpi") < 0.9, "<0.9")
             .when(F.col("cpi") < 1.0, "0.9-1.0")
             .when(F.col("cpi") < 1.1, "1.0-1.1")
             .otherwise(">1.1"))
        .select("sponsor_id", "sponsor_name", "month", "cpi", "cpi_bucket")
    )


@dlt.table(name="gold_utilization", comment="Utilization by sponsor - powers UtilizationChart")
def gold_utilization():
    stew = dlt.read("fact_cost_stewardship")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        stew
        .join(sponsor, "sponsor_id", "left")
        .select("sponsor_id", "sponsor_name", "ffrdc_id", "month", "billable_util_pct")
    )


@dlt.table(name="gold_overhead_by_ffrdc", comment="Overhead by FFRDC - powers OverheadByFfrdcChart")
def gold_overhead_by_ffrdc():
    stew = dlt.read("fact_cost_stewardship")
    ffrdc = dlt.read("dim_ffrdc")
    
    agg = (
        stew
        .groupBy("ffrdc_id", "month")
        .agg(F.avg("overhead_ratio").alias("overhead_ratio"))
    )
    
    return (
        agg
        .join(ffrdc, "ffrdc_id", "left")
        .withColumn("target_ratio", F.lit(20.0))
        .select("ffrdc_id", "ffrdc_name", "month", "overhead_ratio", "target_ratio")
    )


@dlt.table(name="gold_indirect_rate_trend", comment="Indirect rate trend - powers IndirectRateTrendChart")
def gold_indirect_rate_trend():
    stew = dlt.read("fact_cost_stewardship")
    
    return (
        stew
        .groupBy("sponsor_id", "month")
        .agg(
            F.avg("indirect_rate").alias("actual_rate"),
            F.avg("indirect_rate_cap").alias("negotiated_cap")
        )
    )


@dlt.table(name="gold_cost_per_fte_by_ffrdc", comment="Cost per FTE by FFRDC - powers CostPerFteByFfrdcChart")
def gold_cost_per_fte_by_ffrdc():
    eff = dlt.read("fact_efficiency")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        eff
        .join(ffrdc, "ffrdc_id", "left")
        .select("ffrdc_id", "ffrdc_name", "month", F.col("cost_per_fte").alias("cost_per_tech_fte"), "industry_benchmark")
    )


@dlt.table(name="gold_bench_trend", comment="Bench trend - powers BenchTrendChart")
def gold_bench_trend():
    eff = dlt.read("fact_efficiency")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        eff
        .join(ffrdc, "ffrdc_id", "left")
        .select("ffrdc_id", "ffrdc_name", "month", "bench_pct")
    )


@dlt.table(name="gold_headcount_vs_demand", comment="Headcount vs demand - powers HeadcountVsDemandChart")
def gold_headcount_vs_demand():
    eff = dlt.read("fact_efficiency")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        eff
        .join(ffrdc, "ffrdc_id", "left")
        .withColumn("gap", F.col("headcount") - F.col("demand"))
        .select("ffrdc_id", "ffrdc_name", "month", "headcount", "demand", "gap")
    )


@dlt.table(name="gold_sponsor_health", comment="Sponsor health - powers SponsorHealthTable")
def gold_sponsor_health():
    exp = dlt.read("fact_sponsor_experience")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        exp
        .join(sponsor, "sponsor_id", "left")
        .select(
            "sponsor_id", "sponsor_name", "month",
            "defect_rate", "rework_pct", "on_time_delivery_pct",
            "budget_variance_pct", "nps_score", "health_score", "status"
        )
    )


@dlt.table(name="gold_nps_trend", comment="NPS trend - powers NpsTrendChart")
def gold_nps_trend():
    exp = dlt.read("fact_sponsor_experience")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        exp
        .join(sponsor, "sponsor_id", "left")
        .select("sponsor_id", "sponsor_name", "month", "nps_score")
    )


@dlt.table(name="gold_quality_metrics", comment="Quality metrics - powers QualityMetricsChart")
def gold_quality_metrics():
    exp = dlt.read("fact_sponsor_experience")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        exp
        .join(sponsor, "sponsor_id", "left")
        .select("sponsor_id", "sponsor_name", "month", "on_time_delivery_pct", "defect_rate", "rework_pct")
    )


@dlt.table(name="gold_renewals_calendar", comment="Renewals calendar - powers RenewalsTable")
def gold_renewals_calendar():
    renewal = dlt.read("fact_contract_renewal")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        renewal
        .join(sponsor, "sponsor_id", "left")
        .select(
            "sponsor_id", "sponsor_name", F.col("abbreviation").alias("sponsor_abbreviation"),
            "renewal_date", "contract_value", "annual_run_rate", "nps_score",
            "health_status", "risk_notes", "days_until_renewal"
        )
    )

