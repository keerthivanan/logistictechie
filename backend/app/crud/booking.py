from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.booking import Booking
from typing import List, Optional
import uuid

class CRUDBooking:
    async def create(self, db: AsyncSession, *, quote_id: str, user_id: str, cargo_details: str) -> Booking:
        db_obj = Booking(
            booking_reference=f"BK-{uuid.uuid4().hex[:8].upper()}",
            quote_id=quote_id,
            user_id=user_id,
            status="PENDING",
            cargo_details=cargo_details
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_user(self, db: AsyncSession, user_id: str) -> List[Booking]:
        result = await db.execute(select(Booking).filter(Booking.user_id == user_id))
        return result.scalars().all()

    async def get_by_reference(self, db: AsyncSession, ref: str) -> Optional[Booking]:
        result = await db.execute(select(Booking).filter(Booking.booking_reference == ref))
        return result.scalars().first()

booking = CRUDBooking()
