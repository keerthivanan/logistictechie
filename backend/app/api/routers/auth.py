from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas import Token, UserLogin, UserResponse
from app.core import security
from app import crud
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: UserLogin,
    db: AsyncSession = Depends(deps.get_db)
):
    """Authenticate user and return JWT token."""
    user = await crud.user.get_by_email(db, email=form_data.email)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "user_id": user.id, "name": user.full_name or "User"},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(user.id),
        "user_name": user.full_name or "User"
    }

@router.post("/register")
async def register_user(
    form_data: RegisterRequest,
    db: AsyncSession = Depends(deps.get_db)
):
    """Register a new user account."""
    existing_user = await crud.user.get_by_email(db, email=form_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    user = await crud.user.create(
        db,
        email=form_data.email,
        password=form_data.password,
        full_name=form_data.full_name
    )
    
    return {
        "success": True,
        "message": "Account created successfully. Please sign in.",
        "user_id": str(user.id)
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login")),
    db: AsyncSession = Depends(deps.get_db)
):
    """Get current user profile."""
    payload = security.decode_token(token)
    email: str = payload.get("sub")
    
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
        
    user = await crud.user.get_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[str] = None

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(
    update_data: ProfileUpdate,
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login")),
    db: AsyncSession = Depends(deps.get_db)
):
    """Update current user profile."""
    payload = security.decode_token(token)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    updated_user = await crud.user.update(db, user_id=user_id, obj_in=update_data.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return updated_user
