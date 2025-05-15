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
    estimated_time_for_indexes = Column(Float, nullable=False)
    next_time_execution = Column(TIMESTAMP, nullable=False)
    auto_indexing = Column(Boolean, default=False)

    # Defining the relationship with QueryLog
    query_logs = relationship("QueryLog", back_populates="tc_query")



