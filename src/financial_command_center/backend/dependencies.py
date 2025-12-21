from databricks.sdk import WorkspaceClient
from fastapi import Header
from typing import Annotated


def get_obo_ws(
    token: Annotated[str | None, Header(alias="X-Forwarded-Access-Token")] = None,
) -> WorkspaceClient:
    """
    Returns a Databricks Workspace client with authentication behalf of user.
    If the request contains an X-Forwarded-Access-Token header, on behalf of user authentication is used.

    Example usage:
    @api.get("/items/")
    async def read_items(obo_ws: Annotated[WorkspaceClient, Depends(get_obo_ws)]):
        # do something with the obo_ws
        ...
    """

    if not token:
        raise ValueError(
            "OBO token is not provided in the header X-Forwarded-Access-Token"
        )

    return WorkspaceClient(
        token=token, auth_type="pat"
    )  # set pat explicitly to avoid issues with SP client


def get_ws_with_fallback(
    token: Annotated[str | None, Header(alias="X-Forwarded-Access-Token")] = None,
) -> WorkspaceClient:
    """
    Returns a Databricks Workspace client.
    Uses OBO token if available, otherwise falls back to service principal credentials.
    
    This is useful for endpoints that can work with either user or SP authentication,
    such as Genie API calls where the SP has been granted access to the Genie spaces.
    """
    if token:
        return WorkspaceClient(token=token, auth_type="pat")
    
    # Fallback to default authentication (service principal in Databricks Apps)
    return WorkspaceClient()
