from app.database.session import get_b_plus_db
from app.middleware.auth import auth_wrapper
from app.schemas.manual_labor import DeleteTimeConsumingQueryRequest
from fastapi import APIRouter, Depends, HTTPException, status
from app.controllers.manual_labor_controller import delete_time_consuming_query

router = APIRouter()

@router.delete("/queries/{query_id}", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)])
def delete_query(query_id: int, db_b_plus=Depends(get_b_plus_db)):
    request = DeleteTimeConsumingQueryRequest(query_id=query_id)
    delete_time_consuming_query(db_b_plus, request)
    return {"message": "Time-consuming query deleted successfully"}
