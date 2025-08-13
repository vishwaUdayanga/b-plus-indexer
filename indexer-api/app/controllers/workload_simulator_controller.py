from sqlalchemy.orm import Session
from app.schemas.workload_simulator import WorkloadSimulatorRequest
from sqlalchemy import text

def execute_sql_query(db: Session, request: WorkloadSimulatorRequest):
    """
    Execute a raw SQL query and return results as a list of dicts.
    """
    result = db.execute(text(request.sql_query))
    
    # Use .mappings() to get dictionary-like rows
    result_list = [dict(row) for row in result.mappings()]
    
    return result_list
