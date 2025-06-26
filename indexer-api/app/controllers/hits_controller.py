from sqlalchemy.orm import Session
from app.models.query_log import QueryLog
from app.schemas.hits import HitsRequest, HitsResponse, QueryLog as QueryLogSchema
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

def get_hits(db: Session, request: HitsRequest) -> HitsResponse:
    """
    Retrieve query logs based on the provided request parameters.
    
    This will fetch the query logs based on the `tc_query_id`, `duration`, and `optimized` status. Duration is the number of months
    """

    start_date = datetime.now(timezone.utc) - relativedelta(months=request.duration)

    query = db.query(QueryLog).filter(
        QueryLog.tc_query_id == request.tc_query_id,
        QueryLog.optimized == request.optimized,
        QueryLog.time_stamp >= start_date
    )

    query_logs = query.all()

    if not query_logs:
        return HitsResponse(query_logs=[])

    query_log_schemas = [
        QueryLogSchema(
            id=log.id,
            time_stamp=log.time_stamp.isoformat(),
            optimized=log.optimized
        ) for log in query_logs
    ]
    return HitsResponse(query_logs=query_log_schemas)