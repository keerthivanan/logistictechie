from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas import BookingCreate
from app import crud
from app.crud.payment import payment as payment_crud
from typing import Dict

router = APIRouter()


def booking_to_dict(b) -> dict:
    """Convert a SQLAlchemy Booking object to a JSON-serializable dict."""
    return {
        "id": b.id,
        "booking_reference": b.booking_reference,
        "quote_id": b.quote_id,
        "user_id": b.user_id,
        "status": b.status,
        "cargo_details": b.cargo_details,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


@router.post("/", response_model=Dict)
async def create_booking(
    booking_in: BookingCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new booking and payment record.
    No FK constraint on quote_id — quotes are external API references.
    """
    try:
        res = await crud.booking.create(
            db,
            quote_id=booking_in.quote_id,
            user_id=booking_in.user_id,
            cargo_details=booking_in.cargo_details
        )

        # Create Payment (if price provided)
        if booking_in.price > 0:
            await payment_crud.create(
                db,
                booking_id=res.id,
                user_id=booking_in.user_id,
                amount=booking_in.price
            )

        return {
            "success": True,
            "booking_reference": res.booking_reference,
            "data": booking_to_dict(res)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking creation failed: {str(e)}")


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
        return {"success": False, "error": "Booking not found"}
    return {"success": True, "data": booking_to_dict(db_booking)}
