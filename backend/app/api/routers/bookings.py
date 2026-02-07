from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas import BookingCreate, BookingResponse
from app import crud
from typing import List, Dict

router = APIRouter()

@router.post("/", response_model=Dict)
async def create_booking(booking_in: BookingCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates a new booking based on a Quote ID.
    """
    res = await crud.booking.create(
        db, 
        quote_id=booking_in.quote_id, 
        user_id=booking_in.user_id, 
        cargo_details=booking_in.cargo_details
    )
    return {"success": True, "data": res}

@router.get("/user/{user_id}", response_model=Dict)
async def get_user_bookings(user_id: str, db: AsyncSession = Depends(get_db)):
    res = await crud.booking.get_by_user(db, user_id=user_id)
    return {"success": True, "data": res}

@router.get("/{ref}", response_model=Dict)
async def get_booking_by_ref(ref: str, db: AsyncSession = Depends(get_db)):
    db_booking = await crud.booking.get_by_reference(db, ref=ref)
    if not db_booking:
        return {"success": False, "error": "Booking not found"}
    return {"success": True, "data": db_booking}
