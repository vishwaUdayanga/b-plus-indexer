from pydantic import BaseModel
from typing import List

class DeleteTimeConsumingQueryRequest(BaseModel):
    query_id: int

class IndexStatus(BaseModel):
    index_name: str
    status: str
    
class IndexStatusResponse(BaseModel):
    indexes: List[IndexStatus]

class StatQuery(BaseModel):
    query_id: str
    query: str

class StatQueryResponse(BaseModel):
    queries: List[StatQuery]

class CreateTCQueryRequest(BaseModel):
    query_id: str