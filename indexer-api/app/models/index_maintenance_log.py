from sqlalchemy import Column, Integer, Float, Boolean, TIMESTAMP, Text, ForeignKey 
from sqlalchemy.orm import relationship
from app.database.base import Base

class IndexMaintenanceLog(Base):
    __tablename__ = "index_maintenance_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tc_query_id = Column(Integer, ForeignKey("tc_queries.id"), nullable=False)
    time_stamp = Column(TIMESTAMP, nullable=False)
    index_created = Column(Boolean, default=False)

    # Defining the relationship with TCQuery
    tc_query = relationship("TCQuery", back_populates="index_maintenance_logs")