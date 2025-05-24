from sqlalchemy.orm import Session
from typing import List
from app.models.tc_query import TCQuery
from app.schemas.diagnostics import TCQueryResponse, TCQueriesResponse

#Entry point for the statistics controller
def get_statistics(db_b_plus: Session) -> List[TCQueriesResponse]:
    """
    Retrieves statistics from the database.
    """
    # Get the list of TCQuery objects from the database
    queries = db_b_plus.query(TCQuery).all()
    if queries:
        # Convert the list of TCQuery objects to a list of TCQueryResponse objects
        tc_query_responses = [TCQueryResponse.model_validate(query) for query in queries]
        return TCQueriesResponse(queries=tc_query_responses)
    
    return []