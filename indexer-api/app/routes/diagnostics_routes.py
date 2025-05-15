from fastapi import APIRouter, Depends
from app.controllers.diagnostics_controller import run_diagnostics
from app.database.session import get_org_db
from app.middleware.auth import auth_wrapper

router = APIRouter()

@router.get("/diagnostics", tags=["Run Diagnostics"], dependencies=[Depends(auth_wrapper)])
async def run_diagnostics_endpoint(db=Depends(get_org_db)):
    """
    Endpoint to run diagnostics on the organization database.
    Returns a JSON response with the results of the diagnostics.
    """
    return run_diagnostics(db)
