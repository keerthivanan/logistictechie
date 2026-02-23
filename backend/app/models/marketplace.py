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
    unique_id = Column(String, unique=True, index=True) # Human readable or short hash
    user_id = Column(String, index=True) # Requesting user
    
    origin_city = Column(String)
    origin_country = Column(String)
    dest_city = Column(String)
    dest_country = Column(String)
    cargo_type = Column(String) # Ocean, Air, Truck
    
    weight_kg = Column(Float)
    volume_cbm = Column(Float)
    
    cargo_details = Column(JSON) # Rich JSON specs
    status = Column(String, default="OPEN") # OPEN, CLOSED, CANCELLED
    bid_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class MarketplaceBid(Base):
    """
    Represents a bid (quote) from a forwarder on a specific marketplace request.
    """
    __tablename__ = "marketplace_bids"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String) # Using string to avoid strict FK issues in this MVP phase
    forwarder_id = Column(String)
    
    price = Column(Float)
    currency = Column(String, default="USD")
    transit_days = Column(Integer)
    
    # Store vendor info directly for faster retrieval in simulation
    vendor_name = Column(String)
    vendor_logo = Column(String)
    vendor_country = Column(String)
    
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
