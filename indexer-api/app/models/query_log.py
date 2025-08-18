from sqlalchemy import Column, Integer, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_query_id = Column(Integer, ForeignKey("tc_queries.id", ondelete="CASCADE"), nullable=False)
    time_stamp = Column(TIMESTAMP, nullable=False)
    optimized = Column(Boolean, default=False)

    # Defining the relationship with TCQuery
    tc_query = relationship("TCQuery", back_populates="query_logs")