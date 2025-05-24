from fastapi import APIRouter, Depends
from app.controllers.statistics_controller import get_statistics
from app.database.session import get_b_plus_db
from app.middleware.auth import auth_wrapper

router = APIRouter()

@router.get("/statistics", tags=["Statistics"], dependencies=[Depends(auth_wrapper)])
async def statistics_endpoint(db_b_plus=Depends(get_b_plus_db)):
    """
    Endpoint to retrieve statistics from the database.
    Returns a JSON response with the statistics.
    """
    return get_statistics(db_b_plus)

