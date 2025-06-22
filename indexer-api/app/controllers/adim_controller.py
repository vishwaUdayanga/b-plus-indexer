from sqlalchemy.orm import Session
from app.models.tc_query import TCQuery
from app.models.query_log import QueryLog
from app.schemas.adim import ADIMScheduleResponse
import subprocess
from fastapi import HTTPException
import os
import re
from typing import List, Optional, Dict
from app.config.settings import settings
from difflib import SequenceMatcher

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
    

def get_adim_schedules(db: Session) -> ADIMScheduleResponse:
    """Test the existing functions to ensure they work as expected. For now, this function will read the log files, get the user entries, 
    and insert them into the database."""
    log_filenames = get_log_filenames()
    if not log_filenames:
        raise HTTPException(status_code=404, detail="No log files found.")

    for filename in log_filenames:
        content = read_log_file(filename)
        if not content:
            continue
        #Print the first 1000 characters of the log file content for debugging
        user_entries = parse_log_content(content)
        if user_entries:
            insert_query_logs(db, user_entries)
        delete_log_file(filename)

    # Return a dummy response for now
    return ADIMScheduleResponse(schedules=[])









