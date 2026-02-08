from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=generate_uuid)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    container_type = Column(String, default="40FT")
    
    carrier_name = Column(String)
    price = Column(Float)
    currency = Column(String, default="USD")
    transit_days = Column(Integer)
    valid_until = Column(String)
    
    # 👑 Sovereign Metrics (2026 King Protocol)
    risk_score = Column(Float, default=0.0)
    carbon_emissions = Column(Float, default=0.0) # in kg CO2
    customs_duty_estimate = Column(Float, default=0.0)
    port_congestion_index = Column(Float, default=0.0)
    
    is_real = Column(Boolean, default=True)
    source_endpoint = Column(String)
    
    request_data = Column(JSON, nullable=True) # Store original request for audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
