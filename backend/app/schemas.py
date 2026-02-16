from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import Enum
from datetime import datetime

class Currency(str, Enum):
    USD = "USD"
    EUR = "EUR"

class Surcharge(BaseModel):
    name: str
    amount: float
    currency: Currency
    category: str = "Local" # Local, Freight, Documentation, Fuel

class OceanQuote(BaseModel):
    """
    Standardized Container Quote Model
    """
    id: Optional[str] = None
    carrier_name: str
    origin_locode: str
    dest_locode: str
    container_type: str = "40FT"
    
    price: float
    currency: Currency
    transit_time_days: int
    expiration_date: str
    
    surcharges: List[Surcharge] = []
    
    # Sovereign Intelligence Metrics
    risk_score: float = 0.0
    carbon_emissions: float = 0.0
    customs_duty_estimate: float = 0.0
    port_congestion_index: float = 0.0
    
    # The Wisdom Layer
    wisdom: Optional[str] = None
    thc_fee: float = 0.0
    pss_fee: float = 0.0
    fuel_fee: float = 0.0
    
    # Multi-Schedule Intelligence
    vessel_name: Optional[str] = None
    departure_date: Optional[str] = None
    is_featured: bool = False
    
    # Security Verification
    is_real_api_rate: bool = True
    source_endpoint: str 
    contact_office: Optional[str] = None

class RateRequest(BaseModel):
    origin: str  # e.g., "Shanghai" or "CNSHA"
    destination: str # e.g., "Jeddah" or "SAJED"
    container: str = "40FT" # Default
    commodity: str = "General Cargo" # Added for Sovereign Logic
    ready_date: Optional[str] = None
    goods_value: Optional[float] = None # Added for Best of All Time Accuracy

# --- Auth Models ---
class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    user_name: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None
# --- Booking Models ---
class BookingCreate(BaseModel):
    quote_id: Optional[str] = None
    user_id: Optional[str] = None  # Deprecated: derived from JWT current_user.id
    cargo_details: Any # Accept string or dict for robustness
    price: float = 0.0
    quote_data: Optional[dict] = None # For implicit quote creation

class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    status: str
    quote_id: str
    user_id: str
    cargo_details: Optional[str]

# --- Tracking Models ---
class TrackingStatus(BaseModel):
    booking_reference: str
    container_number: str
    current_location: str
    status: str
    last_updated: datetime
    events: List[str] = []
