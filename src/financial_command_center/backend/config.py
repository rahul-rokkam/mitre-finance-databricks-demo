from importlib import resources
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from pydantic import Field
from typing import Optional
from dotenv import load_dotenv
from .._metadata import app_name, app_slug

# project root is the parent of the src folder
project_root = Path(__file__).parent.parent.parent.parent
env_file = project_root / ".env"

if env_file.exists():
    load_dotenv(dotenv_path=env_file)


class AppConfig(BaseSettings):
    model_config: SettingsConfigDict = SettingsConfigDict(
        env_file=env_file, env_prefix=f"{app_slug.upper()}_", extra="ignore"
    )
    app_name: str = Field(default=app_name)
    api_prefix: str = Field(default="/api")
    
    # Genie Space IDs for each schema
    genie_space_financial_health: Optional[str] = Field(
        default=None, 
        description="Genie Space ID for financial-health schema"
    )
    genie_space_program_portfolio: Optional[str] = Field(
        default=None,
        description="Genie Space ID for program-portfolio schema"
    )
    genie_space_sponsor_funding: Optional[str] = Field(
        default=None,
        description="Genie Space ID for sponsor-funding schema"
    )
    genie_space_risk_compliance: Optional[str] = Field(
        default=None,
        description="Genie Space ID for risk-compliance schema"
    )
    genie_space_government_relations: Optional[str] = Field(
        default=None,
        description="Genie Space ID for government-relations schema"
    )

    @property
    def static_assets_path(self) -> Path:
        return Path(str(resources.files(app_slug))).joinpath("__dist__")
    
    def get_genie_space_id(self, schema_name: str) -> Optional[str]:
        """Get the Genie Space ID for a given schema name"""
        mapping = {
            "financial-health": self.genie_space_financial_health,
            "program-portfolio": self.genie_space_program_portfolio,
            "sponsor-funding": self.genie_space_sponsor_funding,
            "risk-compliance": self.genie_space_risk_compliance,
            "government-relations": self.genie_space_government_relations,
        }
        return mapping.get(schema_name)
    
    def get_all_genie_spaces(self) -> dict[str, dict]:
        """Get all configured Genie spaces"""
        spaces = {}
        schema_configs = [
            ("financial-health", self.genie_space_financial_health, "Financial Health"),
            ("program-portfolio", self.genie_space_program_portfolio, "Program Portfolio"),
            ("sponsor-funding", self.genie_space_sponsor_funding, "Sponsor Funding"),
            ("risk-compliance", self.genie_space_risk_compliance, "Risk & Compliance"),
            ("government-relations", self.genie_space_government_relations, "Government Relations"),
        ]
        for schema_name, space_id, display_name in schema_configs:
            if space_id:
                spaces[schema_name] = {
                    "schema_name": schema_name,
                    "space_id": space_id,
                    "display_name": display_name,
                }
        return spaces


conf = AppConfig()
