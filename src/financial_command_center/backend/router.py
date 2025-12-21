from typing import Annotated
import time
from fastapi import APIRouter, Depends, HTTPException
from .models import (
    VersionOut,
    GenieSpacesOut,
    GenieSpaceConfigOut,
    GenieMessageIn,
    GenieMessageOut,
    GenieStatusOut,
    GenieQueryResult,
    SchemaType,
)
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.iam import User as UserOut
from databricks.sdk.service.dashboards import GenieMessage
from .dependencies import get_obo_ws, get_ws_with_fallback
from .config import conf

api = APIRouter(prefix=conf.api_prefix)


@api.get("/version", response_model=VersionOut, operation_id="version")
async def version():
    return VersionOut.from_metadata()


@api.get("/current-user", response_model=UserOut, operation_id="currentUser")
def me(obo_ws: Annotated[WorkspaceClient, Depends(get_ws_with_fallback)]):
    return obo_ws.current_user.me()


@api.get("/genie/spaces", response_model=GenieSpacesOut, operation_id="getGenieSpaces")
def get_genie_spaces():
    """Get all configured Genie spaces"""
    spaces_dict = conf.get_all_genie_spaces()
    spaces = {
        k: GenieSpaceConfigOut(**v) for k, v in spaces_dict.items()
    }
    return GenieSpacesOut(spaces=spaces)


@api.post("/genie/message", response_model=GenieMessageOut, operation_id="sendGenieMessage")
def send_genie_message(
    request: GenieMessageIn,
    obo_ws: Annotated[WorkspaceClient, Depends(get_ws_with_fallback)],
):
    """Send a message to the Genie space and wait for response"""
    space_id = conf.get_genie_space_id(request.schema_name.value)
    
    if not space_id:
        raise HTTPException(
            status_code=400,
            detail=f"Genie space not configured for schema: {request.schema_name.value}"
        )
    
    try:
        if request.conversation_id:
            # Continue existing conversation
            response = obo_ws.genie.create_message_and_wait(
                space_id=space_id,
                conversation_id=request.conversation_id,
                content=request.message,
            )
        else:
            # Start new conversation
            conversation = obo_ws.genie.start_conversation_and_wait(
                space_id=space_id,
                content=request.message,
            )
            response = conversation
        
        # Extract the response from the Genie message
        return _parse_genie_response(response, obo_ws, space_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.get(
    "/genie/status/{conversation_id}/{message_id}",
    response_model=GenieStatusOut,
    operation_id="getGenieMessageStatus"
)
def get_genie_message_status(
    conversation_id: str,
    message_id: str,
    schema_name: SchemaType,
    obo_ws: Annotated[WorkspaceClient, Depends(get_ws_with_fallback)],
):
    """Get the status of a Genie message"""
    space_id = conf.get_genie_space_id(schema_name.value)
    
    if not space_id:
        raise HTTPException(
            status_code=400,
            detail=f"Genie space not configured for schema: {schema_name.value}"
        )
    
    try:
        message = obo_ws.genie.get_message(
            space_id=space_id,
            conversation_id=conversation_id,
            message_id=message_id,
        )
        
        result = _parse_genie_response(message, obo_ws, space_id)
        return GenieStatusOut(
            conversation_id=result.conversation_id,
            message_id=result.message_id,
            status=result.status,
            response=result.response,
            query_result=result.query_result,
            error=result.error,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _parse_genie_response(
    response: GenieMessage,
    obo_ws: WorkspaceClient,
    space_id: str,
) -> GenieMessageOut:
    """Parse a Genie response into our output model"""
    status = "pending"
    response_text = ""
    query_result = None
    error = None
    
    if response.status:
        if response.status.value == "COMPLETED":
            status = "completed"
        elif response.status.value in ["FAILED", "CANCELLED"]:
            status = "failed"
            error = response.error.message if response.error else "Unknown error"
    
    # Extract attachments (response text and query results)
    if response.attachments:
        for attachment in response.attachments:
            if attachment.text:
                response_text = attachment.text.content or ""
            if attachment.query:
                # Try to get query results
                try:
                    query_result_response = obo_ws.genie.get_message_query_result(
                        space_id=space_id,
                        conversation_id=response.conversation_id,
                        message_id=response.id,
                    )
                    if query_result_response.statement_response:
                        stmt = query_result_response.statement_response
                        columns = []
                        rows = []
                        
                        if stmt.manifest and stmt.manifest.schema and stmt.manifest.schema.columns:
                            columns = [col.name for col in stmt.manifest.schema.columns if col.name]
                        
                        if stmt.result and stmt.result.data_array:
                            rows = [list(row) for row in stmt.result.data_array]
                        
                        query_result = GenieQueryResult(
                            columns=columns,
                            rows=rows,
                            sql=attachment.query.query,
                        )
                except Exception:
                    # Query result fetch failed, continue without it
                    if attachment.query.query:
                        query_result = GenieQueryResult(
                            columns=[],
                            rows=[],
                            sql=attachment.query.query,
                        )
    
    return GenieMessageOut(
        conversation_id=response.conversation_id,
        message_id=response.id,
        response=response_text,
        status=status,
        query_result=query_result,
        error=error,
    )
