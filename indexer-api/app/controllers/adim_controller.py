import pickle
from sqlalchemy.orm import Session
from app.models.tc_query import TCQuery
from app.models.query_log import QueryLog
from app.models.trained_models import TrainedModel
from app.models.index_maintenance_log import IndexMaintenanceLog
from app.schemas.adim import ADIMScheduleResponse, Schedules
import subprocess
from fastapi import HTTPException
import os
import re
from typing import List, Optional, Dict
from app.config.settings import settings
from difflib import SequenceMatcher
from datetime import datetime
import numpy as np
from datetime import timedelta
from sqlalchemy import text

#constants
LOG_DIR = "/logs"
IS_DEV = settings.IS_DEV_MODE
LOG_FILENAME_PATTERN = "postgresql-%Y-%m-%d.log"
VOLUME_NAME = "pg-org-logs"

EXCLUDE_PATTERNS = [
    r'/\*pga4dash\*/', 
    r'^/pga4dash/$', 
    r'pg_catalog',
    r'pg_attribute',
    r'pg_type',
    r'pg_class',
    r'pg_namespace',
    r'attrelid=',
    r'pg_depend',
    r'pg_index',
    r'pg_description',
    r"SELECT at\..*",
    r"SELECT n\..*",
    r"SELECT nsp\..*",
    r"SELECT rel\..*",
    r"SELECT CASE\..*",
    r"SELECT version\(\)",
    r"SET .*",
    r"COMMIT",
    r"BEGIN"
]

def get_log_filenames() -> List[str]:
    """
    Get the list of log filenames in the log directory.
    """
    if IS_DEV:
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{VOLUME_NAME}:/logs",
            "alpine", "sh", "-c", "ls /logs"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise  HTTPException(
                status_code=500,
                detail=f"Error fetching log files: {result.stderr.strip()}"
            )
        return [f for f in result.stdout.strip().split("\n") if f.endswith(".log")]
    else:
        return [f for f in os.listdir(LOG_DIR) if f.endswith(".log")]

def read_log_file(filename: str) -> str:
    """Read content of a log file from volume or local path."""
    if IS_DEV:
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{VOLUME_NAME}:/logs",
            "alpine", "cat", f"/logs/{filename}"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Error reading log file: {result.stderr.strip()}"
            )
        return result.stdout
    else:
        path = os.path.join(LOG_DIR, filename)
        with open(path, "r") as f:
            return f.read()
        
def delete_log_file(filename: str) -> None:
    """Delete a log file from volume or local path."""
    if IS_DEV:
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{VOLUME_NAME}:/logs",
            "alpine", "rm", f"/logs/{filename}"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Failed to delete {filename}: {result.stderr}")
    else:
        os.remove(os.path.join(LOG_DIR, filename))
    
def parse_log_content(content: str) -> List[Dict[str, str]]:
    """
    Parse the PostgreSQL log file and extract user queries.
    Only entries that do not contain internal system references (like "pg_catalog")
    are retained.
    """
    user_entries: List[Dict[str, str]] = []
    current_entry: Dict[str, str] = {}
    collecting_query = False
    query_lines: List[str] = []

    # Match timestamp + statement line
    stmt_pattern = re.compile(
        r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ (?:[+\-]\d{4}|[A-Z]+)) \[.*?\] LOG:\s+statement:\s+(.*)$"
    )

    # Match start of a new log line to stop query collection
    new_log_entry_pattern = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+")

    for line in content.splitlines():
        line = line.rstrip()

        stmt_match = stmt_pattern.match(line)
        if stmt_match:
            # Save previous collected query
            if current_entry and query_lines:
                current_entry["query_text"] = "\n".join(query_lines).strip()
                if 'pg_catalog' not in current_entry["query_text"].lower():
                    user_entries.append(current_entry)

            # Start new entry
            current_entry = {
                "timestamp": stmt_match.group(1),
            }
            query_lines = [stmt_match.group(2)]
            collecting_query = True
        elif collecting_query:
            # If line starts like a new timestamped log, stop collecting
            if new_log_entry_pattern.match(line):
                # Save current before resetting
                current_entry["query_text"] = "\n".join(query_lines).strip()
                if 'pg_catalog' not in current_entry["query_text"].lower():
                    user_entries.append(current_entry)
                collecting_query = False
                query_lines = []
                current_entry = {}
            else:
                # It's a continuation line
                query_lines.append(line.strip())

    # Append last query if still collecting at EOF
    if collecting_query and current_entry and query_lines:
        current_entry["query_text"] = "\n".join(query_lines).strip()
        if 'pg_catalog' not in current_entry["query_text"].lower():
            user_entries.append(current_entry)

    return user_entries

