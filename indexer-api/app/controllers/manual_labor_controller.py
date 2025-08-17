from sqlalchemy.orm import Session
from app.models.tc_query import TCQuery
from app.schemas.manual_labor import DeleteTimeConsumingQueryRequest, IndexStatus, IndexStatusResponse
from fastapi import HTTPException, status
from sqlalchemy import text


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

def create_index_using_query_id(db_org: Session, db_b_plus: Session, tc_query_id: int) -> None:
    """Create indexes for the given TCQuery ID."""
    # Fetch the TCQuery
    tc_query = db_b_plus.query(TCQuery).filter(TCQuery.id == tc_query_id).first()
    if not tc_query:
        raise HTTPException(status_code=404, detail="TCQuery not found.")

    # Get the index creation SQL commands from the TCQuery
    index_commands = tc_query.indexes
    if not index_commands:
        raise HTTPException(status_code=404, detail="No indexes found for this query.")
    
    # Execute each index creation command
    for command in index_commands:
        try:
            db_org.execute(text(command))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating index: {str(e)}")
    
    # Commit the changes
    db_org.commit()

def delete_index_using_query_id(db_org: Session, db_b_plus: Session, tc_query_id: int) -> None:
    """Delete indexes for the given TCQuery ID."""
    # Fetch the TCQuery
    tc_query = db_b_plus.query(TCQuery).filter(TCQuery.id == tc_query_id).first()
    if not tc_query:
        raise HTTPException(status_code=404, detail="TCQuery not found.")

    # Get the index deletion SQL commands from the TCQuery
    indexes = tc_query.indexes
    if not indexes:
        raise HTTPException(status_code=404, detail="No indexes found for this query.")
    indexes = [index.split()[2] for index in indexes if len(index.split()) > 2]
    if not indexes:
        raise HTTPException(status_code=404, detail="No valid indexes found for this query.")
    
    # Delete the indexes from the database
    for index in indexes:
        db_org.execute(text(f"DROP INDEX IF EXISTS {index}"))
    db_org.commit()

def get_index_status(db_org: Session, db_b_plus: Session, tc_query_id: int) -> IndexStatusResponse:
    """
    Checks the status of indexes for a given TCQuery ID.
    Returns whether each index exists or not.
    """
    # Fetch the TCQuery
    tc_query = db_b_plus.query(TCQuery).filter(TCQuery.id == tc_query_id).first()
    if not tc_query:
        raise HTTPException(status_code=404, detail="TCQuery not found.")

    # Get the index names from the stored CREATE INDEX statements
    indexes_sql = tc_query.indexes
    if not indexes_sql:
        raise HTTPException(status_code=404, detail="No indexes found for this query.")

    # Extract index names
    index_names = [stmt.split()[2] for stmt in indexes_sql if len(stmt.split()) > 2]
    if not index_names:
        raise HTTPException(status_code=404, detail="No valid indexes found for this query.")

    index_status_list = []

    # Check each index in pg_indexes
    for idx_name in index_names:
        result = db_org.execute(
            text("SELECT 1 FROM pg_indexes WHERE indexname = :name"),
            {"name": idx_name}
        ).fetchone()
        
        status = "materialized" if result else "not materialized"
        index_status_list.append(IndexStatus(index_name=idx_name, status=status))

    return IndexStatusResponse(indexes=index_status_list)
    
