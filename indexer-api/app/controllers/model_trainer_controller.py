from typing import Any, Dict, List, Tuple
from sqlalchemy.orm import Session
from app.schemas.model_trainer import ModelTrainingResponse, ModelTrainingResponseForFetchAttributes
from app.models.trained_models import TrainedModel
import numpy as np
import pandas as pd
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score
import pickle
from fastapi import HTTPException

def create_dataset(deltas: List[float], sin_hour: List[float], cos_hour: List[float], sin_weekday: List[float], cos_weekday: List[float], window_size: int)-> Tuple[np.ndarray, np.ndarray]:
    """
    This function is used to create a dataset from the provided time series data. 
    """
    X, y = [], []
    for i in range(len(deltas) - window_size):
        window = deltas[i:i + window_size]
        extra_features = [
            sin_hour[i + window_size],
            cos_hour[i + window_size],
            sin_weekday[i + window_size],
            cos_weekday[i + window_size]
        ]
        X.append(np.hstack((window, extra_features)))
        y.append(deltas[i + window_size])
    return np.array(X), np.array(y)


def get_training_data_from_file(file: Any) -> pd.DataFrame:
    """
    This function is used to create the dataframe from the provided file.
    """
    if not file:
        raise HTTPException(status_code=400, detail="Training data file is required when using_files is True")
    
    try:
        df = pd.read_csv(file.file, parse_dates=['executed_at'])
        if df.empty:
            raise HTTPException(status_code=400, detail="Training data file is empty")
        
        df.sort_values('executed_at', inplace=True)

        # Convert time stamps to unix time (seconds)
        df['unix_time'] = df['executed_at'].view('int64') // 10**9

        # Compute inter-arrival times (deltas) between consecutive executions
        df['delta'] = df['unix_time'].diff()
        df = df.dropna().reset_index(drop=True)
        if df.empty:
            raise HTTPException(status_code=400, detail="No valid data found after processing the training data file")
        
        # Extract hour and weekday features
        df['hour'] = df['executed_at'].dt.hour
        df['weekday'] = df['executed_at'].dt.weekday

        # Create sine and cosine features for hour and weekday
        df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['sin_weekday'] = np.sin(2 * np.pi * df['weekday'] / 7)
        df['cos_weekday'] = np.cos(2 * np.pi * df['weekday'] / 7)

        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading training data file: {str(e)}")

def pre_processing(X_raw: np.ndarray, y_raw: np.ndarray) -> Tuple[np.ndarray, np.ndarray, StandardScaler, StandardScaler]:
    """
    This function is used to preprocess the raw data by scaling the features and target variable.
    It returns the scaled features, scaled target variable, and the scaler object.
    """
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()

    X_scaled = scaler_X.fit_transform(X_raw)
    y_scaled = scaler_y.fit_transform(y_raw.reshape(-1, 1)).flatten()

    return X_scaled, y_scaled, scaler_X, scaler_y

def model_definition(
    number_of_hidden_layers: int,
    number_of_neurons_per_layer: int,
    X_scaled: np.ndarray,
) -> keras.Model:
    """
    This function defines the model architecture based on the provided parameters.
    It returns a compiled Keras model.
    """
    model = Sequential()
    input_dim = X_scaled.shape[1]
    for _ in range(number_of_hidden_layers):
        model.add(Dense(number_of_neurons_per_layer, activation='relu', input_dim=input_dim))
        input_dim = number_of_neurons_per_layer
    
    model.add(Dense(1))  # Output layer for regression

    model.compile(optimizer='adam', loss='mse')
    
    return model

def train_the_model(
    model: keras.Model,
    X_scaled: np.ndarray,
    y_scaled: np.ndarray,
    early_stopping_patience: int,
    epochs: int,
    batch_size: int,
    validation_split: float
) -> Tuple[float, float, keras.callbacks.History]:
    """
    This function trains the model using the provided parameters and returns the RMSE and training history.
    """
    early_stopping = EarlyStopping(monitor='val_loss', patience=early_stopping_patience, restore_best_weights=True)
    
    history = model.fit(
        X_scaled, y_scaled,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=validation_split,
        callbacks=[early_stopping],
        verbose=1
    )
    
    # Calculate RMSE
    y_pred = model.predict(X_scaled)
    rmse = np.sqrt(np.mean((y_pred.flatten() - y_scaled) ** 2))

    # Calculate R^2 score
    r2 = r2_score(y_scaled, y_pred.flatten())
    # Percentage value to return
    r2_percentage = r2 * 100

    
    return rmse, r2_percentage, history

