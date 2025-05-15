from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.tc_query import TCQuery

def normalize(value: float, min_value: float, max_value: float) -> float:
    """Normalize a value to a range of 0 to 1."""
    if min_value == max_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)

def find_time_consuming_queries(data: List[Dict]) -> List[Dict]:
    """
    Find time-consuming queries from the provided data.
    This function normalizes the scores of the queries based on their metrics got from the database.
    It returns a list of dictionaries containing the query information and its normalized score.
    """
    # Extracting the relevant metrics from the data
    metrics  = {
        "total_exec_time": [d['total_exec_time'] for d in data],
        "mean_exec_time": [d['mean_exec_time'] for d in data],
        "calls": [d['calls'] for d in data],
        "shared_blks_read": [d['shared_blks_read'] for d in data],
        "temp_blks_written": [d['temp_blks_written'] for d in data],
    }

    min_max_values = {key: (min(values), max(values)) for key, values in metrics.items()}

    # Normalizing the scores for each metric
    for d in data:
        normalized_total_exec_time = normalize(d['total_exec_time'], *min_max_values['total_exec_time'])
        normalized_mean_exec_time = normalize(d['mean_exec_time'], *min_max_values['mean_exec_time'])
        normalized_calls = normalize(d['calls'], *min_max_values['calls'])
        normalized_shared_blks_read = normalize(d['shared_blks_read'], *min_max_values['shared_blks_read'])
        normalized_temp_blks_written = normalize(d['temp_blks_written'], *min_max_values['temp_blks_written'])

        # Calculate the final score based on the normalized values
        d['score'] = (
            0.3 * normalized_total_exec_time +
            0.25 * normalized_mean_exec_time +
            0.15 * normalized_calls +
            0.15 * normalized_shared_blks_read +
            0.15 * normalized_temp_blks_written
        )
    
    # Sort the data based on the score in descending order
    data.sort(key=lambda x: x['score'], reverse=True)
    # Return the top 10 time-consuming queries
    return data[:10]

def run_diagnostics(db: Session) -> List[Dict]:
    """
    Analyze time-consuming queries and return a list of TCQuery objects.
    This function retrieves the time-consuming queries from the database,
    normalizes their scores, and returns them as a list of TCQuery objects alongside other information inside TCQuery.
    """
    # Execute the raw SQL and get the result object
    result = db.execute(text(
        "SELECT query, total_exec_time, mean_exec_time, calls, shared_blks_read, temp_blks_written "
        "FROM pg_stat_statements "
        "WHERE calls > 0 AND query ILIKE '%where%' AND NOT (query ILIKE ANY (ARRAY['%pg_stat_statements%', 'show %', 'select current_schema%', 'select pg_catalog.version%', 'rollback', 'begin', 'select n.nspname%', 'select t.oid%', 'select column_name%', '%pg_catalog%']));"
    ))

    # Fetch rows from the result
    rows = result.fetchall()

    # Get column names
    columns = result.keys()
    # Convert rows to a list of dictionaries
    data = [dict(zip(columns, row)) for row in rows]

    if not data:
        return []
    
    time_consuming_queries = find_time_consuming_queries(data)

    return time_consuming_queries 



    