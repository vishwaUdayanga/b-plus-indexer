from pydantic import BaseModel
from datetime import datetime
from typing import List

class Schedules(BaseModel):
    """
    Represents the schedules data structure.
    """
    tc_query_id: int
    next_execution_time: datetime

class ADIMScheduleResponse(BaseModel):
    """
    Represents the response from the ADIM API schedule endpoint.
    """
    schedules:  List[Schedules] 