def store_model_in_db(
    db: Session,
    query_id: int,
    model: keras.Model,
    no_of_hidden_layers: int,
    no_of_neurons_per_layer: int,
    early_stopping_patience: int,
    epochs: int,
    batch_size: int,
    validation_split: float,
    scaler_x: StandardScaler,
    scaler_y: StandardScaler,
    rmse: float,
    r2_score: float
) -> None:
    """
    This function stores the trained model, hyperparameters, and RMSE in the database.
    """
    try:
        # Serialize the model
        model_bytes = pickle.dumps(model)
        
        # Create a new TrainedModel instance
        trained_model = TrainedModel(
            tc_query_id=query_id,
            number_of_hidden_layers=no_of_hidden_layers,
            number_of_neurons_per_layer=no_of_neurons_per_layer,
            early_stopping_patience=early_stopping_patience,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            model_data=model_bytes,
            scaler_x=pickle.dumps(scaler_x),
            scaler_y=pickle.dumps(scaler_y),
            rmse=rmse,
            r2_percentage=r2_score
        )
        
        # Add and commit the new model to the database
        db.add(trained_model)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing model in database: {str(e)}")

# Entry point function to train a specific model for a time consuming query
def train_model(
    db: Session,
    query_id: int,
    number_of_hidden_layers: int,
    number_of_neurons_per_layer: int,
    early_stopping_patience: int,
    epochs: int,
    batch_size: int,
    validation_split: float,
    training_data: Any = None

) -> ModelTrainingResponse:
    """
    This function is used to train a dedicated model for a specific time consuming query using
    the provided parameters. It will train the model, store the model outputs, hyperparameters, and RMSE in the database, and 
    return the RMSE and  r2_score of the trained model. The utility functions have been defined above.
    """
    # Fetch the training data
    df = get_training_data_from_file(training_data)
    
    # Create dataset
    window_size = 10  # Example window size, can be adjusted
    X_raw, y_raw = create_dataset(
        df['delta'].tolist(),
        df['sin_hour'].tolist(),
        df['cos_hour'].tolist(),
        df['sin_weekday'].tolist(),
        df['cos_weekday'].tolist(),
        window_size
    )
    
    # Preprocess the data
    X_scaled, y_scaled, scaler_x, scaler_y = pre_processing(X_raw, y_raw)
    
    # Define the model
    model = model_definition(number_of_hidden_layers, number_of_neurons_per_layer, X_scaled)
    
    # Train the model
    rmse, r2_percentage, history = train_the_model(
        model,
        X_scaled,
        y_scaled,
        early_stopping_patience,
        epochs,
        batch_size,
        validation_split
    )
    
    # Store the model and its metadata in the database
    store_model_in_db(
        db,
        query_id,
        model,
        number_of_hidden_layers,
        number_of_neurons_per_layer,
        early_stopping_patience,
        epochs,
        batch_size,
        validation_split,
        scaler_x,
        scaler_y,
        float(rmse),
        float(r2_percentage)
    )
    
    return ModelTrainingResponse(
        rmse=float(rmse),
        r2_score=float(r2_percentage)
    )

# Entry point function to get the latest trained model attributes for a specific query 
def get_latest_trained_model_attributes(db: Session, query_id: int) -> ModelTrainingResponseForFetchAttributes:
    """
    This function fetches the latest trained model attributes for a specific query from the database.
    """
    try:
        # Query the latest trained model for the given query_id
        trained_model = db.query(TrainedModel).filter(TrainedModel.tc_query_id == query_id).order_by(TrainedModel.created_at.desc()).first()
        
        if not trained_model:
            raise HTTPException(status_code=404, detail="No trained model found for the given query ID")
        
        return ModelTrainingResponseForFetchAttributes(
            number_of_hidden_layers=trained_model.number_of_hidden_layers,
            number_of_neurons_per_layer=trained_model.number_of_neurons_per_layer,
            early_stopping_patience=trained_model.early_stopping_patience,
            epochs=trained_model.epochs,
            batch_size=trained_model.batch_size,
            validation_split=trained_model.validation_split,
            rmse=trained_model.rmse,
            r2_percentage=trained_model.r2_percentage,
            created_at=trained_model.created_at.strftime('%Y-%m-%d %H:%M:%S')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trained model attributes: {str(e)}")

