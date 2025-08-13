from pydantic import BaseModel

class WorkloadSimulatorRequest(BaseModel):
    sql_query: str

