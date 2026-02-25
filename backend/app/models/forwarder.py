from sqlalchemy import Column, String, JSON, Boolean, DateTime, Float
from app.db.session import Base
from datetime import datetime
import uuid

class Forwarder(Base):
    """
    Represents a logistics company (forwarder) registered on the OMEGO network.
    """
    __tablename__ = "forwarders"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # n8n EXACT Fields (REGISTERED_FORWARDERS)
    forwarder_id = Column(String, unique=True, index=True) # Column A
    company_name = Column(String, index=True) # Column B
    contact_person = Column(String, nullable=True) # Column C
    email = Column(String, unique=True, index=True) # Column D
    phone = Column(String) # Column E
    whatsapp = Column(String, nullable=True) # Column F
    country = Column(String) # Column G
    specializations = Column(String, nullable=True) # Column H
    routes = Column(String, nullable=True) # Column I
    status = Column(String, default="PENDING") # Column J (PENDING, APPROVED, ACTIVE)
    registered_at = Column(DateTime, default=datetime.utcnow) # Column K
    activated_at = Column(DateTime, nullable=True) # Column L
    
    # Extended System Fields (Not in n8n Sheet but useful for UI)
    website = Column(String, nullable=True)
    tax_id = Column(String, nullable=True)
    document_url = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False) 
    is_paid = Column(Boolean, default=False)
    
    # Financial performance metrics
    reliability_score = Column(Float, default=4.9)
    total_shipments = Column(Float, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True) # 30-day active window
