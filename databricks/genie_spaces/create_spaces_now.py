#!/usr/bin/env python3
"""Create Genie spaces for the Financial Command Center"""
from __future__ import annotations

import json
import subprocess
import sys
import uuid
from typing import Optional


def generate_uuid() -> str:
    """Generate a UUID in the format expected by Databricks (lowercase hex without hyphens)"""
    return uuid.uuid4().hex

CATALOG = "treasury_corporate_financial_catalog"
WAREHOUSE_ID = "bd5e4480c6fb4091"
DATABRICKS_HOST = "https://fevm-treasury-corporate-financial.cloud.databricks.com"


def get_token() -> Optional[str]:
    """Get Databricks auth token"""
    result = subprocess.run(
        ["databricks", "auth", "token", "--host", DATABRICKS_HOST],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout)
        return data.get("access_token")
    except json.JSONDecodeError:
        return None

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


def run_cmd(cmd: list) -> str:
    """Run a command and return output"""
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}", file=sys.stderr)
        return ""
    return result.stdout.strip()


def get_tables_for_schema(schema: str) -> list:
    """Get all tables in a schema"""
    output = run_cmd([
        "databricks", "tables", "list",
        CATALOG, schema,
        "--output", "json"
    ])
    if not output:
        return []
    
    try:
        tables = json.loads(output)
        return [t["full_name"] for t in tables if t.get("table_type") in ["MANAGED", "EXTERNAL"]]
    except json.JSONDecodeError:
        return []


def create_genie_space(name: str, description: str, instructions: str, 
                       sample_questions: list, tables: list, token: str) -> Optional[str]:
    """Create a Genie space using the Databricks API"""
    
    # Build the serialized space configuration
    space_config = {
        "version": 1,
        "config": {
            "sample_questions": [
                {"id": generate_uuid(), "question": [q]}
                for q in sample_questions
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
    
    # Build the request payload
    payload = {
        "name": name,
        "description": description,
        "serialized_space": json.dumps(space_config),
        "warehouse_id": WAREHOUSE_ID
    }
    
    # Use curl to make the API call
    payload_json = json.dumps(payload)
    
    result = subprocess.run(
        [
            "curl", "-s", "-X", "POST",
            f"{DATABRICKS_HOST}/api/2.0/genie/spaces",
            "-H", f"Authorization: Bearer {token}",
            "-H", "Content-Type: application/json",
            "-d", payload_json
        ],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"  ❌ Failed: {result.stderr}", file=sys.stderr)
        return None
    
    try:
        response = json.loads(result.stdout)
        if "error" in response or "error_code" in response:
            print(f"  ❌ API Error: {response.get('message', response)}", file=sys.stderr)
            return None
        return response.get("space_id") or response.get("id")
    except json.JSONDecodeError:
        print(f"  ❌ Invalid response: {result.stdout}", file=sys.stderr)
        return None


def main():
    print("🚀 Creating Genie Spaces for Financial Command Center")
    print("=" * 60)
    
    # Get auth token
    print("\n🔐 Getting authentication token...")
    token = get_token()
    if not token:
        print("❌ Failed to get authentication token")
        return {}
    print("✅ Token obtained")
    
    created_spaces = {}
    
    for schema_name, config in SCHEMA_CONFIGS.items():
        print(f"\n📊 {config['display_name']} ({schema_name})")
        print("-" * 40)
        
        # Get tables
        tables = get_tables_for_schema(schema_name)
        if not tables:
            print(f"  ⚠️  No tables found - skipping")
            continue
        
        print(f"  Found {len(tables)} tables")
        
        # Create space
        space_name = f"Financial Command Center - {config['display_name']}"
        space_id = create_genie_space(
            name=space_name,
            description=config["description"],
            instructions=config["instructions"],
            sample_questions=config["sample_questions"],
            tables=tables,
            token=token
        )
        
        if space_id:
            created_spaces[schema_name] = space_id
            print(f"  ✅ Created: {space_id}")
        else:
            print(f"  ❌ Failed to create space")
    
    # Output configuration
    if created_spaces:
        print("\n" + "=" * 60)
        print("📋 UPDATE YOUR app.yml WITH:")
        print("=" * 60)
        
        env_mapping = {
            "financial-health": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_FINANCIAL_HEALTH",
            "program-portfolio": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_PROGRAM_PORTFOLIO", 
            "sponsor-funding": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_SPONSOR_FUNDING",
            "risk-compliance": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_RISK_COMPLIANCE",
            "government-relations": "FINANCIAL_COMMAND_CENTER_GENIE_SPACE_GOVERNMENT_RELATIONS",
        }
        
        print("\nenv:")
        for schema_name, space_id in created_spaces.items():
            env_var = env_mapping[schema_name]
            print(f'  - name: {env_var}')
            print(f'    value: "{space_id}"')
        
        print("\n" + "=" * 60)
        print("📋 FOR .env FILE:")
        print("=" * 60)
        for schema_name, space_id in created_spaces.items():
            env_var = env_mapping[schema_name]
            print(f'{env_var}="{space_id}"')
        
        # Return the space IDs as JSON for further processing
        print("\n" + "=" * 60)
        print("SPACE_IDS_JSON:")
        print(json.dumps(created_spaces))
    
    return created_spaces


if __name__ == "__main__":
    main()

