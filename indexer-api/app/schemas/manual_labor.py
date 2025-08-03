from pydantic import BaseModel

class DeleteTimeConsumingQueryRequest(BaseModel):
    query_id: int