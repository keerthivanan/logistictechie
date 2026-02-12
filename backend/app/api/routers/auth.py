from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas import Token, UserLogin, UserResponse
from app.core import security
from app import crud
from datetime import timedelta
from app.core.config import settings
from typing import Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    confirm_password: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None

class SocialSyncRequest(BaseModel):
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    provider: str = "google"

@router.post("/social-sync", response_model=Token)
async def social_sync(
    request: SocialSyncRequest,
    db: AsyncSession = Depends(deps.get_db)
):
    """
    👑 SOCIAL SYNC PROTOCOL
    Harmonizes Google/Social Auth with Phoenix Native JWTs.
    Ensures social users are recognized as 'Elite Citizens' of the platform.
    """
    user = await crud.user.get_by_email(db, email=request.email)
    
    if not user:
        # Create a Shadow User for the Social Provider
        from app.models.user import User
        import uuid
        
        # Generate a high-entropy random password for the shadow record
        shadow_password = security.get_password_hash(str(uuid.uuid4()))
        
        user = await crud.user.create(
            db,
            email=request.email,
            password=str(uuid.uuid4()), # We use a random string and it gets hashed in crud.create
            full_name=request.name,
            company_name="Social_Identity_Link",
            avatar_url=request.image
        )
        print(f"[SOCIAL_SYNC] New Citizen Enrolled: {request.email}")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account Inactive")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "user_id": user.id, "name": user.full_name or "Social User"},
        expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "user_name": user.full_name or "Elite User"
    }

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

    if user.is_locked:
        raise HTTPException(status_code=403, detail="Account is locked due to multiple failed attempts. Contact support.")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is inactive. Contact support.")

    if not security.verify_password(form_data.password, user.password_hash):
        # Increment failed attempts
        new_attempts = int(user.failed_login_attempts or "0") + 1
        update_data = {"failed_login_attempts": str(new_attempts)}
        if new_attempts >= 5:
            update_data["is_locked"] = True
        
        await crud.user.update(db, user_id=str(user.id), obj_in=update_data)
        
        raise HTTPException(
            status_code=401,
            detail=f"Incorrect email or password. {5 - new_attempts} attempts remaining." if new_attempts < 5 else "Account locked.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Reset on success
    if int(user.failed_login_attempts or "0") > 0:
        await crud.user.update(db, user_id=str(user.id), obj_in={"failed_login_attempts": "0"})
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "user_id": user.id, "name": user.full_name or "User"},
        expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "user_name": user.full_name or "User"
    }

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    refresh_token: str,
    db: AsyncSession = Depends(deps.get_db)
):
    """Obtain a new access token using a refresh token."""
    try:
        payload = security.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        email = payload.get("sub")
        user = await crud.user.get_by_email(db, email=email)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        access_token = security.create_access_token(
            data={"sub": user.email, "user_id": user.id, "name": user.full_name or "User"}
        )
        new_refresh_token = security.create_refresh_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user_id": str(user.id),
            "user_name": user.full_name or "User"
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

@router.post("/register")
async def register_user(
    form_data: RegisterRequest,
    db: AsyncSession = Depends(deps.get_db)
):
    """Register a new user account."""
    if form_data.password != form_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    if not security.validate_password_strength(form_data.password):
        raise HTTPException(
            status_code=400,
            detail="Password too weak. Must be 8+ chars and contain uppercase, lowercase, and numbers."
        )

    existing_user = await crud.user.get_by_email(db, email=form_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered in our Oracle network."
        )
    
    user = await crud.user.create(
        db,
        email=form_data.email,
        password=form_data.password,
        full_name=form_data.full_name,
        company_name=form_data.company_name
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
    return updated_user

@router.post("/logout")
async def logout():
    """Logout endpoint (client side handles token removal, this is for audit)."""
    return {"success": True, "message": "Logged out successfully"}

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login")),
    db: AsyncSession = Depends(deps.get_db)
):
    """Change user password."""
    payload = security.decode_token(token)
    user_id = payload.get("user_id")
    
    user = await crud.user.get_by_email(db, email=payload.get("sub"))
    if not user or not security.verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid current password")
    
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
        
    await crud.user.update(db, user_id=user_id, obj_in={"password_hash": security.get_password_hash(data.new_password)})
    return {"success": True, "message": "Password updated successfully"}

class ForgotPassword(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    """Request password reset (Simulation)."""
    # In production: Verify email, generate token, send email via SendGrid
    return {"success": True, "message": "If this email is registered, a reset link will be sent."}

