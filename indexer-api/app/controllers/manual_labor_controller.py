from sqlalchemy.orm import Session
from app.models.tc_query import TCQuery
from app.schemas.manual_labor import DeleteTimeConsumingQueryRequest
from fastapi import HTTPException, status


def delete_time_consuming_query(db: Session, request: DeleteTimeConsumingQueryRequest) -> None:
    """
    Deletes a time-consuming query based on the provided query ID.

    :param db: Database session
    :param request: Request containing the query ID to delete
    :raises HTTPException: If the query does not exist or cannot be deleted
    """
    query = db.query(TCQuery).filter(TCQuery.id == request.query_id).first()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time-consuming query not found"
        )
    db.delete(query)
    db.commit()