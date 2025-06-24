from sqlalchemy import Column, Integer, String, Float, Boolean, TIMESTAMP, Text, ARRAY
from sqlalchemy.orm import relationship
from app.database.base import Base

class TCQuery(Base):
    __tablename__ = "tc_queries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    query = Column(Text, nullable=False)
    total_exec_time = Column(Float, nullable=False)
    mean_exec_time = Column(Float, nullable=False)
    calls = Column(Integer, nullable=False)
    shared_blks_read = Column(Integer, nullable=False)
    temp_blks_written = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    indexes = Column(ARRAY(String), nullable=False)
    estimated_time_for_indexes = Column(Float, default=0.0)
    next_time_execution = Column(TIMESTAMP, default=None)
    auto_indexing = Column(Boolean, default=False)

    # Defining the relationship with QueryLog
    query_logs = relationship("QueryLog", back_populates="tc_query")

    # Defining the relationship with TrainedModel
    trained_models = relationship("TrainedModel", back_populates="tc_query")

    # Defining the relationship with IndexMaintenanceLog
    index_maintenance_logs = relationship("IndexMaintenanceLog", back_populates="tc_query")



