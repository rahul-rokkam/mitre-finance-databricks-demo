# Databricks notebook source
# MAGIC %md
# MAGIC # Financial Health DLT Pipeline
# MAGIC 
# MAGIC This Delta Live Tables pipeline creates all tables needed for the Financial Health dashboard.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`financial-health`
# MAGIC 
# MAGIC ## Tables Created
# MAGIC - **Dimensions**: dim_date_month, dim_ffrdc, dim_sponsor
# MAGIC - **Facts**: fact_finance_monthly, fact_budget_monthly, fact_indirect_rate, fact_cash_metrics, fact_ar_ap_aging
# MAGIC - **Gold**: gold_kpi_summary, gold_revenue_vs_budget, gold_gross_margin_trend, gold_opex_trend, gold_headcount_utilization, gold_indirect_rate, gold_cash_position, gold_aging_buckets, gold_signals

# COMMAND ----------

import dlt
from pyspark.sql import functions as F
from pyspark.sql.types import *
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bronze Layer - Raw Data Ingestion
# MAGIC 
# MAGIC In production, these would read from actual source systems (ERP, GL, etc.).
# MAGIC For now, we use demo data that mirrors the UI static data structure.

# COMMAND ----------

@dlt.table(
    name="raw_ffrdc",
    comment="Raw FFRDC reference data from source system"
)
def raw_ffrdc():
    """Ingest FFRDC master data."""
    # Demo data - replace with actual source
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
    name="raw_sponsor",
    comment="Raw sponsor/agency reference data"
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
    name="raw_finance_monthly",
    comment="Raw monthly financial data from ERP/GL system"
)
def raw_finance_monthly():
    """Ingest monthly financial metrics."""
    # Demo data - 12 months of data for each FFRDC
    import random
    random.seed(42)
    
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    months = []
    today = date.today()
    for i in range(12):
        month_date = date(today.year, today.month, 1) - relativedelta(months=i)
        months.append(month_date)
    
    data = []
    for ffrdc in ffrdcs:
        base_revenue = random.uniform(50_000_000, 150_000_000)
        for month in months:
            revenue = base_revenue * random.uniform(0.9, 1.1)
            cost = revenue * random.uniform(0.65, 0.80)
            opex = revenue * random.uniform(0.08, 0.12)
            headcount = int(random.uniform(200, 500))
            utilization = random.uniform(0.75, 0.92)
            billable = headcount * 160 * utilization
            total_hours = headcount * 160
            
            data.append((
                ffrdc,
                month,
                float(revenue),
                float(cost),
                float(revenue - cost),
                float((revenue - cost) / revenue * 100),
                float(opex),
                headcount,
                float(utilization * 100),
                float(billable),
                float(total_hours)
            ))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("revenue", DoubleType(), False),
        StructField("cost_of_delivery", DoubleType(), False),
        StructField("gross_margin", DoubleType(), False),
        StructField("gross_margin_pct", DoubleType(), False),
        StructField("opex", DoubleType(), False),
        StructField("headcount", IntegerType(), False),
        StructField("utilization_pct", DoubleType(), False),
        StructField("billable_hours", DoubleType(), False),
        StructField("total_hours", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_budget_monthly",
    comment="Raw monthly budget data"
)
def raw_budget_monthly():
    """Ingest monthly budget allocations."""
    import random
    random.seed(43)
    
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    months = []
    today = date.today()
    for i in range(12):
        month_date = date(today.year, today.month, 1) - relativedelta(months=i)
        months.append(month_date)
    
    data = []
    for ffrdc in ffrdcs:
        base_budget = random.uniform(55_000_000, 140_000_000)
        for month in months:
            budget = base_budget * random.uniform(0.95, 1.05)
            data.append((ffrdc, month, float(budget), "revenue"))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("budget_amount", DoubleType(), False),
        StructField("budget_type", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_indirect_rate",
    comment="Raw indirect rate data by FFRDC"
)
def raw_indirect_rate():
    """Ingest indirect rate data."""
    import random
    random.seed(44)
    
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    months = []
    today = date.today()
    for i in range(12):
        month_date = date(today.year, today.month, 1) - relativedelta(months=i)
        months.append(month_date)
    
    data = []
    for ffrdc in ffrdcs:
        cap_rate = random.uniform(0.35, 0.45)
        for month in months:
            actual_rate = cap_rate * random.uniform(0.85, 1.02)
            data.append((ffrdc, month, float(actual_rate), float(cap_rate)))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("month", DateType(), False),
        StructField("actual_rate", DoubleType(), False),
        StructField("cap_rate", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_cash_metrics",
    comment="Raw cash position and working capital data"
)
def raw_cash_metrics():
    """Ingest cash and working capital metrics."""
    today = date.today()
    data = [
        (today, 245_000_000.0, 82_000_000.0, 42, 38),
    ]
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("cash_balance", DoubleType(), False),
        StructField("working_capital", DoubleType(), False),
        StructField("dso", IntegerType(), False),
        StructField("dpo", IntegerType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_ar_ap_aging",
    comment="Raw AR/AP aging bucket data"
)
def raw_ar_ap_aging():
    """Ingest AR/AP aging data."""
    today = date.today()
    data = [
        (today, "0-30", 45_000_000.0, 32_000_000.0),
        (today, "31-60", 28_000_000.0, 18_000_000.0),
        (today, "61-90", 12_000_000.0, 8_000_000.0),
        (today, ">90", 5_000_000.0, 2_000_000.0),
    ]
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("aging_bucket", StringType(), False),
        StructField("ar_amount", DoubleType(), False),
        StructField("ap_amount", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(
    name="raw_signals",
    comment="Raw governance signals and alerts"
)
def raw_signals():
    """Ingest governance signals."""
    today = date.today()
    data = [
        ("sig-001", today, "warning", "CISA indirect rate approaching cap threshold", "indirect-rate", "cisa", 0.42, 0.45),
        ("sig-002", today, "critical", "DoD headcount utilization below target", "headcount-util", "dod", 72.5, 80.0),
        ("sig-003", today, "info", "FAA revenue exceeds YTD budget by 8%", "ytd-revenue", "faa", None, None),
    ]
    schema = StructType([
        StructField("signal_id", StringType(), False),
        StructField("as_of_date", DateType(), False),
        StructField("signal_type", StringType(), False),
        StructField("message", StringType(), False),
        StructField("kpi_id", StringType(), False),
        StructField("ffrdc_id", StringType(), True),
        StructField("value", DoubleType(), True),
        StructField("threshold", DoubleType(), True),
    ])
    return spark.createDataFrame(data, schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Dimension Tables

# COMMAND ----------

@dlt.table(
    name="dim_date_month",
    comment="Calendar dimension at month grain"
)
def dim_date_month():
    """Generate date dimension for the last 3 years."""
    today = date.today()
    months = []
    for i in range(36):  # 3 years
        month_date = date(today.year, today.month, 1) - relativedelta(months=i)
        
        # Calculate fiscal year (assuming Oct 1 start)
        if month_date.month >= 10:
            fy = month_date.year + 1
            fq = (month_date.month - 10) // 3 + 1
        else:
            fy = month_date.year
            fq = (month_date.month + 2) // 3
        
        months.append((
            month_date,
            month_date.year,
            (month_date.month - 1) // 3 + 1,
            month_date.month,
            month_date.strftime("%B"),
            f"FY{str(fy)[2:]}",
            fq
        ))
    
    schema = StructType([
        StructField("month", DateType(), False),
        StructField("year", IntegerType(), False),
        StructField("quarter", IntegerType(), False),
        StructField("month_num", IntegerType(), False),
        StructField("month_name", StringType(), False),
        StructField("fiscal_year", StringType(), False),
        StructField("fiscal_quarter", IntegerType(), False),
    ])
    return spark.createDataFrame(months, schema)


@dlt.table(
    name="dim_ffrdc",
    comment="FFRDC dimension table"
)
@dlt.expect_or_fail("valid_ffrdc_id", "ffrdc_id IS NOT NULL")
def dim_ffrdc():
    """Clean and conform FFRDC dimension."""
    return dlt.read("raw_ffrdc")


@dlt.table(
    name="dim_sponsor",
    comment="Sponsor dimension table"
)
@dlt.expect_or_fail("valid_sponsor_id", "sponsor_id IS NOT NULL")
def dim_sponsor():
    """Clean and conform sponsor dimension."""
    return dlt.read("raw_sponsor")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Fact Tables

# COMMAND ----------

@dlt.table(
    name="fact_finance_monthly",
    comment="Monthly financial metrics by FFRDC"
)
@dlt.expect_or_fail("valid_ffrdc_id", "ffrdc_id IS NOT NULL")
@dlt.expect_or_fail("valid_month", "month IS NOT NULL")
@dlt.expect("positive_revenue", "revenue >= 0")
@dlt.expect("valid_utilization", "utilization_pct >= 0 AND utilization_pct <= 100")
def fact_finance_monthly():
    """Clean and validate monthly financial data."""
    return dlt.read("raw_finance_monthly")


@dlt.table(
    name="fact_budget_monthly",
    comment="Monthly budget by FFRDC"
)
@dlt.expect_or_fail("valid_ffrdc_id", "ffrdc_id IS NOT NULL")
@dlt.expect_or_fail("valid_month", "month IS NOT NULL")
@dlt.expect("positive_budget", "budget_amount >= 0")
def fact_budget_monthly():
    """Clean and validate budget data."""
    return dlt.read("raw_budget_monthly")


@dlt.table(
    name="fact_indirect_rate",
    comment="Indirect rates by FFRDC"
)
@dlt.expect_or_fail("valid_ffrdc_id", "ffrdc_id IS NOT NULL")
@dlt.expect("valid_rates", "actual_rate >= 0 AND cap_rate >= 0")
def fact_indirect_rate():
    """Clean and validate indirect rate data."""
    return dlt.read("raw_indirect_rate")


@dlt.table(
    name="fact_cash_metrics",
    comment="Cash position and working capital"
)
@dlt.expect("positive_cash", "cash_balance >= 0")
@dlt.expect("valid_dso", "dso >= 0")
def fact_cash_metrics():
    """Clean and validate cash metrics."""
    return dlt.read("raw_cash_metrics")


@dlt.table(
    name="fact_ar_ap_aging",
    comment="AR/AP aging buckets"
)
@dlt.expect("positive_ar", "ar_amount >= 0")
@dlt.expect("positive_ap", "ap_amount >= 0")
def fact_ar_ap_aging():
    """Clean and validate aging data."""
    return (
        dlt.read("raw_ar_ap_aging")
        .withColumn("net_amount", F.col("ar_amount") - F.col("ap_amount"))
    )

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gold Layer - Visualization Marts

# COMMAND ----------

@dlt.table(
    name="gold_revenue_vs_budget",
    comment="Revenue vs budget comparison by FFRDC - powers RevenueVsBudgetChart"
)
def gold_revenue_vs_budget():
    """Join finance and budget data for revenue vs budget visualization."""
    finance = dlt.read("fact_finance_monthly")
    budget = dlt.read("fact_budget_monthly").filter(F.col("budget_type") == "revenue")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        finance
        .join(budget, ["ffrdc_id", "month"], "left")
        .join(ffrdc, "ffrdc_id", "left")
        .select(
            F.col("ffrdc_id"),
            F.col("ffrdc_name"),
            F.col("month"),
            F.col("revenue").alias("actual_revenue"),
            F.col("budget_amount"),
            (F.col("revenue") - F.col("budget_amount")).alias("variance"),
            ((F.col("revenue") - F.col("budget_amount")) / F.col("budget_amount") * 100).alias("variance_pct")
        )
    )


@dlt.table(
    name="gold_gross_margin_trend",
    comment="Gross margin trends by FFRDC - powers GrossMarginChart"
)
def gold_gross_margin_trend():
    """Calculate margin trends for visualization."""
    finance = dlt.read("fact_finance_monthly")
    ffrdc = dlt.read("dim_ffrdc")
    
    # Window for prior period comparison
    from pyspark.sql.window import Window
    w = Window.partitionBy("ffrdc_id").orderBy("month")
    
    return (
        finance
        .join(ffrdc, "ffrdc_id", "left")
        .withColumn("prior_margin", F.lag("gross_margin_pct").over(w))
        .withColumn("change_pct", F.col("gross_margin_pct") - F.col("prior_margin"))
        .select(
            "ffrdc_id",
            "ffrdc_name",
            "month",
            F.col("gross_margin_pct"),
            F.col("gross_margin_pct").alias("current_margin"),
            "prior_margin",
            "change_pct"
        )
    )


@dlt.table(
    name="gold_opex_trend",
    comment="Operating expense trends - powers OpexRatioChart"
)
def gold_opex_trend():
    """Aggregate opex trends across FFRDCs."""
    finance = dlt.read("fact_finance_monthly")
    budget = dlt.read("fact_budget_monthly")
    
    # Aggregate by month
    opex_actual = (
        finance
        .groupBy("month")
        .agg(
            F.sum("opex").alias("actual_opex"),
            F.sum("revenue").alias("total_revenue")
        )
    )
    
    opex_budget = (
        budget
        .filter(F.col("budget_type") == "revenue")
        .groupBy("month")
        .agg(F.sum("budget_amount").alias("budget_opex"))
    )
    
    return (
        opex_actual
        .join(opex_budget, "month", "left")
        .withColumn("opex_ratio_pct", F.col("actual_opex") / F.col("total_revenue") * 100)
        .select("month", "actual_opex", "budget_opex", "opex_ratio_pct")
    )


@dlt.table(
    name="gold_headcount_utilization",
    comment="Headcount and utilization by FFRDC - powers HeadcountUtilChart"
)
def gold_headcount_utilization():
    """Prepare headcount/utilization data for visualization."""
    finance = dlt.read("fact_finance_monthly")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        finance
        .join(ffrdc, "ffrdc_id", "left")
        .select(
            "ffrdc_id",
            "ffrdc_name",
            "month",
            "headcount",
            "utilization_pct",
            "billable_hours",
            "total_hours"
        )
    )


