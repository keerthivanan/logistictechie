from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.core.security import get_password_hash
from app.schemas import UserLogin

class CRUDUser:
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def create(self, db: AsyncSession, email: str, password: str, full_name: str = None) -> User:
        db_user = User(
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            role="user"
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

user = CRUDUser()
