from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.core import security
from app.schemas import UserLogin

class CRUDUser:
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def create(self, db: AsyncSession, email: str, password: str, full_name: str = None, company_name: str = None, avatar_url: str = None) -> User:
        # Best-of-All-Time Validation
        if "@" not in email:
            raise ValueError("Invalid email format")
        if not security.validate_password_strength(password):
            raise ValueError("Password does not meet the Sovereign Strength requirements (8+ chars, Mixed Case, Digits).")
            
        db_user = User(
            email=email,
            password_hash=security.get_password_hash(password),
            full_name=full_name,
            company_name=company_name,
            avatar_url=avatar_url,
            role="user"
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def update(self, db: AsyncSession, user_id: str, obj_in: dict) -> User:
        result = await db.execute(select(User).filter(User.id == user_id))
        db_user = result.scalars().first()
        if db_user:
            # IMMUTABLE CORE PROTECTION (World Class Security)
            protected_fields = ["id", "sovereign_id", "email"]
            for field, value in obj_in.items():
                if field not in protected_fields and hasattr(db_user, field):
                    setattr(db_user, field, value)
            await db.commit()
            await db.refresh(db_user)
        return db_user

    def is_active(self, user: User) -> bool:
        return user.is_active

user = CRUDUser()