@dlt.table(
    name="gold_indirect_rate",
    comment="Indirect rates by FFRDC - powers IndirectRateChart"
)
def gold_indirect_rate():
    """Prepare indirect rate data for visualization."""
    rates = dlt.read("fact_indirect_rate")
    ffrdc = dlt.read("dim_ffrdc")
    
    return (
        rates
        .join(ffrdc, "ffrdc_id", "left")
        .withColumn("variance", F.col("actual_rate") - F.col("cap_rate"))
        .select("ffrdc_id", "ffrdc_name", "month", "actual_rate", "cap_rate", "variance")
    )


@dlt.table(
    name="gold_cash_position",
    comment="Cash position summary - powers AgingTable header"
)
def gold_cash_position():
    """Prepare cash position data."""
    return dlt.read("fact_cash_metrics")


@dlt.table(
    name="gold_aging_buckets",
    comment="AR/AP aging buckets - powers AgingTable rows"
)
def gold_aging_buckets():
    """Prepare aging bucket data."""
    return dlt.read("fact_ar_ap_aging")


@dlt.table(
    name="gold_signals",
    comment="Governance signals - powers SignalsList"
)
def gold_signals():
    """Prepare signals data."""
    return dlt.read("raw_signals")


@dlt.table(
    name="gold_kpi_summary",
    comment="KPI summary cards - powers KpiCard components"
)
def gold_kpi_summary():
    """Calculate KPI summaries for dashboard cards."""
    finance = dlt.read("fact_finance_monthly")
    
    # Get latest month
    latest = finance.agg(F.max("month").alias("max_month")).collect()[0]["max_month"]
    
    # Calculate KPIs
    current = finance.filter(F.col("month") == latest)
    
    total_revenue = current.agg(F.sum("revenue")).collect()[0][0]
    avg_margin = current.agg(F.avg("gross_margin_pct")).collect()[0][0]
    total_headcount = current.agg(F.sum("headcount")).collect()[0][0]
    avg_util = current.agg(F.avg("utilization_pct")).collect()[0][0]
    
    kpis = [
        (latest, "ytd-revenue", "YTD Revenue", float(total_revenue), "currency", 5.2, "+5.2% vs prior year", "green"),
        (latest, "gross-margin", "Gross Margin", float(avg_margin), "percent", 1.5, "+1.5pp vs prior year", "green"),
        (latest, "headcount", "Total Headcount", float(total_headcount), "count", 45.0, "+45 vs prior year", "green"),
        (latest, "utilization", "Avg Utilization", float(avg_util), "percent", -2.1, "-2.1pp vs prior year", "yellow"),
    ]
    
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("kpi_id", StringType(), False),
        StructField("kpi_label", StringType(), False),
        StructField("value", DoubleType(), False),
        StructField("unit", StringType(), False),
        StructField("delta", DoubleType(), False),
        StructField("delta_label", StringType(), False),
        StructField("status", StringType(), False),
    ])
    return spark.createDataFrame(kpis, schema)

