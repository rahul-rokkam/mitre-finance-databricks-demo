# Databricks notebook source
# MAGIC %md
# MAGIC # Risk & Compliance DLT Pipeline
# MAGIC 
# MAGIC This Delta Live Tables pipeline creates all tables needed for the Risk & Compliance dashboard.
# MAGIC 
# MAGIC **Target Schema**: `financial-command-center`.`risk-compliance`
# MAGIC 
# MAGIC ## Tables Created
# MAGIC - **Dimensions**: dim_ffrdc, dim_control, dim_region, dim_covenant
# MAGIC - **Facts**: fact_audit_finding, fact_control_test, fact_revenue_concentration, fact_key_person_dependency, fact_gl_exception, fact_covenant_compliance, fact_budget_variance
# MAGIC - **Gold**: gold_findings_aging, gold_root_cause_tags, gold_control_effectiveness, gold_revrec_schedule, gold_compliance_calendar, gold_sponsor_concentration, gold_diversification_geo, gold_diversification_mission_area, gold_retention_trend, gold_key_person_dependencies, gold_bench_utilization, gold_turnover_trend, gold_control_exceptions_trend, gold_failed_audit_tests, gold_gl_exceptions, gold_covenant_compliance, gold_budget_variance_root_cause

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

@dlt.table(name="raw_ffrdc", comment="Raw FFRDC reference data")
def raw_ffrdc():
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


