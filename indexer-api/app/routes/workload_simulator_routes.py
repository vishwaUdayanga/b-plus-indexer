from fastapi import APIRouter, Depends
from app.controllers.workload_simulator_controller import execute_sql_query
from app.schemas.workload_simulator import WorkloadSimulatorRequest
from app.database.session import get_org_db
from app.middleware.auth import auth_wrapper


router = APIRouter()

@router.post("/workload-simulation", tags=["Workload Simulation"], dependencies=[Depends(auth_wrapper)])
def create_workload_simulation(request: WorkloadSimulatorRequest, db_org=Depends(get_org_db)):
    return execute_sql_query(db_org, request)
