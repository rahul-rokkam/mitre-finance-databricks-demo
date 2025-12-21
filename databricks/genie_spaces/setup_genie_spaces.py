# Databricks notebook source
# MAGIC %md
# MAGIC # Setup Genie Spaces for Financial Command Center
# MAGIC 
# MAGIC This notebook creates 5 Genie spaces, one for each schema in the Financial Command Center:
# MAGIC - Financial Health
# MAGIC - Program Portfolio
# MAGIC - Sponsor Funding
# MAGIC - Risk & Compliance
# MAGIC - Government Relations
# MAGIC 
# MAGIC Each Genie space is configured with all tables from its corresponding schema.

# COMMAND ----------

# MAGIC %pip install databricks-sdk --upgrade
# MAGIC dbutils.library.restartPython()

# COMMAND ----------

import json
import requests
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.catalog import TableType

# COMMAND ----------

# Configuration
CATALOG = "treasury_corporate_financial_catalog"

SCHEMA_CONFIGS = {
    "financial-health": {
        "display_name": "Financial Health",
        "description": "Ask questions about financial KPIs, revenue/budget performance, margins, and cash position across FFRDCs.",
        "instructions": """This Genie space helps analyze financial health data for the Financial Command Center.

Key concepts:
- FFRDC: Federally Funded Research and Development Center
- DSO: Days Sales Outstanding - measures how quickly receivables are collected
- Indirect Rate: Overhead costs applied to programs (should stay under cap)
- Revenue vs Budget: Actual revenue compared to budgeted amounts
- Gross Margin: Revenue minus direct costs as a percentage

All monetary values are in USD. Fiscal year runs October to September.
When analyzing trends, consider both YTD (year-to-date) and full year projections.""",
        "sample_questions": [
            "What is our current revenue vs budget performance by FFRDC?",
            "Show me the top 5 programs by gross margin",
            "What is our DSO trend over the past 6 months?",
            "Which FFRDCs have indirect rates approaching the cap?",
            "What is our total cash position?",
            "Compare actual vs forecasted revenue by quarter",
        ]
    },
    "program-portfolio": {
        "display_name": "Program Portfolio",
        "description": "Ask questions about program portfolio performance, sponsor allocations, FFRDC economics, and sponsor health metrics.",
        "instructions": """This Genie space analyzes program portfolio and sponsor funding data.

Key concepts:
- Sponsor: Government agency or organization funding programs
- FFRDC: Federally Funded Research and Development Center
- Allocation: How funding is distributed across FFRDCs
- CPI: Cost Performance Index - measures cost efficiency (1.0 = on budget)
- Program Health: Overall assessment of program performance

Sponsors are typically government agencies (DoD, DOE, NASA, etc.).
Programs can span multiple FFRDCs.
Look at both current allocations and historical trends.""",
        "sample_questions": [
            "How is funding allocated across FFRDCs by sponsor?",
            "Which sponsors have the highest allocation this fiscal year?",
            "Show me program health status by category",
            "What is the cost performance index trend by sponsor?",
            "Which programs have the highest revenue growth?",
            "Compare FFRDC economics - revenue vs cost of delivery",
        ]
    },
    "sponsor-funding": {
        "display_name": "Sponsor Funding & Cost Stewardship",
        "description": "Ask questions about cost stewardship metrics, efficiency indicators, sponsor experience, and funding sustainability.",
        "instructions": """This Genie space focuses on sponsor funding management and cost stewardship.

Key concepts:
- Stewardship: Responsible management of sponsor funds
- Utilization: Percentage of available capacity being used
- Overhead Rate: Indirect costs as percentage of direct costs
- Cost per FTE: Total cost divided by full-time equivalent staff
- NPS: Net Promoter Score - measures sponsor satisfaction
- Renewal Rate: Percentage of contracts that get renewed

Focus on efficiency and value delivery to sponsors.
Lower overhead rates and higher utilization are generally positive.
Track trends over time to identify improvements or concerns.""",
        "sample_questions": [
            "What is our utilization rate by sponsor?",
            "Show me the cost per FTE trend across FFRDCs",
            "Which sponsors have the highest satisfaction scores?",
            "What is our indirect rate performance vs cap?",
            "Show contract renewal rates by sponsor",
            "Compare overhead costs across FFRDCs",
        ]
    },
    "risk-compliance": {
        "display_name": "Risk & Compliance",
        "description": "Ask questions about audit findings, concentration risk, talent risk, control exceptions, and compliance status.",
        "instructions": """This Genie space monitors risk and compliance across the organization.

Key concepts:
- Audit Finding: Issues identified during internal or external audits
- Concentration Risk: Over-dependence on a single sponsor or revenue source
- Talent Risk: Risk from key personnel departures or skill gaps
- Control Exception: Deviations from established control procedures
- Remediation: Actions taken to address findings or exceptions

Severity levels: Critical, High, Medium, Low.
Aging: How long issues have been open.
Focus on trends and remediation progress.
Concentration thresholds: >25% from single sponsor = high risk.""",
        "sample_questions": [
            "How many open audit findings do we have by severity?",
            "What is our concentration risk by sponsor?",
            "Show me control exceptions by category",
            "What is the audit finding remediation rate?",
            "Which areas have the highest talent risk?",
            "Show aging analysis of open findings",
        ]
    },
    "government-relations": {
        "display_name": "Government Relations & Strategic Positioning",
        "description": "Ask questions about market share, competitive positioning, win/loss analysis, capability gaps, and strategic pipeline.",
        "instructions": """This Genie space analyzes government relations and strategic positioning.

Key concepts:
- Market Share: Our percentage of total addressable market by agency
- Win Rate: Percentage of competitive bids won
- Capability Gap: Areas where we lack required skills or certifications
- Strategic Pipeline: Future opportunities being pursued
- Competitor Analysis: How we compare to other FFRDCs and contractors

Focus on strategic growth and competitive positioning.
Analyze trends in win rates and market share.
Identify capability gaps that limit our competitiveness.
Pipeline value should be 3-5x annual revenue target.""",
        "sample_questions": [
            "What is our market share by government agency?",
            "Show me win/loss analysis by mission area",
            "What are our top capability gaps?",
            "What is the total value of our strategic pipeline?",
            "Which competitors are we losing to most often?",
            "Show pipeline opportunities by probability and value",
        ]
    }
}