def normalize_query(query: str) -> str:
    """
    Normalize SQL queries by:
    - Lowercasing
    - Replacing literals and positional params with a generic placeholder
    - Removing extra whitespace
    """
    query = query.lower()

    # Replace string literals
    query = re.sub(r"'[^']*'", "$VAL$", query)

    # Replace numeric literals
    query = re.sub(r"\b\d+(\.\d+)?\b", "$VAL$", query)

    # Replace positional params like $1, $2 with $VAL$
    query = re.sub(r"\$\d+", "$VAL$", query)

    # Normalize whitespace
    query = re.sub(r"\s+", " ", query).strip()

    return query

def is_query_match(log_query: str, tc_query_text: str, threshold: float = 0.9) -> bool:
    """Fuzzy match normalized log query and TC query."""
    norm_log = normalize_query(log_query)
    norm_tc = normalize_query(tc_query_text)

    similarity = SequenceMatcher(None, norm_log, norm_tc).ratio()
    return similarity >= threshold

def insert_query_logs(db: Session, user_entries: List[Dict[str, Optional[str]]]) -> None:
    """
    Insert log entries into the database if the query matches an entry in TCQuery (fuzzily).
    """
    all_tc_queries = db.query(TCQuery).all()

    for entry in user_entries:
        query_text = entry.get('query_text')
        if not query_text:
            continue

        matched_tc_query = None
        for tc_query in all_tc_queries:
            if is_query_match(query_text, tc_query.query):
                matched_tc_query = tc_query
                break

        if not matched_tc_query:
            continue

        # Create a new QueryLog entry
        query_log = QueryLog(
            tc_query_id=matched_tc_query.id,
            time_stamp=entry.get('timestamp'),
            optimized=False  # Default to False
        )
        # Add to the session
        db.add(query_log)

    db.commit()

