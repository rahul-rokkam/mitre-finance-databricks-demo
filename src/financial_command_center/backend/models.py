from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum
from .. import __version__


class VersionOut(BaseModel):
    version: str

    @classmethod
    def from_metadata(cls):
        return cls(version=__version__)


class SchemaType(str, Enum):
    FINANCIAL_HEALTH = "financial-health"
    PROGRAM_PORTFOLIO = "program-portfolio"
    SPONSOR_FUNDING = "sponsor-funding"
    RISK_COMPLIANCE = "risk-compliance"
    GOVERNMENT_RELATIONS = "government-relations"


class GenieSpaceConfigOut(BaseModel):
    """Configuration for a Genie space"""
    schema_name: str
    space_id: str
    display_name: str


class GenieSpacesOut(BaseModel):
    """All configured Genie spaces"""
    spaces: dict[str, GenieSpaceConfigOut]


class GenieMessageIn(BaseModel):
    """Input for sending a message to Genie"""
    schema_name: SchemaType = Field(..., description="The schema to query")
    message: str = Field(..., description="The user's question")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID for follow-ups")


class GenieQueryResult(BaseModel):
    """Query result from Genie"""
    columns: list[str] = Field(default_factory=list)
    rows: list[list] = Field(default_factory=list)
    sql: Optional[str] = None


class GenieMessageOut(BaseModel):
    """Response from Genie"""
    conversation_id: str
    message_id: str
    response: str
    status: Literal["pending", "completed", "failed"]
    query_result: Optional[GenieQueryResult] = None
    error: Optional[str] = None


class GenieStatusOut(BaseModel):
    """Status of a Genie message"""
    conversation_id: str
    message_id: str
    status: Literal["pending", "completed", "failed"]
    response: Optional[str] = None
    query_result: Optional[GenieQueryResult] = None
    error: Optional[str] = None