@dlt.table(name="raw_sponsor", comment="Raw sponsor reference data")
def raw_sponsor():
    data = [
        ("dod", "Department of Defense", "DoD"),
        ("dhs", "Department of Homeland Security", "DHS"),
        ("hhs", "Department of Health and Human Services", "HHS"),
        ("dot", "Department of Transportation", "DOT"),
        ("treasury", "Department of Treasury", "Treasury"),
        ("ssa", "Social Security Administration", "SSA"),
        ("va", "Department of Veterans Affairs", "VA"),
        ("doj", "Department of Justice", "DOJ"),
        ("doe", "Department of Energy", "DOE"),
        ("epa", "Environmental Protection Agency", "EPA"),
    ]
    schema = StructType([
        StructField("sponsor_id", StringType(), False),
        StructField("sponsor_name", StringType(), False),
        StructField("abbreviation", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_audit_finding", comment="Raw audit findings data")
def raw_audit_finding():
    import random
    random.seed(60)
    
    root_causes = ["Process Gap", "Training Issue", "System Error", "Documentation", "Oversight", "Policy Violation"]
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    statuses = ["open", "in_progress", "remediated"]
    risks = ["low", "medium", "high", "critical"]
    today = date.today()
    
    data = []
    for i in range(35):
        age = random.randint(5, 150)
        opened = today - relativedelta(days=age)
        closed = None if random.random() < 0.6 else opened + relativedelta(days=random.randint(10, age))
        status = "remediated" if closed else random.choice(["open", "in_progress"])
        
        data.append((
            f"finding-{i+1}",
            opened,
            closed,
            age,
            status,
            random.choice(risks),
            random.choice(root_causes),
            random.choice(ffrdcs),
            f"Assignee {random.randint(1, 10)}"
        ))
    
    schema = StructType([
        StructField("finding_id", StringType(), False),
        StructField("opened_date", DateType(), False),
        StructField("closed_date", DateType(), True),
        StructField("age_days", IntegerType(), False),
        StructField("status", StringType(), False),
        StructField("risk_level", StringType(), False),
        StructField("root_cause", StringType(), False),
        StructField("ffrdc_id", StringType(), False),
        StructField("assignee", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_control_test", comment="Raw control test results")
def raw_control_test():
    import random
    random.seed(61)
    
    domains = ["Access Control", "Change Management", "Data Integrity", "Financial Reporting", "IT General", "Segregation of Duties"]
    today = date.today()
    
    data = []
    for domain in domains:
        for i in range(10):
            test_date = today - relativedelta(days=random.randint(1, 90))
            passed = random.random() > 0.15
            score = random.uniform(0.7, 1.0) if passed else random.uniform(0.3, 0.7)
            
            data.append((f"ctrl-{domain[:3]}-{i}", domain, test_date, passed, float(score)))
    
    schema = StructType([
        StructField("control_id", StringType(), False),
        StructField("control_domain", StringType(), False),
        StructField("test_date", DateType(), False),
        StructField("passed", BooleanType(), False),
        StructField("effectiveness_score", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_revrec", comment="Raw revenue recognition schedule")
def raw_revrec():
    import random
    random.seed(62)
    
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for month in months:
        cr = random.uniform(30_000_000, 60_000_000)
        fp = random.uniform(10_000_000, 25_000_000)
        tm = random.uniform(15_000_000, 35_000_000)
        ms = random.uniform(5_000_000, 15_000_000)
        
        data.append((month, float(cr), float(fp), float(tm), float(ms), float(cr + fp + tm + ms)))
    
    schema = StructType([
        StructField("month", DateType(), False),
        StructField("cost_reimbursable", DoubleType(), False),
        StructField("fixed_price", DoubleType(), False),
        StructField("time_and_materials", DoubleType(), False),
        StructField("milestone", DoubleType(), False),
        StructField("total", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_compliance_event", comment="Raw compliance calendar events")
def raw_compliance_event():
    import random
    random.seed(63)
    
    event_types = ["audit", "filing", "certification", "review"]
    sponsors = ["DoD", "DHS", "HHS", "Treasury", "SSA"]
    today = date.today()
    
    data = []
    for i in range(15):
        days_offset = random.randint(-30, 120)
        due = today + relativedelta(days=days_offset)
        
        if days_offset < 0:
            status = "overdue" if random.random() < 0.3 else "completed"
        elif days_offset < 14:
            status = "in_progress"
        else:
            status = "upcoming"
        
        data.append((
            f"event-{i+1}",
            f"Compliance Event {i+1}",
            random.choice(event_types),
            due,
            random.choice(sponsors),
            status,
            days_offset
        ))
    
    schema = StructType([
        StructField("event_id", StringType(), False),
        StructField("title", StringType(), False),
        StructField("event_type", StringType(), False),
        StructField("due_date", DateType(), False),
        StructField("sponsor", StringType(), False),
        StructField("status", StringType(), False),
        StructField("days_until_due", IntegerType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_revenue_concentration", comment="Raw revenue concentration by sponsor")
def raw_revenue_concentration():
    import random
    random.seed(64)
    
    sponsors = [
        ("dod", "Department of Defense", "DoD", 180_000_000),
        ("dhs", "Department of Homeland Security", "DHS", 95_000_000),
        ("hhs", "HHS", "HHS", 75_000_000),
        ("treasury", "Treasury", "Treasury", 55_000_000),
        ("va", "Veterans Affairs", "VA", 45_000_000),
        ("dot", "Transportation", "DOT", 35_000_000),
        ("ssa", "SSA", "SSA", 30_000_000),
        ("doj", "DOJ", "DOJ", 25_000_000),
        ("doe", "Energy", "DOE", 20_000_000),
        ("epa", "EPA", "EPA", 15_000_000),
    ]
    
    today = date.today()
    total = sum(s[3] for s in sponsors)
    cumulative = 0
    
    data = []
    for sponsor_id, name, abbrev, revenue in sponsors:
        pct = revenue / total * 100
        cumulative += pct
        yoy = random.uniform(-8, 12)
        
        data.append((today, sponsor_id, name, abbrev, float(revenue), float(pct), float(cumulative), float(yoy)))
    
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("sponsor_id", StringType(), False),
        StructField("sponsor_name", StringType(), False),
        StructField("abbreviation", StringType(), False),
        StructField("revenue_amount", DoubleType(), False),
        StructField("revenue_pct", DoubleType(), False),
        StructField("cumulative_pct", DoubleType(), False),
        StructField("yoy_change", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_diversification_geo", comment="Raw geographic diversification")
def raw_diversification_geo():
    today = date.today()
    data = [
        (today, "Northeast", 185_000_000.0, 32.5),
        (today, "Mid-Atlantic", 145_000_000.0, 25.4),
        (today, "Southeast", 95_000_000.0, 16.7),
        (today, "Midwest", 75_000_000.0, 13.2),
        (today, "West", 70_000_000.0, 12.2),
    ]
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("region", StringType(), False),
        StructField("revenue_amount", DoubleType(), False),
        StructField("revenue_pct", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_diversification_mission", comment="Raw mission area diversification")
def raw_diversification_mission():
    today = date.today()
    data = [
        (today, "Defense", 195_000_000.0, 34.2),
        (today, "Cybersecurity", 125_000_000.0, 21.9),
        (today, "Health", 95_000_000.0, 16.7),
        (today, "Aviation", 80_000_000.0, 14.0),
        (today, "Homeland Security", 75_000_000.0, 13.2),
    ]
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("mission_area", StringType(), False),
        StructField("revenue_amount", DoubleType(), False),
        StructField("revenue_pct", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_retention_trend", comment="Raw sponsor retention trend")
def raw_retention_trend():
    import random
    random.seed(65)
    
    data = []
    for year in ["FY22", "FY23", "FY24", "FY25"]:
        retained = random.randint(35, 45)
        new = random.randint(5, 12)
        churned = random.randint(2, 6)
        rate = retained / (retained + churned) * 100
        
        data.append((year, retained, new, churned, float(rate)))
    
    schema = StructType([
        StructField("year", StringType(), False),
        StructField("retained_sponsors", IntegerType(), False),
        StructField("new_sponsors", IntegerType(), False),
        StructField("churned_sponsors", IntegerType(), False),
        StructField("retention_rate", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_key_person_dependency", comment="Raw key person dependencies")
def raw_key_person_dependency():
    import random
    random.seed(66)
    
    capabilities = ["Cloud Architecture", "AI/ML", "Cybersecurity", "Systems Engineering", "Data Analytics", "Aviation Safety"]
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    risks = ["low", "medium", "high", "critical"]
    today = date.today()
    
    data = []
    for i, cap in enumerate(capabilities):
        data.append((
            f"dep-{i+1}",
            cap,
            f"Expert {i+1}",
            random.randint(0, 3),
            random.random() > 0.3,
            random.choice(risks),
            random.choice(ffrdcs),
            today - relativedelta(months=random.randint(1, 12))
        ))
    
    schema = StructType([
        StructField("dependency_id", StringType(), False),
        StructField("capability", StringType(), False),
        StructField("primary_owner", StringType(), False),
        StructField("backup_count", IntegerType(), False),
        StructField("has_documentation", BooleanType(), False),
        StructField("risk_level", StringType(), False),
        StructField("ffrdc_id", StringType(), False),
        StructField("last_review_date", DateType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_bench_utilization", comment="Raw bench utilization by FFRDC")
def raw_bench_utilization():
    import random
    random.seed(67)
    
    ffrdcs = [("cisa", "CISA"), ("cms", "CMS"), ("dhs", "DHS"), ("dod", "DoD"), ("faa", "FAA"), ("irs", "IRS")]
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(6)]
    
    data = []
    for ffrdc_id, ffrdc_name in ffrdcs:
        headcount = random.randint(250, 500)
        for month in months:
            bench = int(headcount * random.uniform(0.05, 0.18))
            bench_pct = bench / headcount * 100
            status = "healthy" if bench_pct < 10 else "attention" if bench_pct < 15 else "critical"
            
            data.append((ffrdc_id, ffrdc_name, month, headcount, bench, float(bench_pct), status))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("ffrdc_name", StringType(), False),
        StructField("month", DateType(), False),
        StructField("total_headcount", IntegerType(), False),
        StructField("bench_count", IntegerType(), False),
        StructField("bench_pct", DoubleType(), False),
        StructField("status", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_turnover_trend", comment="Raw turnover trend data")
def raw_turnover_trend():
    import random
    random.seed(68)
    
    ffrdcs = [("cisa", "CISA"), ("cms", "CMS"), ("dhs", "DHS"), ("dod", "DoD"), ("faa", "FAA"), ("irs", "IRS")]
    periods = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"]
    
    data = []
    for ffrdc_id, ffrdc_name in ffrdcs:
        for period in periods:
            vol = random.uniform(8, 16)
            invol = random.uniform(1, 4)
            total = vol + invol
            benchmark = 13.5
            
            data.append((ffrdc_id, ffrdc_name, period, float(total), float(vol), float(invol), benchmark))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("ffrdc_name", StringType(), False),
        StructField("period", StringType(), False),
        StructField("turnover_rate", DoubleType(), False),
        StructField("voluntary_rate", DoubleType(), False),
        StructField("involuntary_rate", DoubleType(), False),
        StructField("industry_benchmark", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_control_exception_trend", comment="Raw control exception trend")
def raw_control_exception_trend():
    import random
    random.seed(69)
    
    today = date.today()
    months = [date(today.year, today.month, 1) - relativedelta(months=i) for i in range(12)]
    
    data = []
    for month in months:
        unusual = random.randint(5, 20)
        failed = random.randint(2, 10)
        resolved = random.randint(3, 15)
        net = unusual + failed - resolved
        
        data.append((month, unusual, failed, resolved, max(0, net)))
    
    schema = StructType([
        StructField("month", DateType(), False),
        StructField("unusual_entries", IntegerType(), False),
        StructField("failed_tests", IntegerType(), False),
        StructField("resolved", IntegerType(), False),
        StructField("net_open", IntegerType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_gl_exception", comment="Raw GL exceptions")
def raw_gl_exception():
    import random
    random.seed(70)
    
    accounts = ["1000-Cash", "2000-AP", "3000-Revenue", "4000-Expense", "5000-Payroll"]
    ffrdcs = ["cisa", "cms", "dhs", "dod", "faa", "irs"]
    statuses = ["open", "under_review", "resolved", "escalated"]
    severities = ["low", "medium", "high", "critical"]
    today = date.today()
    
    data = []
    for i in range(12):
        exc_date = today - relativedelta(days=random.randint(1, 60))
        
        data.append((
            f"exc-{i+1}",
            exc_date,
            f"Exception description {i+1}",
            float(random.uniform(5000, 500000)),
            random.choice(accounts),
            random.choice(ffrdcs),
            random.choice(statuses),
            random.choice(severities)
        ))
    
    schema = StructType([
        StructField("exception_id", StringType(), False),
        StructField("exception_date", DateType(), False),
        StructField("description", StringType(), False),
        StructField("amount", DoubleType(), False),
        StructField("account", StringType(), False),
        StructField("ffrdc_id", StringType(), False),
        StructField("status", StringType(), False),
        StructField("severity", StringType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_covenant_compliance", comment="Raw covenant compliance")
def raw_covenant_compliance():
    today = date.today()
    data = [
        (today, "Debt-to-Equity Ratio", 2.0, 1.5, "compliant", 0.5, 25.0),
        (today, "Current Ratio", 1.5, 2.1, "compliant", 0.6, 40.0),
        (today, "Interest Coverage", 3.0, 4.2, "compliant", 1.2, 40.0),
        (today, "Working Capital", 50_000_000.0, 82_000_000.0, "compliant", 32_000_000.0, 64.0),
        (today, "Revenue Floor", 500_000_000.0, 575_000_000.0, "compliant", 75_000_000.0, 15.0),
    ]
    schema = StructType([
        StructField("as_of_date", DateType(), False),
        StructField("covenant", StringType(), False),
        StructField("threshold", DoubleType(), False),
        StructField("current_value", DoubleType(), False),
        StructField("status", StringType(), False),
        StructField("headroom", DoubleType(), False),
        StructField("headroom_pct", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)


@dlt.table(name="raw_budget_variance", comment="Raw budget variance by root cause")
def raw_budget_variance():
    import random
    random.seed(71)
    
    ffrdcs = [("cisa", "CISA"), ("cms", "CMS"), ("dhs", "DHS"), ("dod", "DoD"), ("faa", "FAA"), ("irs", "IRS")]
    today = date.today()
    month = date(today.year, today.month, 1)
    
    data = []
    for ffrdc_id, ffrdc_name in ffrdcs:
        labor = random.uniform(-500000, 800000)
        material = random.uniform(-200000, 400000)
        subcontract = random.uniform(-300000, 500000)
        overhead = random.uniform(-150000, 300000)
        total = labor + material + subcontract + overhead
        
        data.append((ffrdc_id, ffrdc_name, month, float(labor), float(material), float(subcontract), float(overhead), float(total)))
    
    schema = StructType([
        StructField("ffrdc_id", StringType(), False),
        StructField("ffrdc_name", StringType(), False),
        StructField("month", DateType(), False),
        StructField("labor_variance", DoubleType(), False),
        StructField("material_variance", DoubleType(), False),
        StructField("subcontract_variance", DoubleType(), False),
        StructField("overhead_variance", DoubleType(), False),
        StructField("total_variance", DoubleType(), False),
    ])
    return spark.createDataFrame(data, schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Fact Tables

# COMMAND ----------

@dlt.table(name="dim_ffrdc", comment="FFRDC dimension")
def dim_ffrdc():
    return dlt.read("raw_ffrdc")

@dlt.table(name="dim_sponsor", comment="Sponsor dimension")
def dim_sponsor():
    return dlt.read("raw_sponsor")

@dlt.table(name="fact_audit_finding", comment="Audit findings")
@dlt.expect_or_fail("valid_finding_id", "finding_id IS NOT NULL")
def fact_audit_finding():
    return dlt.read("raw_audit_finding")

@dlt.table(name="fact_control_test", comment="Control test results")
def fact_control_test():
    return dlt.read("raw_control_test")

@dlt.table(name="fact_revrec", comment="Revenue recognition schedule")
def fact_revrec():
    return dlt.read("raw_revrec")

@dlt.table(name="fact_compliance_event", comment="Compliance events")
def fact_compliance_event():
    return dlt.read("raw_compliance_event")

@dlt.table(name="fact_revenue_concentration", comment="Revenue concentration")
def fact_revenue_concentration():
    return dlt.read("raw_revenue_concentration")

@dlt.table(name="fact_key_person_dependency", comment="Key person dependencies")
def fact_key_person_dependency():
    return dlt.read("raw_key_person_dependency")

@dlt.table(name="fact_gl_exception", comment="GL exceptions")
def fact_gl_exception():
    return dlt.read("raw_gl_exception")

@dlt.table(name="fact_covenant_compliance", comment="Covenant compliance")
def fact_covenant_compliance():
    return dlt.read("raw_covenant_compliance")

@dlt.table(name="fact_budget_variance", comment="Budget variance")
def fact_budget_variance():
    return dlt.read("raw_budget_variance")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gold Layer - Visualization Marts

# COMMAND ----------

@dlt.table(name="gold_findings_aging", comment="Findings aging - powers FindingsAgingChart")
def gold_findings_aging():
    findings = dlt.read("fact_audit_finding")
    today = date.today()
    
    return (
        findings
        .filter(F.col("status").isin(["open", "in_progress"]))
        .withColumn("age_bucket",
            F.when(F.col("age_days") <= 30, "0-30")
             .when(F.col("age_days") <= 60, "31-60")
             .when(F.col("age_days") <= 90, "61-90")
             .otherwise(">90"))
        .withColumn("risk_weight",
            F.when(F.col("risk_level") == "critical", 4)
             .when(F.col("risk_level") == "high", 3)
             .when(F.col("risk_level") == "medium", 2)
             .otherwise(1))
        .groupBy("age_bucket")
        .agg(
            F.count("*").alias("finding_count"),
            F.sum("risk_weight").alias("risk_weighted")
        )
        .withColumn("as_of_date", F.lit(today))
        .select("as_of_date", "age_bucket", "finding_count", "risk_weighted")
    )


@dlt.table(name="gold_root_cause_tags", comment="Root cause tags - powers RootCauseTagsChart")
def gold_root_cause_tags():
    findings = dlt.read("fact_audit_finding")
    today = date.today()
    
    total = findings.count()
    
    return (
        findings
        .groupBy("root_cause")
        .agg(F.count("*").alias("finding_count"))
        .withColumn("percentage", F.col("finding_count") / F.lit(total) * 100)
        .withColumn("as_of_date", F.lit(today))
        .select("as_of_date", F.col("root_cause").alias("root_cause_tag"), "finding_count", "percentage")
    )


@dlt.table(name="gold_control_effectiveness", comment="Control effectiveness - powers ControlEffectivenessChart")
def gold_control_effectiveness():
    tests = dlt.read("fact_control_test")
    today = date.today()
    
    return (
        tests
        .groupBy("control_domain")
        .agg(
            F.sum(F.when(F.col("effectiveness_score") >= 0.8, 1).otherwise(0)).alias("effective_count"),
            F.sum(F.when((F.col("effectiveness_score") >= 0.5) & (F.col("effectiveness_score") < 0.8), 1).otherwise(0)).alias("needs_improvement_count"),
            F.sum(F.when(F.col("effectiveness_score") < 0.5, 1).otherwise(0)).alias("ineffective_count"),
            F.avg("effectiveness_score").alias("effectiveness_rate")
        )
        .withColumn("as_of_date", F.lit(today))
        .select("as_of_date", "control_domain", "effective_count", "needs_improvement_count", "ineffective_count", "effectiveness_rate")
    )


@dlt.table(name="gold_revrec_schedule", comment="Rev rec schedule - powers RevRecScheduleChart")
def gold_revrec_schedule():
    return dlt.read("fact_revrec")


@dlt.table(name="gold_compliance_calendar", comment="Compliance calendar - powers ComplianceCalendarTable")
def gold_compliance_calendar():
    return dlt.read("fact_compliance_event")


@dlt.table(name="gold_sponsor_concentration", comment="Sponsor concentration - powers TopSponsorsConcentrationChart")
def gold_sponsor_concentration():
    return dlt.read("fact_revenue_concentration")


@dlt.table(name="gold_diversification_geo", comment="Geographic diversification - powers DiversificationChart")
def gold_diversification_geo():
    return dlt.read("raw_diversification_geo")


@dlt.table(name="gold_diversification_mission_area", comment="Mission area diversification - powers DiversificationChart")
def gold_diversification_mission_area():
    return dlt.read("raw_diversification_mission")


@dlt.table(name="gold_retention_trend", comment="Retention trend - powers RetentionTrendChart")
def gold_retention_trend():
    return dlt.read("raw_retention_trend")


@dlt.table(name="gold_key_person_dependencies", comment="Key person dependencies - powers KeyPersonDependencyTable")
def gold_key_person_dependencies():
    return dlt.read("fact_key_person_dependency")


@dlt.table(name="gold_bench_utilization", comment="Bench utilization - powers BenchUtilizationChart")
def gold_bench_utilization():
    return dlt.read("raw_bench_utilization")


@dlt.table(name="gold_turnover_trend", comment="Turnover trend - powers TurnoverRateChart")
def gold_turnover_trend():
    return dlt.read("raw_turnover_trend")


@dlt.table(name="gold_control_exceptions_trend", comment="Control exceptions trend - powers ControlExceptionsTrendChart")
def gold_control_exceptions_trend():
    return dlt.read("raw_control_exception_trend")


@dlt.table(name="gold_failed_audit_tests", comment="Failed audit tests - powers FailedAuditTestsChart")
def gold_failed_audit_tests():
    tests = dlt.read("fact_control_test")
    today = date.today()
    
    return (
        tests
        .groupBy("control_domain")
        .agg(
            F.count("*").alias("test_count"),
            F.sum(F.when(F.col("passed") == False, 1).otherwise(0)).alias("failed_count")
        )
        .withColumn("pass_rate", (F.col("test_count") - F.col("failed_count")) / F.col("test_count") * 100)
        .withColumn("as_of_date", F.lit(today))
        .select("as_of_date", "control_domain", "test_count", "failed_count", "pass_rate")
    )


@dlt.table(name="gold_gl_exceptions", comment="GL exceptions - powers GLExceptionsTable")
def gold_gl_exceptions():
    return dlt.read("fact_gl_exception")


@dlt.table(name="gold_covenant_compliance", comment="Covenant compliance - powers CovenantComplianceTable")
def gold_covenant_compliance():
    return dlt.read("fact_covenant_compliance")


@dlt.table(name="gold_budget_variance_root_cause", comment="Budget variance by root cause - powers BudgetVarianceRootCauseChart")
def gold_budget_variance_root_cause():
    return dlt.read("fact_budget_variance")

