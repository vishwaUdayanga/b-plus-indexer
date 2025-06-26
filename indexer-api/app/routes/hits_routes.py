from fastapi import APIRouter, Depends
from app.controllers.hits_controller import get_hits
from app.schemas.hits import HitsRequest, HitsResponse
from app.database.session import get_b_plus_db
from app.middleware.auth import auth_wrapper

router = APIRouter()

@router.post("/hits", response_model=HitsResponse, tags=["Hits"], dependencies=[Depends(auth_wrapper)])
async def hits_endpoint(request: HitsRequest, db_b_plus=Depends(get_b_plus_db)):
    """
    Endpoint to retrieve query logs based on the provided request parameters.
    
    This will fetch the query logs based on the `tc_query_id`, `duration`, and `optimized` status. Duration is the number of months.
    """
    return get_hits(db=db_b_plus, request=request)