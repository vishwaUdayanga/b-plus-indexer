from pydantic import BaseModel
from typing import List

class HitsRequest(BaseModel):
    tc_query_id: int
    duration: int
    optimized: bool = True

class QueryLog(BaseModel):
    id: int
    time_stamp: str
    optimized: bool

class HitsResponse(BaseModel):
    query_logs: List[QueryLog]
