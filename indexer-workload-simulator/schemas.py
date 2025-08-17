from pydantic import BaseModel

class WorkLoadSimulatorRequest(BaseModel):
    sql_query: str

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
    scope: str