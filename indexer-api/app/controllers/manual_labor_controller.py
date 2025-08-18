from sqlalchemy.orm import Session
from app.models.tc_query import TCQuery
from app.schemas.diagnostics import TCQueryResponse
from app.schemas.manual_labor import DeleteTimeConsumingQueryRequest, IndexStatus, IndexStatusResponse, StatQueryResponse, StatQuery, CreateTCQueryRequest, ChangeAutoIndexingRequest, RemoveIndexRequest, AddIndexRequest
from fastapi import HTTPException, status
from app.controllers.diagnostics_controller import find_time_consuming_queries, find_best_indexes
from sqlalchemy import text


def delete_time_consuming_query(db: Session, request: DeleteTimeConsumingQueryRequest) -> None:
    """
    Deletes a time-consuming query based on the provided query ID.
    Recalculates the time-consuming queries.

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

    # Fetch existing queries from TCQuery and convert them to dictionaries
    existing_queries = db.query(TCQuery).all()
    existing_queries_dicts = [
        {
            "query": q.query,
            "total_exec_time": q.total_exec_time,
            "mean_exec_time": q.mean_exec_time,
            "calls": q.calls,
            "shared_blks_read": q.shared_blks_read,
            "temp_blks_written": q.temp_blks_written,
            "score": q.score,
            "indexes": q.indexes
        }
        for q in existing_queries
    ]

    # Combine new query with existing ones
    data = existing_queries_dicts

    if not data:
        raise HTTPException(status_code=404, detail="No time-consuming queries found")

    # Recalculate scores for all queries
    time_consuming_queries = find_time_consuming_queries(data)

    # Update existing queries
    try:
        for query_data in time_consuming_queries:
            query_text = query_data['query'].strip()

            existing_query = db.query(TCQuery).filter(TCQuery.query == query_text).first()
            existing_query.total_exec_time = query_data['total_exec_time']
            existing_query.mean_exec_time = query_data['mean_exec_time']
            existing_query.calls = query_data['calls']
            existing_query.shared_blks_read = query_data['shared_blks_read']
            existing_query.temp_blks_written = query_data['temp_blks_written']
            existing_query.score = query_data['score']
            existing_query.indexes = query_data.get('indexes', [])

        # Commit all changes
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Error saving time-consuming queries: {e}")

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

def get_queries_from_pg_stat_statement(db_org: Session, db_b_plus: Session) -> StatQueryResponse:
    """
    This first gets the queries and the id from pg_stat_statements.
    Then it returns a StatQueryResponse containing the list of queries that are not in the TCQuery in the b_plus database.
    It returns only the queries that contains where clauses.
    """

    # Fetch all queries with WHERE clause from pg_stat_statements
    queries_in_pg_stat = db_org.execute(text("""
        SELECT query, queryid::text AS queryid
        FROM pg_stat_statements
        WHERE query ILIKE '%where%'
          AND query IS NOT NULL
    """)).fetchall()

    if not queries_in_pg_stat:
        return StatQueryResponse(queries=[])

    # Fetch all existing queries from TCQuery (in b_plus DB)
    existing_queries = set(
        row.query.strip()
        for row in db_b_plus.query(TCQuery.query).all()
        if row.query
    )

    # Key words to filter out
    internal_keywords = ["pg_", "pg_stat", "information_schema", "pg_toast"]

    # Filter queries not in TCQuery
    filtered_queries = []
    for row in queries_in_pg_stat:
        query_text = row.query.strip()
        query_id = str(row.queryid)

        # Skip if already in TCQuery
        if query_text in existing_queries:
            continue

        # Skip if it contains internal/system keywords
        if any(keyword.lower() in query_text.lower() for keyword in internal_keywords):
            continue

        filtered_queries.append(StatQuery(query=query_text, query_id=query_id))

    return StatQueryResponse(queries=filtered_queries)

def add_time_consuming_query(
    request: CreateTCQueryRequest,
    db_org: Session,
    db_b_plus: Session
) -> TCQueryResponse:
    """
    Adds a new time-consuming query from pg_stat_statements to TCQuery.
    Recalculates scores for all queries and updates existing queries if necessary.
    Returns the newly added query's details as TCQueryResponse.
    """

    # Fetch the query from pg_stat_statements
    result = db_org.execute(text("""
        SELECT query, total_exec_time, mean_exec_time, calls, shared_blks_read, temp_blks_written
        FROM pg_stat_statements
        WHERE calls > 0 AND queryid = :queryid
    """), {"queryid": request.query_id})

    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Query not found in pg_stat_statements")

    column_names = result.keys()
    row_dict = dict(zip(column_names, row))

    # Fetch existing queries from TCQuery and convert them to dictionaries
    existing_queries = db_b_plus.query(TCQuery).all()
    existing_queries_dicts = [
        {
            "query": q.query,
            "total_exec_time": q.total_exec_time,
            "mean_exec_time": q.mean_exec_time,
            "calls": q.calls,
            "shared_blks_read": q.shared_blks_read,
            "temp_blks_written": q.temp_blks_written,
            "score": q.score,
            "indexes": q.indexes
        }
        for q in existing_queries
    ]

    # Combine new query with existing ones
    data = [row_dict] + existing_queries_dicts

    if not data:
        raise HTTPException(status_code=404, detail="No time-consuming queries found")

    # Recalculate scores for all queries
    time_consuming_queries = find_time_consuming_queries(data)

    # Iterate over the time-consuming queries to find the best indexes
    for query_data in time_consuming_queries:
        query = query_data['query']
        # Find the best indexes for the current query
        create_stmts = find_best_indexes(query, db_org)
        # Add the create statements to the query data
        query_data['indexes'] = create_stmts

    # Update existing queries or add new ones
    new_query_obj = None
    try:
        for query_data in time_consuming_queries:
            query_text = query_data['query'].strip()

            existing_query = db_b_plus.query(TCQuery).filter(TCQuery.query == query_text).first()

            if existing_query:
                # Update existing query attributes
                existing_query.total_exec_time = query_data['total_exec_time']
                existing_query.mean_exec_time = query_data['mean_exec_time']
                existing_query.calls = query_data['calls']
                existing_query.shared_blks_read = query_data['shared_blks_read']
                existing_query.temp_blks_written = query_data['temp_blks_written']
                existing_query.score = query_data['score']
                existing_query.indexes = query_data.get('indexes', [])
            else:
                # Add new query
                new_query_obj = TCQuery(
                    query=query_data['query'],
                    total_exec_time=query_data['total_exec_time'],
                    mean_exec_time=query_data['mean_exec_time'],
                    calls=query_data['calls'],
                    shared_blks_read=query_data['shared_blks_read'],
                    temp_blks_written=query_data['temp_blks_written'],
                    score=query_data['score'],
                    indexes=query_data.get('indexes', [])
                )
                db_b_plus.add(new_query_obj)

        # Commit all changes
        db_b_plus.commit()
    except Exception as e:
        db_b_plus.rollback()
        raise Exception(f"Error saving time-consuming queries: {e}")

    # Return the newly added query
    if not new_query_obj:
        # If the query already existed, fetch it
        new_query_obj = db_b_plus.query(TCQuery).filter(TCQuery.query == row_dict['query']).first()
        if not new_query_obj:
            raise HTTPException(status_code=404, detail="New time-consuming query not found")

    return TCQueryResponse.model_validate(new_query_obj)

def change_auto_indexing(db_b_plus: Session, request: ChangeAutoIndexingRequest):
    query = db_b_plus.query(TCQuery).filter(TCQuery.id == request.query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")

    query.auto_indexing = request.enable
    db_b_plus.commit()

    return {"detail": "Auto indexing updated successfully"}

def remove_index(db_b_plus: Session, request: RemoveIndexRequest):
    """
    Remove an index from the indexes array of a query if it exists.
    """

    query = db_b_plus.query(TCQuery).filter(TCQuery.id == request.query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")

    # Ensure indexes is a list (protect against None/NULL in DB)
    if not query.indexes:
        raise HTTPException(status_code=404, detail="No indexes found for this query")

    if request.index in query.indexes:
        # Remove index safely
        query.indexes = [idx for idx in query.indexes if idx != request.index]

        db_b_plus.add(query)  # make sure session knows it's updated
        db_b_plus.commit()
        db_b_plus.refresh(query)

        return {"detail": f"Index '{request.index}' removed successfully"}
    else:
        raise HTTPException(status_code=404, detail="Index not found")

def add_index(db_b_plus: Session, db_org: Session, request: AddIndexRequest):
    """
    This will first check whether the index is correct by executing it in the organization database. 
    Then it will immediately delete it from the organization database.
    Finally, it will add that index to the indexes array of the query in the B+ database.
    """

    # Fetch the query from B+ DB
    query = db_b_plus.query(TCQuery).filter(TCQuery.id == request.query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")

    index_statement = request.index.strip().rstrip(";")  # Ensure no trailing semicolon

    try:
        # Extract the index name (assuming index creation is like "CREATE INDEX idx_name ON ...")
        tokens = index_statement.split()
        if len(tokens) < 3 or tokens[0].upper() != "CREATE" or tokens[1].upper() != "INDEX":
            raise HTTPException(status_code=400, detail="Invalid index statement format")
        index_name = tokens[2]

        # Try creating the index in org database
        db_org.execute(text(index_statement))
        db_org.commit()

        # Drop the index immediately
        db_org.execute(text(f"DROP INDEX IF EXISTS {index_name}"))
        db_org.commit()

    except Exception as e:
        db_org.rollback()
        raise HTTPException(status_code=400, detail=f"Invalid index statement: {str(e)}")

    # Add the index to B+ database indexes array
    if request.index not in query.indexes:
        query.indexes = query.indexes + [request.index]
        db_b_plus.commit()
    else:
        raise HTTPException(status_code=400, detail="Index already exists in query")

    return {"detail": "Index validated and added successfully"}

