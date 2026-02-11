from sqlalchemy import Column, String, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    booking_reference = Column(String, unique=True, index=True) # e.g. BK-2026-XYZ
    
    quote_id = Column(String, nullable=True)  # External quote reference (no FK - quotes from external APIs)
    user_id = Column(String, ForeignKey("users.id"))
    
    status = Column(String, default="PENDING") # PENDING, CONFIRMED, SHIPPED, DELIVERED
    carrier_booking_ref = Column(String, nullable=True) # External Carrier Ref
    
    cargo_details = Column(JSON)
    contact_details = Column(JSON)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 🔗 Relationships
    user = relationship("User", back_populates="bookings")

