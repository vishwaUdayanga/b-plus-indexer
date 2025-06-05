from pydantic import BaseModel

class ModelTrainingResponse(BaseModel):
    rmse: float
    r2_score: float
    