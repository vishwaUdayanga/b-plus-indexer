from sqlalchemy.orm import Session
from sqlalchemy import text

def return_health_check_for_api():
    return {"status": "ok"}

def return_health_check_for_organization_db(db: Session):
    """
    Health check for the organization database.
    Returns a JSON response with the status of the database connection.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def return_health_check_for_b_plus_db(db: Session):
    """
    Health check for the b_plus_indexer database.
    Returns a JSON response with the status of the database connection.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}