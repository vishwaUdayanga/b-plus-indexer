from pydantic import BaseModel
from typing import List, Optional


class TCQueryResponse(BaseModel):
    id: int
    query: str
    total_exec_time: float
    mean_exec_time: float
    calls: int
    shared_blks_read: int
    temp_blks_written: int
    score: float
    indexes: List[str]
    estimated_time_for_indexes: Optional[float] = None
    next_time_execution: Optional[float] = None
    auto_indexing: Optional[bool] = None

    class Config:
        from_attributes = True


class TCQueriesResponse(BaseModel):
    queries: List[TCQueryResponse]