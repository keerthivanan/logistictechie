from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    sovereign_id = Column(String, unique=True, index=True) # OMEGO-001
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True) # Optional for Social-Only nodes
    full_name = Column(String)
    company_name = Column(String)
    phone_number = Column(String)
    avatar_url = Column(String) 
    preferences = Column(String) 
    role = Column(String, default="user") 
    
    # Onboarding Logic
    onboarding_completed = Column(Boolean, default=False)
    survey_responses = Column(String) # JSON of quiz/onboarding data
    
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bookings = relationship("Booking", back_populates="user")
    activities = relationship("UserActivity", back_populates="user")
    # quotes = relationship("Quote", back_populates="user") # Optional: Add back_populates in Quote if needed

    
    # Marketplace Relationships
    # Use string references to allow late-binding and avoid circular imports
    forwarder_profile = relationship("Forwarder", uselist=False, back_populates="user")
    shipment_requests = relationship("ShipmentRequest", back_populates="user")

