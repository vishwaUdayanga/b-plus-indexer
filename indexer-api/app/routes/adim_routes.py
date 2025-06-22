from fastapi import APIRouter, Depends
from app.controllers.adim_controller import get_adim_schedules
from app.schemas.adim import ADIMScheduleResponse
from app.database.session import get_b_plus_db
from app.middleware.auth import auth_wrapper

router = APIRouter()

@router.get("/adim/schedules", response_model=ADIMScheduleResponse, tags=["ADIM Schedules"], dependencies=[Depends(auth_wrapper)])
async def adim_schedules_endpoint(db=Depends(get_b_plus_db)):
    """
    Endpoint to retrieve ADIM schedules.
    Returns a JSON response with the schedules.
    """
    return get_adim_schedules(db)