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
    forwarder_id = Column(String, unique=True, index=True) # E.g., F001
    company_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    website = Column(String)
    country = Column(String)
    tax_id = Column(String)
    document_url = Column(String)
    logo_url = Column(String)
    
    is_verified = Column(Boolean, default=False) 
    is_paid = Column(Boolean, default=False)
    status = Column(String, default="ACTIVE") # Defaults to active for simplicity in this flow
    
    # Financial performance metrics
    reliability_score = Column(Float, default=4.9)
    total_shipments = Column(Float, default=0)
    
    stripe_customer_id = Column(String, nullable=True) # Linked to payment identity
    
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True) # 30-day active window
