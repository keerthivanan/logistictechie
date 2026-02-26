from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# Primitive Status/Priority for maximum compatibility
class Task(Base):
    """
    Actionable items for users within the Sovereign Ecosystem.
    """
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text)
    task_type = Column(String) # e.g., 'DOCUMENT', 'APPROVAL'
    
    status = Column(String, default="PENDING") # PENDING, COMPLETED, ARCHIVED
    priority = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
