from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment
from typing import List
import uuid

class CRUDPayment:
    async def create(self, db: AsyncSession, *, booking_id: str, user_id: str, amount: float) -> Payment:
        db_obj = Payment(
            booking_id=booking_id,
            user_id=user_id,
            amount=amount,
            transaction_reference=f"TX-{uuid.uuid4().hex[:8].upper()}",
            status="COMPLETED" # Demo mode: auto-complete
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_user(self, db: AsyncSession, user_id: str) -> List[Payment]:
        from sqlalchemy.future import select
        result = await db.execute(select(Payment).filter(Payment.user_id == user_id))
        return result.scalars().all()

payment = CRUDPayment()
