from fastapi import APIRouter
from app.controllers.dba_controller import authenticate_dba
from app.schemas.dba import LoginRequest, LoginResponse

router = APIRouter()

@router.post("/dba/login", response_model=LoginResponse, tags=["DBA Login"])
def dba_login(dba: LoginRequest):
    """
    Endpoint for DBA login.
    Authenticates the DBA using the provided credentials and returns a JWT token.
    """
    return authenticate_dba(dba)