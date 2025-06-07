from fastapi import APIRouter, Depends
from app.controllers.health_check_controller import return_health_check_for_api, return_health_check_for_organization_db, return_health_check_for_b_plus_db
from app.database.session import get_org_db, get_b_plus_db
from app.middleware.auth import auth_wrapper


router = APIRouter()

@router.get("/health_check_api", tags=["Health Checks"])
async def health_check_api():
    """
    Health check endpoint to verify the status of the API.
    Returns a JSON response with the status of the API.
    """
    return return_health_check_for_api()

@router.get("/health_check_organization_db", tags=["Health Checks"])
async def health_check_organization_db(db=Depends(get_org_db)):
    """
    Health check endpoint to verify the status of the organization database.
    Returns a JSON response with the status of the database connection.
    """
    return return_health_check_for_organization_db(db)

@router.get("/health_check_b_plus_db", tags=["Health Checks"])
async def health_check_b_plus_db(db=Depends(get_b_plus_db)):
    """
    Health check endpoint to verify the status of the indexer database.
    Returns a JSON response with the status of the database connection.
    """
    return return_health_check_for_b_plus_db(db)

@router.get("/health_check_token_verification", tags=["Health Checks"], dependencies=[Depends(auth_wrapper)])
async def health_check_token_verification():
    """
    Health check endpoint to verify the status of the token verification.
    Returns a JSON response with the status of the token verification.
    """
    return {"status": "Token verification is working correctly."}
