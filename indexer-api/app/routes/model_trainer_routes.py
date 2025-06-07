from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.controllers.model_trainer_controller import train_model, get_latest_trained_model_attributes
from app.database.session import get_b_plus_db
from app.middleware.auth import auth_wrapper
from app.schemas.model_trainer import ModelTrainingResponse, ModelTrainingRequestForFetchAttributes, ModelTrainingResponseForFetchAttributes

router = APIRouter()

# Check the dependency between using_files and training_data
def validate_training_data(using_files: bool, training_data: UploadFile | None):
    if not using_files:
        raise HTTPException(
            status_code=400,
            detail="The system still does not support fetching training data from the database."
        )

    if using_files and not training_data:
        raise HTTPException(
            status_code=400,
            detail="Training data file is required when using_files is True"
        )
    

# Here we could not use pydantic model since we need to handle file uploads. Hence the other attributes were also taken as form data for simplicity. 
@router.post("/train_model", response_model=ModelTrainingResponse, tags=["Model Training"], dependencies=[Depends(auth_wrapper)])
async def train_model_endpoint(
    db=Depends(get_b_plus_db),
    query_id: int = Form(..., description="ID of the query to train the model for"),
    number_of_hidden_layers: int = Form(..., description="Number of hidden layers in the model"),
    number_of_neurons_per_layer: int = Form(..., description="Number of neurons per layer in the model"),
    early_stopping_patience: int = Form(..., description="Early stopping patience for training"),
    epochs: int = Form(..., description="Number of epochs for training"),
    batch_size: int = Form(..., description="Batch size for training"),
    validation_split: float = Form(..., description="Validation split ratio for training"),
    using_files: bool = Form(False, description="Whether to use files for training data"),
    training_data: UploadFile = File(None, description="Training data file (optional, required if using_files is True)")
):
    """
    Endpoint to train a dedicated model for a specific time-consuming query.
    Returns the RMSE of the trained model.
    """

    # Validate the training data based on the using_files flag
    validate_training_data(using_files, training_data)

    return train_model(
        db=db,
        query_id=query_id,
        number_of_hidden_layers=number_of_hidden_layers,
        number_of_neurons_per_layer=number_of_neurons_per_layer,
        early_stopping_patience=early_stopping_patience,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=validation_split,
        training_data=training_data
    )

# This endpoint is used to get the existing model attributes for a specific query ID.
@router.post("/fetch_model_attributes", response_model=ModelTrainingResponseForFetchAttributes, tags=["Model Training"], dependencies=[Depends(auth_wrapper)])
async def fetch_model_attributes_endpoint(
    request: ModelTrainingRequestForFetchAttributes,
    db=Depends(get_b_plus_db)
):
    """
    Endpoint to fetch existing model attributes for a specific query ID.
    Returns the model attributes including number of hidden layers, neurons per layer, etc.
    """
    return get_latest_trained_model_attributes(db=db, query_id=request.query_id)




