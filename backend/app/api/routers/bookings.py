from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas import BookingCreate, BookingResponse
from app import crud
from app.api import deps
from app.models.user import User
from app.api.deps import get_current_active_user
from app.services.activity import activity_service
from typing import Dict, List

router = APIRouter()


def booking_to_dict(b) -> dict:
    """Convert a SQLAlchemy Booking object to a JSON-serializable dict."""
    import json
    try:
        cargo = json.loads(b.cargo_details) if isinstance(b.cargo_details, str) else b.cargo_details
    except:
        cargo = b.cargo_details
        
    return {
        "id": b.id,
        "booking_reference": b.booking_reference,
        "quote_id": b.quote_id,
        "user_id": b.user_id,
        "status": b.status,
        "cargo_details": cargo,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


@router.post("/", response_model=Dict)
async def create_booking(
    *,
    db: AsyncSession = Depends(get_db),
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    SOVEREIGN BOOKING ENGINE (v2.2 Sync)
    No FK constraint on quote_id — quotes are external API references.
    """
    try:
        res = await crud.booking.create(
            db,
            quote_id=booking_in.quote_id,
            user_id=current_user.id, # IDENTITY HARDENING: Use strictly the session user
            cargo_details=booking_in.cargo_details,
            quote_data=booking_in.quote_data
        )

        # AUDIT PILLAR: Log Booking Creation
        await activity_service.log(
            db,
            user_id=current_user.id,
            action="BOOKING_CREATED",
            entity_type="BOOKING",
            entity_id=res.id,
            metadata={"reference": res.booking_reference, "quote_id": res.quote_id}
        )


        return {
            "success": True,
            "booking_reference": res.booking_reference,
            "data": booking_to_dict(res)
        }
    except Exception as e:
        print(f"[ERROR] Booking Restoration Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Booking creation failed: {str(e)}")


@router.get("/me", response_model=Dict)
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all bookings for the authenticated user."""
    res = await crud.booking.get_by_user(db, user_id=current_user.id)
    return {
        "success": True,
        "data": [booking_to_dict(b) for b in res]
    }


@router.get("/user/{user_id}", response_model=Dict)
async def get_user_bookings(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get all bookings for a user."""
    res = await crud.booking.get_by_user(db, user_id=user_id)
    return {
        "success": True,
        "data": [booking_to_dict(b) for b in res]
    }
@router.get("/{ref}", response_model=Dict)
async def get_booking_by_ref(ref: str, db: AsyncSession = Depends(get_db)):
    """Get a specific booking by reference number."""
    db_booking = await crud.booking.get_by_reference(db, ref=ref)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "data": booking_to_dict(db_booking)}
