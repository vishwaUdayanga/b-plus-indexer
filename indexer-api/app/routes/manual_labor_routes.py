from app.database.session import get_b_plus_db, get_org_db
from app.middleware.auth import auth_wrapper
from app.schemas.manual_labor import DeleteTimeConsumingQueryRequest, CreateTCQueryRequest
from app.schemas.diagnostics import TCQueryResponse
from fastapi import APIRouter, Depends
from app.schemas.manual_labor import IndexStatusResponse, StatQueryResponse
from app.controllers.manual_labor_controller import delete_time_consuming_query, create_index_using_query_id, delete_index_using_query_id, get_index_status, get_queries_from_pg_stat_statement, add_time_consuming_query

router = APIRouter()

@router.delete("/queries/{query_id}", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)])
def delete_query(query_id: int, db_b_plus=Depends(get_b_plus_db)):
    request = DeleteTimeConsumingQueryRequest(query_id=query_id)
    delete_time_consuming_query(db_b_plus, request)
    return {"message": "Time-consuming query deleted successfully"}

@router.post("/queries/{query_id}/create-indexes", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)])
def create_index(query_id: int, db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    create_index_using_query_id(db_org, db_b_plus, query_id)
    return {"message": "Index creation initiated successfully"}

@router.delete("/queries/{query_id}/delete-indexes", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)])
def delete_index(query_id: int, db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    delete_index_using_query_id(db_org, db_b_plus, query_id)
    return {"message": "Index deletion initiated successfully"}

@router.get("/queries/{query_id}/index-status", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)], response_model=IndexStatusResponse)
def index_status(query_id: int, db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    return get_index_status(db_org, db_b_plus, query_id)

@router.get("/queries/get-queries", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)], response_model=StatQueryResponse)
def get_statements(db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    return get_queries_from_pg_stat_statement(db_org, db_b_plus)

@router.post("/queries/add", tags=["Manual Labor"], dependencies=[Depends(auth_wrapper)], response_model=TCQueryResponse)
def add_query(request: CreateTCQueryRequest, db_org=Depends(get_org_db), db_b_plus=Depends(get_b_plus_db)):
    return add_time_consuming_query(request, db_org, db_b_plus)
