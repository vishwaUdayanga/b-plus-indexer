from pydantic import BaseModel

class ModelTrainingResponse(BaseModel):
    rmse: float
    r2_score: float

class ModelTrainingRequestForFetchAttributes(BaseModel):
    query_id: int

class ModelTrainingResponseForFetchAttributes(BaseModel):
    number_of_hidden_layers: int
    number_of_neurons_per_layer: int
    early_stopping_patience: int
    epochs: int
    batch_size: int
    validation_split: float
    rmse: float
    r2_percentage: float
    created_at: str