"""
Logistics AI Backend - Booking Router
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid
import random

from app.schemas import BookingRequest, BookingResponse
from app.database import get_db
from app.models import Booking

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse)
async def create_booking(request: BookingRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new shipment booking.
    Generates a professional booking reference and saves to the persistent database.
    """
    
    # Extract route codes for professional reference (e.g., "CNSHA" -> "CN")
    origin_code = request.origin.split('(')[-1].replace(')', '')[:2].upper() if '(' in request.origin else "GEN"
    dest_code = request.destination.split('(')[-1].replace(')', '')[:2].upper() if '(' in request.destination else "GEN"
    
    # Generate Professional Reference: BKG-{ORIGIN}-{DEST}-{YEAR}-{RANDOM}
    year_short = datetime.now().strftime("%y")
    unique_suffix = uuid.uuid4().hex[:4].upper()
    booking_ref = f"BKG-{origin_code}-{dest_code}-{year_short}-{unique_suffix}"
    
    # Create DB Entry
    new_booking = Booking(
        booking_ref=booking_ref,
        origin=request.origin,
        destination=request.destination,
        carrier=request.carrier,
        price=request.price,
        currency=request.currency,
        status="confirmed",
        cargo_details=f"Quote ID: {request.quote_id}"
    )
    
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    
    return BookingResponse(
        success=True,
        booking_ref=new_booking.booking_ref,
        status=new_booking.status,
        created_at=new_booking.created_at.isoformat(),
        instructions=f"Booking {booking_ref} confirmed with {request.carrier}. Please upload shipping documents within 24 hours."
    )
