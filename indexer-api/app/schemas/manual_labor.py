from pydantic import BaseModel
from typing import List

class DeleteTimeConsumingQueryRequest(BaseModel):
    query_id: int

class IndexStatus(BaseModel):
    index_name: str
    status: str
    
class IndexStatusResponse(BaseModel):
    indexes: List[IndexStatus]