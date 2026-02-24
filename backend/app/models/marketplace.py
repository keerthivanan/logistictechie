from sqlalchemy import Column, String, JSON, Boolean, DateTime, Float, Integer, ForeignKey
from app.db.session import Base
from datetime import datetime
import uuid

class MarketplaceRequest(Base):
    """
    Represents a cargo shipment request posted to the open marketplace.
    """
    __tablename__ = "marketplace_requests"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, unique=True, index=True) # OMEGO-0009-REQ-01
    sovereign_id = Column(String, index=True)  # OMEGO-0009 (user's public ID)
    user_id = Column(String, index=True) # Requesting user (internal UUID)
    user_name = Column(String)
    user_email = Column(String)
    
    origin_city = Column(String)
    origin_country = Column(String)
    dest_city = Column(String)
    dest_country = Column(String)
    cargo_type = Column(String) # Ocean, Air, Truck
    
    weight_kg = Column(Float)
    volume_cbm = Column(Float)
    cargo_value = Column(Float) # From user form
    incoterms = Column(String) # E.g., FOB, CIF
    
    cargo_details = Column(JSON) # Rich JSON specs
    notes = Column(String) # Special notes for n8n broadcast
    
    status = Column(String, default="OPEN") # OPEN, CLOSED
    quotes_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

class MarketplaceBid(Base):
    """
    Represents a bid (quote) from a forwarder on a specific marketplace request.
    """
    __tablename__ = "marketplace_bids"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, index=True)  # Links to MarketplaceRequest.request_id
    forwarder_id = Column(String, index=True)  # Links to Forwarder.forwarder_id (no FK — n8n flexibility)
    
    price = Column(Float)
    currency = Column(String, default="USD")
    transit_days = Column(Integer)
    mode = Column(String) # E.g., Sea FCL
    terms = Column(String) # E.g., All-inclusive
    validity_days = Column(Integer, default=7)
    
    # Store vendor info directly for faster retrieval in simulation
    vendor_name = Column(String)
    vendor_logo = Column(String)
    vendor_country = Column(String)
    
    raw_reply = Column(String) # The full AI-extracted email context
    position = Column(Integer) # 1, 2, or 3
    notes = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
