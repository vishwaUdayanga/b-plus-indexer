from pydantic import BaseModel
from typing import List
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
    scope: str


class Schedules(BaseModel):
    tc_query_id: int
    next_execution_time: datetime


class ADIMScheduleResponse(BaseModel):
    schedules: List[Schedules]

class CreateIndexRequest(BaseModel):
    tc_query_id: int