def schedule_next_exec_times(db_org: Session, db_b_plus: Session, window_size: int = 10) -> ADIMScheduleResponse:
    """Predict the next execution time for each time consuming query and return the schedules."""

    # The schedules list to be returned
    schedules: List[Schedules] = []

    # Fetch all time consuming queries
    tc_queries = db_b_plus.query(TCQuery).all()

    # Iterate through each time consuming query
    for tc_query in tc_queries:
        # Continue if the auto_indexing is not enabled
        if not tc_query.auto_indexing: 
            continue

        # Continue if the next_time_execution is already set and greater than the current time stamp.
        if tc_query.next_time_execution is not None and tc_query.next_time_execution > datetime.now():
            continue

        # Get the last 11 queries for from  the QueryLog table using the tc_query_id
        last_queries = db_b_plus.query(QueryLog).filter(
            QueryLog.tc_query_id == tc_query.id
        ).order_by(QueryLog.time_stamp.desc()).limit(window_size + 1).all()

        if not last_queries:
            continue

        if len(last_queries) < window_size+1:
            # If there are not enough queries, we cannot predict the next execution time
            continue

        # Set optimized of the query log to true if the time_stamp of the query log is greater than the next_time_execution of the tc_query
        if tc_query.next_time_execution is not None:
            for query_log in last_queries:
                if query_log.time_stamp > tc_query.next_time_execution:
                    query_log.optimized = True
        
        # Predict the next execution time based on the last queries
        # Fetch the model row that has the highest r2_percentage for the current tc_query
        model_row  = db_b_plus.query(TrainedModel).filter(
            TrainedModel.tc_query_id == tc_query.id
        ).order_by(TrainedModel.r2_percentage.desc()).first()

        if not model_row:
            continue

        # Load model and scalers
        model = pickle.loads(model_row.model_data)
        scaler_X = pickle.loads(model_row.scaler_x)
        scaler_y = pickle.loads(model_row.scaler_y)

        last_queries = sorted(last_queries, key=lambda last_queries: last_queries.time_stamp)
        
        deltas = [
            (last_queries[i + 1].time_stamp - last_queries[i].time_stamp).total_seconds()
            for i in range(window_size)
        ]

        # Get last timestamp's hour/weekday
        last_ts = last_queries[-1].time_stamp
        hour = last_ts.hour
        weekday = last_ts.weekday()

        # Build input vector
        sin_hour = np.sin(2 * np.pi * hour / 24)
        cos_hour = np.cos(2 * np.pi * hour / 24)
        sin_weekday = np.sin(2 * np.pi * weekday / 7)
        cos_weekday = np.cos(2 * np.pi * weekday / 7)

        input_vector = np.array(deltas + [sin_hour, cos_hour, sin_weekday, cos_weekday]).reshape(1, -1)
        input_scaled = scaler_X.transform(input_vector)

        # Predict delta and convert back
        predicted_scaled = model.predict(input_scaled)
        predicted_delta = scaler_y.inverse_transform(predicted_scaled)[0][0]

        predicted_time = last_ts + timedelta(seconds=float(predicted_delta))

        # Set the predicted_time 6 hours before
        predicted_time = predicted_time - timedelta(hours=6)

        # Delete all the existing indexes for the tc_query if predicted_time-current time is greater than 5 hours. Otherwise, continue the loop
        # if (predicted_time - datetime.now()) < timedelta(hours=5):
        #     continue

        # Delete all the existing indexes for the tc_query
        # Extracting the index names from the tc_query. They are in the third word of each string inside the indexes column
        indexes = tc_query.indexes
        if not indexes:
            continue
        indexes = [index.split()[2] for index in indexes if len(index.split()) > 2]
        if not indexes:
            continue
        # Delete the indexes from the database
        # Have to track that the indexes were dropped in this time if exists
        for index in indexes:
            db_org.execute(text(f"DROP INDEX IF EXISTS {index}"))
        db_org.commit()

        # Create a new IndexMaintenanceLog entry. Dropping the indexes is recorded as index_created=False
        index_maintenance_log = IndexMaintenanceLog(
            tc_query_id=tc_query.id,
            time_stamp=datetime.now(),
            index_created=False 
        )

        # Add the index maintenance log to the session
        db_b_plus.add(index_maintenance_log)

        # Update the next_time_execution of the tc_query and save the changes in the database
        tc_query.next_time_execution = predicted_time

        # Add the schedule to the schedules list
        schedules.append(Schedules(
            tc_query_id=tc_query.id,
            next_execution_time=predicted_time.strftime('%Y-%m-%d %H:%M:%S')
        ))
    
    # Commit the changes to the database
    db_b_plus.commit()

    # Return the schedules
    return ADIMScheduleResponse(schedules=schedules)
    

def get_adim_schedules(db_org: Session, db_b_plus: Session) -> ADIMScheduleResponse:
    """This function read logs from pg-org-logs volume and insert them into the database. Then it will predicts the next execution time for each time consuming query and returns the schedules
    along with the query id and the next execution time."""
    log_filenames = get_log_filenames()
    if log_filenames:
        for filename in log_filenames:
            content = read_log_file(filename)
            if not content:
                continue
            #Print the first 1000 characters of the log file content for debugging
            user_entries = parse_log_content(content)
            if user_entries:
                insert_query_logs(db_b_plus, user_entries)
            delete_log_file(filename)
    
    # Schedule the next execution times for the time consuming queries
    schedules_response = schedule_next_exec_times(db_org, db_b_plus)
    if not schedules_response.schedules:
        raise HTTPException(status_code=404, detail="No schedules found.")
    return schedules_response

def create_index_using_query_id(db_org: Session, db_b_plus: Session, tc_query_id: int) -> None:
    """Create indexes for the given TCQuery ID."""
    # Fetch the TCQuery
    tc_query = db_b_plus.query(TCQuery).filter(TCQuery.id == tc_query_id).first()
    if not tc_query:
        raise HTTPException(status_code=404, detail="TCQuery not found.")

    # Check if auto_indexing is enabled
    if not tc_query.auto_indexing:
        raise HTTPException(status_code=400, detail="Auto indexing is not enabled for this query.")

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

    # Log the index creation in IndexMaintenanceLog
    index_maintenance_log = IndexMaintenanceLog(
        tc_query_id=tc_query_id,
        time_stamp=datetime.now(),
        index_created=True  # Indicating indexes were created
    )

    db_b_plus.add(index_maintenance_log)
    db_b_plus.commit()













