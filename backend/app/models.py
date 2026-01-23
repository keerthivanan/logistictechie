"""
Logistics AI Backend - Data Models
==================================
SQLAlchemy models for the logistics platform.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String, unique=True, index=True)
    
    # Route
    origin = Column(String)
    destination = Column(String)
    
    # Cargo
    cargo_details = Column(String) # JSON or simple string
    carrier = Column(String)
    price = Column(Float)
    currency = Column(String, default="USD")
    
    # Status
    status = Column(String, default="confirmed")
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ShipmentEvent(Base):
    __tablename__ = "shipment_events"
    
    id = Column(Integer, primary_key=True)
    booking_ref = Column(String, index=True)
    location = Column(String)
    description = Column(String)
    status = Column(String) # e.g. "intransit", "arrived"
    timestamp = Column(DateTime, default=datetime.utcnow)
