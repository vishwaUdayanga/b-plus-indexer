from pydantic import BaseModel

class ModelTrainingResponse(BaseModel):
    rmse: float
    