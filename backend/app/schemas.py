"""
Logistics AI Backend - Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


# === Enums ===

class CargoType(str, Enum):
    FCL_20 = "20ft"
    FCL_40 = "40ft"
    FCL_40HC = "40HC"
    LCL = "LCL"
    AIR = "AIR"


class ShipmentStatus(str, Enum):
    PENDING = "pending"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    DELAYED = "delayed"


class Incoterm(str, Enum):
    EXW = "EXW"  # Ex Works
    FCA = "FCA"  # Free Carrier
    FOB = "FOB"  # Free on Board
    CIF = "CIF"  # Cost, Insurance and Freight
    DAP = "DAP"  # Delivered at Place
    DDP = "DDP"  # Delivered Duty Paid


class QuoteRequest(BaseModel):
    """Request body for getting shipping quotes"""
    origin: str = Field(..., min_length=2, description="Origin UN/LOCODE or City Name")
    destination: str = Field(..., min_length=2, description="Destination UN/LOCODE or City Name")
    cargo_type: CargoType = Field(default=CargoType.FCL_20)
    incoterms: Incoterm = Field(default=Incoterm.FOB, description="International Commercial Terms")
    commodity: str = Field(default="General Cargo", description="Type of goods being shipped")
    weight_kg: Optional[float] = Field(default=None, ge=0)
    volume_cbm: Optional[float] = Field(default=None, ge=0)


class QuoteResult(BaseModel):
    """Single quote result from a carrier"""
    id: str
    carrier: str
    carrier_logo: Optional[str] = None
    price: float
    currency: str = "USD"
    
    # Cost Breakdown
    ocean_freight: float
    surcharges: float = 0
    insurance_cost: float = 0
    
    transit_days: int
    valid_until: str
    route_details: Optional[str] = None
    is_real: bool = True  # False if simulated


class QuoteResponse(BaseModel):
    """Response containing multiple quotes"""
    success: bool
    origin: str
    destination: str
    cargo_type: CargoType
    quotes: List[QuoteResult]
    count: int
    simulation_mode: bool = False


# === Tracking Schemas ===

class TrackingEvent(BaseModel):
    """Single tracking event"""
    date: str
    event: str
    location: str
    status: str  # done, current, pending


class TrackingRequest(BaseModel):
    """Request to track a container"""
    container_id: str = Field(..., min_length=4)


class TrackingResponse(BaseModel):
    """Tracking response with events"""
    success: bool
    container_id: str
    status: ShipmentStatus
    eta: Optional[str] = None
    vessel: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    events: List[TrackingEvent]
    simulation_mode: bool = False

# === Booking Schemas ===

class BookingRequest(BaseModel):
    """Request to book a specific quote"""
    quote_id: str
    origin: str
    destination: str
    carrier: str
    price: float
    currency: str
    
    # Contact Info (simplified for wizard)
    email: Optional[str] = None
    company: Optional[str] = None


class BookingResponse(BaseModel):
    """Booking confirmation"""
    success: bool
    booking_ref: str
    status: str = "confirmed"
    created_at: str
    instructions: str = "Booking received. Our operator will contact you shortly."

    country: str
    type: str  # port, city, terminal


class Port(BaseModel):
    """Port or city location"""
    name: str
    code: str  # UN/LOCODE
    country: str
    type: str  # port, city, terminal


class PortSearchResponse(BaseModel):
    """Port search results"""
    query: str
    results: List[Port]
    count: int