# COMMAND ----------

def get_tables_for_schema(catalog: str, schema: str) -> list[str]:
    """Get all tables in a schema using Unity Catalog"""
    w = WorkspaceClient()
    tables = []
    
    try:
        for table in w.tables.list(catalog_name=catalog, schema_name=schema):
            if table.table_type in [TableType.MANAGED, TableType.EXTERNAL]:
                tables.append(f"{catalog}.`{schema}`.{table.name}")
    except Exception as e:
        print(f"Warning: Could not list tables for {catalog}.{schema}: {e}")
    
    return tables

# COMMAND ----------

def create_genie_space(
    name: str,
    description: str,
    instructions: str,
    sample_questions: list[str],
    tables: list[str],
    warehouse_id: str = None
) -> dict:
    """Create a Genie space using the REST API"""
    w = WorkspaceClient()
    
    # Build the serialized space configuration
    space_config = {
        "version": 1,
        "config": {
            "sample_questions": [
                {"id": f"q{i+1}", "question": [q]}
                for i, q in enumerate(sample_questions)
            ],
            "instructions": instructions
        },
        "data_sources": {
            "tables": [
                {"identifier": table}
                for table in tables
            ]
        }
    }
    
    # Serialize the config to JSON string
    serialized_space = json.dumps(space_config)
    
    # Build the request payload
    payload = {
        "name": name,
        "description": description,
        "serialized_space": serialized_space
    }
    
    if warehouse_id:
        payload["warehouse_id"] = warehouse_id
    
    # Get the workspace URL and token
    host = w.config.host
    token = w.config.token
    
    # Make the API request
    response = requests.post(
        f"{host}/api/2.0/genie/spaces",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to create Genie space: {response.status_code} - {response.text}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Get SQL Warehouse ID
# MAGIC 
# MAGIC You need a SQL warehouse to power the Genie spaces. List available warehouses and select one:

# COMMAND ----------

def list_sql_warehouses():
    """List available SQL warehouses"""
    w = WorkspaceClient()
    warehouses = list(w.warehouses.list())
    
    print("Available SQL Warehouses:")
    print("-" * 60)
    for wh in warehouses:
        status = "✅ RUNNING" if wh.state.value == "RUNNING" else f"⚪ {wh.state.value}"
        print(f"  {wh.id}: {wh.name} ({wh.cluster_size}) - {status}")
    
    return warehouses

warehouses = list_sql_warehouses()

# COMMAND ----------

# MAGIC %md
# MAGIC ## Set Warehouse ID
# MAGIC 
# MAGIC Set the warehouse ID from the list above (use a Pro or Serverless warehouse):

# COMMAND ----------

# Replace with your warehouse ID from the list above
WAREHOUSE_ID = dbutils.widgets.get("warehouse_id") if "warehouse_id" in [w.name for w in dbutils.widgets.list()] else None

if not WAREHOUSE_ID:
    dbutils.widgets.text("warehouse_id", "", "SQL Warehouse ID")
    print("⚠️  Please enter your SQL Warehouse ID in the widget above and re-run this cell")
else:
    print(f"✅ Using warehouse: {WAREHOUSE_ID}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Create Genie Spaces
# MAGIC 
# MAGIC This will create all 5 Genie spaces:

# COMMAND ----------

def create_all_genie_spaces(catalog: str, warehouse_id: str) -> dict[str, str]:
    """Create all Genie spaces and return mapping of schema -> space_id"""
    created_spaces = {}
    
    for schema_name, config in SCHEMA_CONFIGS.items():
        print(f"\n{'='*60}")
        print(f"Creating Genie space for: {config['display_name']}")
        print(f"{'='*60}")
        
        # Get tables for this schema
        tables = get_tables_for_schema(catalog, schema_name)
        
        if not tables:
            print(f"⚠️  No tables found in {catalog}.`{schema_name}` - skipping")
            continue
        
        print(f"📊 Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table}")
        
        # Create the Genie space
        try:
            result = create_genie_space(
                name=f"Financial Command Center - {config['display_name']}",
                description=config["description"],
                instructions=config["instructions"],
                sample_questions=config["sample_questions"],
                tables=tables,
                warehouse_id=warehouse_id
            )
            
            space_id = result.get("space_id") or result.get("id")
            created_spaces[schema_name] = space_id
            print(f"✅ Created Genie space: {space_id}")
            
        except Exception as e:
            print(f"❌ Failed to create Genie space: {e}")
    
    return created_spaces

# Run the creation
if WAREHOUSE_ID:
    space_ids = create_all_genie_spaces(CATALOG, WAREHOUSE_ID)
else:
    print("⚠️  Please set WAREHOUSE_ID first")
    space_ids = {}

# COMMAND ----------

# MAGIC %md
# MAGIC ## Configuration Output
# MAGIC 
# MAGIC Copy these values to your `app.yml` file:

# COMMAND ----------

if space_ids:
    print("\n" + "="*60)
    print("📋 ADD TO YOUR app.yml FILE:")
    print("="*60)
    print("""
env:""")
    
    env_mapping = {
        "financial-health": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_FINANCIAL_HEALTH",
        "program-portfolio": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_PROGRAM_PORTFOLIO", 
        "sponsor-funding": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_SPONSOR_FUNDING",
        "risk-compliance": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_RISK_COMPLIANCE",
        "government-relations": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_GOVERNMENT_RELATIONS",
    }
    
    for schema_name, space_id in space_ids.items():
        env_var = env_mapping.get(schema_name, f"GENIE_SPACE_{schema_name.upper().replace('-', '_')}")
        print(f'  - name: {env_var}')
        print(f'    value: "{space_id}"')
    
    print("\n" + "="*60)
    print("📋 FOR .env FILE (local development):")
    print("="*60)
    for schema_name, space_id in space_ids.items():
        env_var = env_mapping.get(schema_name, f"GENIE_SPACE_{schema_name.upper().replace('-', '_')}")
        print(f'{env_var}="{space_id}"')

# COMMAND ----------

# MAGIC %md
# MAGIC ## Grant Permissions
# MAGIC 
# MAGIC After creating the Genie spaces, you need to grant permissions to the app's service principal.
# MAGIC Run this SQL to grant access:

# COMMAND ----------

if space_ids:
    print("Run these commands to grant permissions to your app's service principal:\n")
    
    for schema_name, space_id in space_ids.items():
        print(f"-- Grant access to {schema_name} Genie space")
        print(f"-- Replace YOUR_SERVICE_PRINCIPAL with your app's service principal")
        print(f"-- This needs to be done via the Genie space UI or API")
        print()

    print("""
To grant permissions:
1. Go to each Genie space in the Databricks UI
2. Click the 'Share' button
3. Add your app's service principal with 'Can Run' permission
4. Also ensure the service principal has:
   - 'Can Use' on the SQL warehouse
   - 'SELECT' on all tables in each schema
""")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Verify Genie Spaces
# MAGIC 
# MAGIC List all created Genie spaces:

# COMMAND ----------

def list_genie_spaces():
    """List all Genie spaces"""
    w = WorkspaceClient()
    host = w.config.host
    token = w.config.token
    
    response = requests.get(
        f"{host}/api/2.0/genie/spaces",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        spaces = response.json().get("spaces", [])
        print(f"\n📊 Found {len(spaces)} Genie spaces:\n")
        for space in spaces:
            name = space.get("name", "Unknown")
            space_id = space.get("id") or space.get("space_id")
            print(f"  • {name}")
            print(f"    ID: {space_id}")
            print()
        return spaces
    else:
        print(f"Failed to list spaces: {response.status_code} - {response.text}")
        return []

list_genie_spaces()

