from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class UserActivity(Base):
    """
    Track all user activities for analytics and audit purposes.
    """
    __tablename__ = "user_activities"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Activity details
    action = Column(String, nullable=False)
    entity_type = Column(String)
    entity_id = Column(String)
    
    # Context
    ip_address = Column(String)
    user_agent = Column(String)
    extra_data = Column(Text)  # JSON string for additional data (renamed from metadata)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
