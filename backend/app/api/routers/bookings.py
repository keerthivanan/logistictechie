from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid
import logging

from app.db.session import get_db
from app.models.booking import Booking
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.activity import activity_service
from app.services.webhook import webhook_service

router = APIRouter()
logger = logging.getLogger(__name__)


class BookingCreate(BaseModel):
    carrier_name: str
    vessel_name: Optional[str] = None
    origin_locode: str
    destination_locode: str
    container_type: str
    transit_days: Optional[int] = None
    total_price: float
    currency: str = "USD"
    quote_id: Optional[str] = None
    marketplace_request_id: Optional[str] = None


@router.post("/")
async def create_booking(
    booking_in: BookingCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Confirm a booking from either an instant quote or a marketplace forwarder bid.
    Creates a persistent booking record and returns a reference number.
    """
    # Generate stable, human-readable reference
    short = uuid.uuid4().hex[:8].upper()
    reference = f"BK-{short}"

    booking = Booking(
        reference=reference,
        user_sovereign_id=current_user.sovereign_id,
        carrier_name=booking_in.carrier_name,
        vessel_name=booking_in.vessel_name,
        origin_locode=booking_in.origin_locode,
        destination_locode=booking_in.destination_locode,
        container_type=booking_in.container_type,
        transit_days=booking_in.transit_days,
        total_price=booking_in.total_price,
        currency=booking_in.currency,
        quote_id=booking_in.quote_id,
        marketplace_request_id=booking_in.marketplace_request_id,
        status="CONFIRMED",
    )
    db.add(booking)

    # If linked to a marketplace request, close it
    if booking_in.marketplace_request_id:
        result = await db.execute(
            select(MarketplaceRequest).filter(
                MarketplaceRequest.request_id == booking_in.marketplace_request_id
            )
        )
        req = result.scalars().first()
        if req and req.status == "OPEN":
            req.status = "CLOSED"
            req.closed_reason = f"Booked: {reference}"

    await db.commit()
    await db.refresh(booking)

    # Look up forwarder email from the selected quotation (for notification)
    forwarder_email = None
    forwarder_company = booking_in.carrier_name
    if booking_in.quote_id:
        q_res = await db.execute(
            select(MarketplaceBid).filter(MarketplaceBid.quotation_id == booking_in.quote_id)
        )
        selected_quote = q_res.scalars().first()
        if selected_quote:
            forwarder_email = selected_quote.forwarder_email
            forwarder_company = selected_quote.forwarder_company or booking_in.carrier_name

    # Log activity (non-blocking)
    try:
        await activity_service.log(
            db,
            user_id=str(current_user.id),
            action="BOOKING_CREATED",
            entity_type="BOOKING",
            entity_id=reference,
            metadata={"reference": reference, "carrier": booking_in.carrier_name, "price": booking_in.total_price},
        )
    except Exception:
        pass

    # Fire booking confirmation email via n8n (background, non-blocking)
    # Sends TWO emails: shipper confirmation + forwarder "lock your quote & send invoice"
    background_tasks.add_task(webhook_service.trigger_booking_webhook, {
        "reference": reference,
        "user_name": current_user.full_name or current_user.email,
        "user_email": current_user.email,
        "carrier_name": booking_in.carrier_name,
        "origin": booking_in.origin_locode,
        "destination": booking_in.destination_locode,
        "container_type": booking_in.container_type,
        "transit_days": booking_in.transit_days,
        "total_price": booking_in.total_price,
        "currency": booking_in.currency,
        "marketplace_request_id": booking_in.marketplace_request_id,
        "quote_id": booking_in.quote_id,
        # Forwarder notification fields
        "forwarder_email": forwarder_email,
        "forwarder_company": forwarder_company,
    })

    return {
        "success": True,
        "booking_id": booking.id,
        "reference": reference,
        "status": "CONFIRMED",
        "carrier_name": booking.carrier_name,
        "origin": booking.origin_locode,
        "destination": booking.destination_locode,
        "container_type": booking.container_type,
        "transit_days": booking.transit_days,
        "total_price": float(booking.total_price),
        "currency": booking.currency,
    }


@router.get("/{reference}")
async def get_booking(
    reference: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Fetch a booking by reference (e.g. BK-A1B2C3D4)."""
    result = await db.execute(
        select(Booking).filter(Booking.reference == reference.upper())
    )
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if booking.user_sovereign_id != current_user.sovereign_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return {
        "booking_id": booking.id,
        "reference": booking.reference,
        "status": booking.status,
        "carrier_name": booking.carrier_name,
        "vessel_name": booking.vessel_name,
        "origin": booking.origin_locode,
        "destination": booking.destination_locode,
        "container_type": booking.container_type,
        "transit_days": booking.transit_days,
        "total_price": float(booking.total_price),
        "currency": booking.currency,
        "confirmed_at": booking.confirmed_at.isoformat() if booking.confirmed_at else None,
    }
