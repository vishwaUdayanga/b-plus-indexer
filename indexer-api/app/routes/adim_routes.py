from fastapi import APIRouter, Depends
from app.controllers.adim_controller import get_adim_schedules, create_index_using_query_id
from app.schemas.adim import ADIMScheduleResponse, CreateIndexRequest
from app.database.session import get_b_plus_db, get_org_db
from app.middleware.auth import auth_wrapper

router = APIRouter()

@router.get("/adim/schedules", response_model=ADIMScheduleResponse, tags=["ADIM Schedules"], dependencies=[Depends(auth_wrapper)])
async def adim_schedules_endpoint(db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    """
    Endpoint to retrieve ADIM schedules.
    Returns a JSON response with the schedules.
    """
    return get_adim_schedules(db_org, db_b_plus)
    # Return a sample response for testing purposes
    # return ADIMScheduleResponse(
    #     schedules=[
    #         {
    #             "tc_query_id": 54,
    #             "next_execution_time": "2025-06-26T13:42:30"
    #         },
    #         {
    #             "tc_query_id": 57,
    #             "next_execution_time": "2025-06-26T13:44:30"
    #         }
    #     ]
    # )

@router.post("/adim/create_index", tags=["ADIM Schedules"], dependencies=[Depends(auth_wrapper)])
async def create_index_endpoint(request: CreateIndexRequest, db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    """
    Endpoint to create an index using a query ID.
    Accepts a JSON request body with the query ID.
    """
    return create_index_using_query_id(db_org=db_org, db_b_plus=db_b_plus, tc_query_id=request.tc_query_id)