from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal as SessionLocal
from app.core import security
from app.core.config import settings
from app.models.user import User
from app import crud

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        await db.close()

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = security.decode_token(token)
        token_data = payload.get("sub")
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = await crud.user.get_by_email(db, email=token_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not crud.user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_user_optional(
    db: AsyncSession = Depends(get_db),
    request: Request = None
) -> Optional[User]:
    """Optional token authentication. Doesn't raise if token is missing/invalid."""
    from fastapi import Request
    if not request:
        return None
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    try:
        payload = security.decode_token(token)
        email = payload.get("sub")
        if not email:
            return None
        return await crud.user.get_by_email(db, email=email)
    except:
        return None

from fastapi import Security
from fastapi.security import APIKeyHeader

api_key_auth = APIKeyHeader(name="Authorization", auto_error=False)
api_key_x = APIKeyHeader(name="X-OMEGO-API-KEY", auto_error=False)
api_key_omego = APIKeyHeader(name="X-OMEGO-Auth", auto_error=False)

def verify_n8n_webhook(
    auth_header: str = Security(api_key_auth),
    x_header: str = Security(api_key_x),
    omego_header: str = Security(api_key_omego)
):
    """
    Cryptographic verification to ensure only authenticated n8n instances
    can push data into the Sovereign Database.
    """
    valid_key = settings.OMEGO_API_SECRET
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        if token == valid_key:
            return True
    elif auth_header and auth_header == f"OMEGO {valid_key}":
        return True
            
    if x_header and x_header == valid_key:
        return True
        
    if omego_header and omego_header == valid_key:
        return True
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sovereign Access Denied. Invalid or missing Webhook API Key."
    )
