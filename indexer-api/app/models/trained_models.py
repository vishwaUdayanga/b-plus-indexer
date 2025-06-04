from sqlalchemy import Column, Integer, Float, TIMESTAMP, LargeBinary, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class TrainedModel(Base):
    __tablename__ = "trained_models"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_query_id = Column(Integer, ForeignKey("tc_queries.id"), nullable=False)
    number_of_hidden_layers = Column(Integer, nullable=False)
    number_of_neurons_per_layer = Column(Integer, nullable=False)
    early_stopping_patience = Column(Integer, nullable=False)
    epochs = Column(Integer, nullable=False)
    batch_size = Column(Integer, nullable=False)
    validation_split = Column(Float, nullable=False)
    model_data = Column(LargeBinary, nullable=False)
    scaler_x = Column(LargeBinary, nullable=False)
    scaler_y = Column(LargeBinary, nullable=False)
    rmse = Column(Float, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")

    # Defining the relationship with TCQuery
    tc_query = relationship("TCQuery", back_populates="trained_models")
