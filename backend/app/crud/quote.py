from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.quote import Quote
from app.schemas import OceanQuote
from typing import List

class CRUDQuote:
    async def create(self, db: AsyncSession, *, obj_in: OceanQuote, user_id: str) -> Quote:
        db_obj = Quote(
            origin=obj_in.origin_locode,
            destination=obj_in.dest_locode,
            carrier_name=obj_in.carrier_name,
            price=obj_in.price,
            currency=obj_in.currency,
            transit_days=obj_in.transit_time_days,
            is_real=obj_in.is_real_api_rate
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Quote]:
        result = await db.execute(select(Quote).offset(skip).limit(limit))
        return result.scalars().all()

quote = CRUDQuote()
