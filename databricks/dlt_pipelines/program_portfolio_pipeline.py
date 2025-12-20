# Databricks notebook source
# MAGIC %md
# MAGIC # Program Portfolio DLT Pipeline
# MAGIC 
# MAGIC This Delta Live Tables pipeline creates all tables needed for the Program Portfolio dashboard.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`program-portfolio`
# MAGIC 
# MAGIC ## Tables Created
# MAGIC - **Dimensions**: dim_sponsor, dim_ffrdc, dim_contract
# MAGIC - **Facts**: fact_sponsor_ffrdc_funding, fact_ffrdc_economics, fact_sponsor_health
# MAGIC - **Gold**: gold_sponsor_ffrdc_allocation, gold_sponsor_ytd_trend, gold_ffrdc_waterfall, gold_cost_per_fte, gold_pricing_rate_trends, gold_sponsor_health_scatter, gold_sponsor_health_heatmap, gold_contract_runway

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
        ("va", "Department of Veterans Affairs", "VA", "Veterans"),
        ("doj", "Department of Justice", "DOJ", "Justice"),
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
    name="raw_sponsor_ffrdc_funding",
    comment="Raw sponsor funding by FFRDC"
)
def raw_sponsor_ffrdc_funding():
    """Ingest sponsor-FFRDC funding allocations."""
    import random
    random.seed(45)
    
    sponsors = ["dod", "dhs", "hhs", "dot", "treasury", "ssa", "va", "doj"]
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for sponsor in sponsors:
        annual_budget = random.uniform(100_000_000, 500_000_000)
        ytd_cumulative = 0
        for month in sorted(months):
            for ffrdc in random.sample(ffrdcs, random.randint(2, 4)):
                funding = random.uniform(2_000_000, 20_000_000)
                ytd_cumulative += funding
                data.append((
                    sponsor,
                    ffrdc,
                    month,
                    float(funding),
                    float(ytd_cumulative),
                    float(annual_budget)
                ))
    
    schema = StructType([
        StructField("sponsor_id", StringType(), False),
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("funding_amount", DoubleType(), False),
        StructField("ytd_funding", DoubleType(), False),
        StructField("annual_budget", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_ffrdc_economics",
    comment="Raw FFRDC economics data"
)
def raw_ffrdc_economics():
    """Ingest FFRDC cost effectiveness data."""
    import random
    random.seed(46)
    
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for ffrdc in ffrdcs:
        base_revenue = random.uniform(80_000_000, 200_000_000)
        headcount = random.randint(250, 600)
        
        for month in months:
            revenue = base_revenue * random.uniform(0.9, 1.1)
            cost = revenue * random.uniform(0.65, 0.78)
            margin = (revenue - cost) / revenue * 100
            cost_per_fte = cost / headcount
            
            # Rate indices (100 = baseline)
            neg_rate_idx = 100 * random.uniform(0.95, 1.08)
            inflation_idx = 100 * random.uniform(1.00, 1.04)
            labor_idx = 100 * random.uniform(0.98, 1.06)
            
            data.append((
                ffrdc,
                month,
                float(revenue),
                float(cost),
                float(margin),
                float(cost_per_fte),
                headcount,
                float(neg_rate_idx),
                float(inflation_idx),
                float(labor_idx)
            ))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("revenue", DoubleType(), False),
        StructField("cost_of_delivery", DoubleType(), False),
        StructField("margin_pct", DoubleType(), False),
        StructField("cost_per_fte", DoubleType(), False),
        StructField("headcount", IntegerType(), False),
        StructField("negotiated_rate_index", DoubleType(), False),
        StructField("inflation_index", DoubleType(), False),
        StructField("labor_cost_index", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_sponsor_health",
    comment="Raw sponsor health metrics"
)
def raw_sponsor_health():
    """Ingest sponsor health data."""
    import random
    random.seed(47)
    
    sponsors = ["dod", "dhs", "hhs", "dot", "treasury", "ssa", "va", "doj"]
    today = date.today()
    
    data = []
    for sponsor in sponsors:
        funding = random.uniform(50_000_000, 300_000_000)
        cpi = random.uniform(0.85, 1.15)
        util = random.uniform(70, 95)
        runway = random.randint(6, 36)
        contract_value = funding * random.uniform(2, 5)
        renewal = today + relativedelta(months=runway)
        
        if cpi < 0.95 or util < 75:
            status = "critical"
        elif cpi < 1.0 or util < 82:
            status = "attention"
        else:
            status = "healthy"
        
        data.append((
            sponsor,
            today,
            float(funding),
            float(cpi),
            float(util),
            runway,
            float(contract_value),
            renewal,
            status
        ))
    
    schema = StructType([
        StructField("sponsor_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("funding_volume", DoubleType(), False),
        StructField("cpi", DoubleType(), False),
        StructField("utilization_pct", DoubleType(), False),
        StructField("runway_months", IntegerType(), False),
        StructField("contract_value", DoubleType(), False),
        StructField("next_renewal_date", DateType(), False),
        StructField("status", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Dimension and Fact Tables

# COMMAND ----------

@dlt.table(
    name="dim_sponsor",
    comment="Sponsor dimension"
)
@dlt.expect_or_fail("valid_sponsor_id", "sponsor_id IS NOT NULL")
def dim_sponsor():
    return dlt.read("raw_sponsor")


@dlt.table(
    name="dim_ffrdc",
    comment="FFRDC dimension"
)
@dlt.expect_or_fail("valid_ffrdc_id", "ffrdc_id IS NOT NULL")
def dim_ffrdc():
    return dlt.read("raw_ffrdc")


@dlt.table(
    name="fact_sponsor_ffrdc_funding",
    comment="Sponsor-FFRDC funding allocations"
)
@dlt.expect_or_fail("valid_keys", "sponsor_id IS NOT NULL AND ffrdc_id IS NOT NULL")
@dlt.expect("positive_funding", "funding_amount >= 0")
def fact_sponsor_ffrdc_funding():
    return dlt.read("raw_sponsor_ffrdc_funding")


@dlt.table(
    name="fact_ffrdc_economics",
    comment="FFRDC cost effectiveness metrics"
)
@dlt.expect_or_fail("valid_ffrdc", "ffrdc_id IS NOT NULL")
@dlt.expect("positive_revenue", "revenue >= 0")
@dlt.expect("valid_margin", "margin_pct >= 0 AND margin_pct <= 100")
def fact_ffrdc_economics():
    return dlt.read("raw_ffrdc_economics")


@dlt.table(
    name="fact_sponsor_health",
    comment="Sponsor health metrics"
)
@dlt.expect_or_fail("valid_sponsor", "sponsor_id IS NOT NULL")
@dlt.expect("valid_cpi", "cpi > 0")
def fact_sponsor_health():
    return dlt.read("raw_sponsor_health")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gold Layer - Visualization Marts

# COMMAND ----------

@dlt.table(
    name="gold_sponsor_ffrdc_allocation",
    comment="Sponsor-FFRDC funding allocation - powers SponsorFfrdcAllocationChart"
)
def gold_sponsor_ffrdc_allocation():
    """Prepare allocation data for stacked bar chart."""
    funding = dlt.read("fact_sponsor_ffrdc_funding")
    sponsor = dlt.read("dim_sponsor")
    ffrdc = dlt.read("dim_ffrdc")
    
    # Calculate sponsor totals
    sponsor_totals = (
        funding
        .groupBy("sponsor_id", "month")
        .agg(F.sum("funding_amount").alias("total_sponsor_funding"))
    )
    
    return (
        funding
        .join(sponsor, "sponsor_id", "left")
        .join(ffrdc, "ffrdc_id", "left")
        .join(sponsor_totals, ["sponsor_id", "month"], "left")
        .withColumn("pct_of_sponsor_total", 
                    F.col("funding_amount") / F.col("total_sponsor_funding") * 100)
        .select(
            "sponsor_id",
            F.col("sponsor_name"),
            F.col("abbreviation").alias("sponsor_abbreviation"),
            "ffrdc_id",
            F.col("ffrdc_name"),
            "month",
            "funding_amount",
            "total_sponsor_funding",
            "pct_of_sponsor_total"
        )
    )


@dlt.table(
    name="gold_sponsor_ytd_trend",
    comment="Sponsor YTD budget trend - powers SponsorYtdBudgetTrendChart"
)
def gold_sponsor_ytd_trend():
    """Prepare YTD trend data."""
    funding = dlt.read("fact_sponsor_ffrdc_funding")
    sponsor = dlt.read("dim_sponsor")
    
    # Aggregate by sponsor/month
    agg = (
        funding
        .groupBy("sponsor_id", "month")
        .agg(
            F.max("ytd_funding").alias("ytd_funding"),
            F.max("annual_budget").alias("annual_budget")
        )
    )
    
    return (
        agg
        .join(sponsor, "sponsor_id", "left")
        .withColumn("pct_of_budget", F.col("ytd_funding") / F.col("annual_budget") * 100)
        .select("sponsor_id", "sponsor_name", "month", "ytd_funding", "annual_budget", "pct_of_budget")
    )


@dlt.table(
    name="gold_ffrdc_waterfall",
    comment="FFRDC revenue/cost waterfall - powers FfrdcRevenueCostWaterfallChart"
)
def gold_ffrdc_waterfall():
    """Prepare waterfall chart data."""
    econ = dlt.read("fact_ffrdc_economics")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        econ
        .join(ffrdc, "ffrdc_id", "left")
        .withColumn("gross_profit", F.col("revenue") - F.col("cost_of_delivery"))
        .select("ffrdc_id", "ffrdc_name", "month", "revenue", "cost_of_delivery", "gross_profit", "margin_pct")
    )


@dlt.table(
    name="gold_cost_per_fte",
    comment="Cost per FTE by FFRDC - powers CostPerFteChart"
)
def gold_cost_per_fte():
    """Prepare cost/FTE data."""
    econ = dlt.read("fact_ffrdc_economics")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        econ
        .join(ffrdc, "ffrdc_id", "left")
        .withColumn("total_cost", F.col("cost_of_delivery"))
        .select("ffrdc_id", "ffrdc_name", "month", "cost_per_fte", "headcount", "total_cost")
    )


@dlt.table(
    name="gold_pricing_rate_trends",
    comment="Pricing rate trends - powers PricingRateTrendsChart"
)
def gold_pricing_rate_trends():
    """Prepare rate trend data."""
    econ = dlt.read("fact_ffrdc_economics")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        econ
        .join(ffrdc, "ffrdc_id", "left")
        .select("ffrdc_id", "ffrdc_name", "month", "negotiated_rate_index", "inflation_index", "labor_cost_index")
    )


@dlt.table(
    name="gold_sponsor_health_scatter",
    comment="Sponsor health scatter plot - powers SponsorHealthScatterChart"
)
def gold_sponsor_health_scatter():
    """Prepare scatter plot data."""
    health = dlt.read("fact_sponsor_health")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        health
        .join(sponsor, "sponsor_id", "left")
        .select(
            "sponsor_id",
            "sponsor_name",
            "month",
            "cpi",
            "utilization_pct",
            "funding_volume",
            "status"
        )
    )


@dlt.table(
    name="gold_sponsor_health_heatmap",
    comment="Sponsor health heatmap - powers SponsorHealthHeatmapTable"
)
def gold_sponsor_health_heatmap():
    """Prepare heatmap data."""
    health = dlt.read("fact_sponsor_health")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        health
        .join(sponsor, "sponsor_id", "left")
        .select(
            "sponsor_id",
            "sponsor_name",
            "month",
            "cpi",
            "utilization_pct",
            "runway_months",
            "status"
        )
    )


@dlt.table(
    name="gold_contract_runway",
    comment="Contract runway table - powers ContractRunwayTable"
)
def gold_contract_runway():
    """Prepare contract runway data."""
    health = dlt.read("fact_sponsor_health")
    sponsor = dlt.read("dim_sponsor")
    
    return (
        health
        .join(sponsor, "sponsor_id", "left")
        .select(
            "sponsor_id",
            "sponsor_name",
            F.col("month").alias("as_of_date"),
            "contract_value",
            "runway_months",
            "next_renewal_date",
            "status"
        )
    )

