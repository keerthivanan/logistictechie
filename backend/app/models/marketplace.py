from sqlalchemy import Column, String, JSON, Boolean, DateTime, Float, Integer, ForeignKey
from app.db.session import Base
from datetime import datetime
import uuid

class MarketplaceRequest(Base):
    """
    Represents a cargo shipment request posted to the open marketplace.
    Strictly aligns with the 'REQUESTS' n8n Google Sheet.
    """
    __tablename__ = "marketplace_requests"

    # Database ID
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # n8n EXACT Fields
    request_id = Column(String, unique=True, index=True) # Column A
    user_sovereign_id = Column(String, index=True) # Column B
    user_email = Column(String) # Column C
    user_name = Column(String) # Column D
    origin = Column(String) # Column E
    destination = Column(String) # Column F
    cargo_type = Column(String) # Column G
    weight_kg = Column(Float) # Column H
    dimensions = Column(String) # Column I
    special_requirements = Column(String) # Column J
    incoterms = Column(String) # Column K
    currency = Column(String, default="USD") # Column L
    status = Column(String, default="OPEN") # Column M (OPEN, CLOSED)
    quotation_count = Column(Integer, default=0) # Column N
    submitted_at = Column(DateTime, default=datetime.utcnow) # Column O
    closed_at = Column(DateTime, nullable=True) # Column P
    closed_reason = Column(String, nullable=True) # Column Q

class MarketplaceBid(Base):
    """
    Represents a bid (quote) from a forwarder on a specific marketplace request.
    Strictly aligns with the 'QUOTATIONS' n8n Google Sheet.
    """
    __tablename__ = "marketplace_bids"

    # Database ID
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # n8n EXACT Fields
    quotation_id = Column(String, unique=True, index=True, default=lambda: f"QT-{str(uuid.uuid4())[:8].upper()}") # Column A
    request_id = Column(String, index=True) # Column B
    forwarder_id = Column(String, index=True) # Column C
    forwarder_company = Column(String) # Column D
    total_price = Column(Float) # Column E
    currency = Column(String, default="USD") # Column F
    transit_days = Column(Integer) # Column G
    validity_days = Column(Integer, default=7) # Column H
    carrier = Column(String) # Column I
    service_type = Column(String) # Column J
    surcharges = Column(JSON, nullable=True) # Column K (can be JSON or String)
    payment_terms = Column(String, nullable=True) # Column L
    notes = Column(String, nullable=True) # Column M
    ai_summary = Column(String, nullable=True) # Column N
    raw_email = Column(String, nullable=True) # Column O
    status = Column(String, default="EVALUATING") # Column P
    received_at = Column(DateTime, default=datetime.utcnow) # Column Q
    expires_at = Column(DateTime, nullable=True) # Column R
