from sqlalchemy import Column, String, JSON, Boolean, DateTime, Numeric, Integer, ForeignKey
from app.db.session import Base
from datetime import datetime
import uuid

class MarketplaceRequest(Base):
    """
    Represents a cargo shipment request posted to the open marketplace.
    Mirrors the 'REQUESTS' n8n Google Sheet exactly.
    """
    __tablename__ = "requests"

    # Database ID - SERIAL parity
    id = Column(Integer, primary_key=True, index=True)
    
    # n8n UNIQUE Fields
    request_id = Column(String, unique=True, index=True) # Column A
    user_sovereign_id = Column(String, index=True) # Column B
    user_email = Column(String, index=True) # Column C
    user_name = Column(String) # Column D
    origin = Column(String) # Column E
    origin_type = Column(String) # Port, Airport, Terminal
    destination = Column(String) # Column F
    destination_type = Column(String) # Port, Airport, Terminal
    cargo_type = Column(String, index=True) # Column G (Mode)
    commodity = Column(String) # Specific item
    packing_type = Column(String) # Pallets, Crates, etc.
    quantity = Column(Integer) # Number of units
    weight_kg = Column(Numeric(10, 2)) # Column H - Precise Decimal
    dimensions = Column(String) # Column I
    is_stackable = Column(Boolean, default=True)
    is_hazardous = Column(Boolean, default=False)
    needs_insurance = Column(Boolean, default=False)
    target_date = Column(DateTime) # Planned shipping date
    special_requirements = Column(String) # Column J
    incoterms = Column(String, index=True) # Column K
    currency = Column(String, default="USD") # Column L
    status = Column(String, default="OPEN", index=True) # Column M
    quotation_count = Column(Integer, default=0) # Column N
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True) # Column O
    closed_at = Column(DateTime, nullable=True) # Column P
    closed_reason = Column(String, nullable=True) # Column Q
    
    # Timestamps for dashboard logic
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MarketplaceBid(Base):
    """
    Represents a bid (quote) from a forwarder on a specific marketplace request.
    Mirrors the 'QUOTATIONS' n8n Google Sheet exactly.
    """
    __tablename__ = "quotations"

    # Database ID - SERIAL parity
    id = Column(Integer, primary_key=True, index=True)
    
    # n8n UNIQUE Fields
    quotation_id = Column(String, unique=True, index=True) # Column A
    request_id = Column(String, ForeignKey("requests.request_id", ondelete="CASCADE"), index=True) # Column B
    forwarder_id = Column(String, index=True) # Column C (n8n generated)
    forwarder_email = Column(String, index=True) # Column D
    forwarder_company = Column(String, index=True) # Column D
    total_price = Column(Numeric(12, 2), index=True) # Column E - Precise Pricing
    currency = Column(String, default="USD", index=True) # Column F
    transit_days = Column(Integer, index=True) # Column G
    validity_days = Column(Integer, default=7) # Column H
    carrier = Column(String, index=True) # Column I
    service_type = Column(String) # Column J
    surcharges = Column(JSON, nullable=True) # Column K
    notes = Column(String, nullable=True) # Column M
    ai_summary = Column(String, nullable=True) # Column N
    raw_email = Column(String, nullable=True) # Column O
    status = Column(String, default="ACTIVE", index=True) # Column P
    received_at = Column(DateTime, default=datetime.utcnow, index=True) # Column Q
    expires_at = Column(DateTime, nullable=True) # Column R
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
