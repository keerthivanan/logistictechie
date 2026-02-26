from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.schemas import Token, UserLogin, UserResponse
from app.core import security
from app import crud
from datetime import timedelta
from app.core.config import settings
from typing import Optional
from pydantic import BaseModel
from app.services.activity import activity_service
import logging
import httpx

logger = logging.getLogger(__name__)

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    confirm_password: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None

class SocialSyncRequest(BaseModel):
    access_token: str
    provider: str = "google"

@router.post("/social-sync", response_model=Token)
async def social_sync(
    request: SocialSyncRequest,
    raw_request: Request,
    db: AsyncSession = Depends(deps.get_db)
):
    """
    SOCIAL SYNC PROTOCOL (FAST)
    Verifies Google Access Token via Google UserInfo Endpoint.
    This supports the Custom Button (Instant UI) flow.
    """
    # FASTEST VERIFICATION FOR ACCESS TOKENS
    google_verify_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            google_verify_url,
            headers={"Authorization": f"Bearer {request.access_token}"}
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google Token")
            
        google_data = resp.json()
        
    # UserInfo endpoint implies token validity and ownership.
    # We trust Google to return the correct user for the valid token.
    
    email = google_data.get("email")
    name = google_data.get("name")
    picture = google_data.get("picture")
    
    email = google_data.get("email")
    name = google_data.get("name")
    picture = google_data.get("picture")
    
    if not email:
        raise HTTPException(status_code=400, detail="Google Account has no email")

    user = await crud.user.get_by_email(db, email=email)
    
    needs_commit = False
    if not user:
        import random
        import string
        
        user_count_res = await db.execute(select(func.count(User.id)))
        user_count = user_count_res.scalar() or 0
        new_sovereign_id = f"OMEGO-{str(user_count + 1).zfill(4)}"
        
        # DOUBLE-CHECK UNIQUENESS
        check_existing = await db.execute(select(User).filter(User.sovereign_id == new_sovereign_id))
        if check_existing.scalars().first():
            entropy = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            new_sovereign_id = f"OMEGO-{entropy}-{str(user_count).zfill(4)}"
        
        user = User(
            email=email,
            sovereign_id=new_sovereign_id,
            full_name=name,
            avatar_url=picture,
            role="user",
            onboarding_completed=True
        )
        db.add(user)
        await db.flush()       # Send INSERT so DB assigns user.id
        await db.refresh(user) # Populate user.id from the DB
        needs_commit = True
        print(f"[SOCIAL_SYNC] New Citizen Enrolled: {email} | ID: {new_sovereign_id}")
        
        # OMEGO PROTOCOL: Create Initial Mission Set
        await create_default_tasks(db, str(user.id))
    else:
        # SELF-HEALING: Legacy Data Fix
        if not user.sovereign_id:
            import random
            import string
            user_count_res = await db.execute(select(func.count(User.id)))
            user_count = user_count_res.scalar() or 0
            new_sovereign_id = f"OMEGO-{str(user_count + 1).zfill(4)}"
            
            check_existing = await db.execute(select(User).filter(User.sovereign_id == new_sovereign_id))
            if check_existing.scalars().first():
                entropy = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
                new_sovereign_id = f"OMEGO-{entropy}-{str(user_count).zfill(4)}"
            
            user.sovereign_id = new_sovereign_id
            needs_commit = True
            print(f"[SELF-HEALING] Assigned Sovereign ID {new_sovereign_id} to {email}")

        # Update avatar if missing or changed
        if picture and (not user.avatar_url or user.avatar_url != picture):
            user.avatar_url = picture
            needs_commit = True
    
    # AUDIT PILLAR: Log Social Sync (Optimized with single commit)
    client_ip = raw_request.client.host if raw_request.client else None
    await activity_service.log(
        db, 
        user_id=user.id if user.id else None, 
        action="SOCIAL_LINK", 
        entity_type="USER", 
        entity_id=user.id if user.id else None,
        ip_address=client_ip,
        commit=False
    )
    
    if needs_commit or True: # Always commit at end to capture activity log and user changes
        await db.commit()
        if user.id: # Refresh only if we have an ID
            await db.refresh(user)
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account Inactive")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": user.email, 
            "user_id": user.id, 
            "name": user.full_name or "User",
            "sovereign_id": user.sovereign_id
        },
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
        "user_name": user.full_name or "User",
        "onboarding_completed": user.onboarding_completed,
        "sovereign_id": user.sovereign_id,
        "avatar_url": user.avatar_url
    }

async def create_default_tasks(db: AsyncSession, user_id: str):
    """Enroll the user in the Sovereign Onboarding sequence."""
    from app import crud
    default_tasks = [
        {
            "title": "Complete Profile Verification",
            "description": "Ensure your Sovereign identity is fully verified for priority boarding.",
            "task_type": "SECURITY",
            "priority": "HIGH"
        },
        {
            "title": "Partner Network Verification",
            "description": "Complete your forwarder profile for inclusion in the global broadcast network.",
            "task_type": "SECURITY",
            "priority": "CRITICAL"
        },
        {
            "title": "Explore Global Marketplace",
            "description": "Scan the marketplace for the most efficient logistics vectors.",
            "task_type": "DOCUMENT",
            "priority": "MEDIUM"
        }
    ]
    for task_data in default_tasks:
        await crud.task.create(db, obj_in=task_data, user_id=user_id)

# Removed Onboarding Submit Protocol (Simplified Flow)

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: UserLogin,
    raw_request: Request,
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
        current_attempts = int(user.failed_login_attempts or 0)
        new_attempts = current_attempts + 1
        update_data = {"failed_login_attempts": new_attempts}
        if new_attempts >= 5:
            update_data["is_locked"] = True
        
        await crud.user.update(db, user_id=str(user.id), obj_in=update_data)
        
        raise HTTPException(
            status_code=401,
            detail=f"Incorrect email or password. {5 - new_attempts} attempts remaining." if new_attempts < 5 else "Account locked.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Reset on success
    if int(user.failed_login_attempts or 0) > 0:
        await crud.user.update(db, user_id=str(user.id), obj_in={"failed_login_attempts": 0})
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "user_id": user.id, "name": user.full_name or "User"},
        expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    # AUDIT PILLAR: Log Login event
    login_ip = raw_request.client.host if raw_request.client else None
    await activity_service.log(
        db, 
        user_id=user.id, 
        action="LOGIN", 
        entity_type="USER", 
        entity_id=user.id,
        ip_address=login_ip
    )

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "user_name": user.full_name or "User",
        "sovereign_id": user.sovereign_id or "OMEGO-PENDING",
        "onboarding_completed": user.onboarding_completed or False,
        "avatar_url": user.avatar_url
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
            "user_name": user.full_name or "User",
            "sovereign_id": user.sovereign_id,
            "onboarding_completed": user.onboarding_completed or False,
            "avatar_url": user.avatar_url
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
    
    # SOVEREIGN ID ASSIGNMENT (same logic as social-sync)
    import random, string
    user_count_res = await db.execute(select(func.count(User.id)))
    user_count = user_count_res.scalar() or 0
    new_sovereign_id = f"OMEGO-{str(user_count + 1).zfill(4)}"
    check_existing = await db.execute(select(User).filter(User.sovereign_id == new_sovereign_id))
    if check_existing.scalars().first():
        entropy = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        new_sovereign_id = f"OMEGO-{entropy}-{str(user_count).zfill(4)}"
    user.sovereign_id = new_sovereign_id
    await db.commit()
    await db.refresh(user)
    
    # OMEGO PROTOCOL: Create Initial Mission Set
    await create_default_tasks(db, str(user.id))
    
    # AUDIT PILLAR: Log Signup event
    await activity_service.log(
        db,
        user_id=str(user.id),
        action="SIGNUP",
        entity_type="USER",
        entity_id=str(user.id)
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
        
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "sovereign_id": user.sovereign_id,
        "onboarding_completed": user.onboarding_completed,
        "avatar_url": user.avatar_url,
        "role": user.role
    }

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
    
    # AUDIT PILLAR: Log Profile Update
    await activity_service.log(
        db,
        user_id=str(user_id),
        action="PROFILE_UPDATE",
        entity_type="USER",
        entity_id=str(user_id)
    )
    
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
    
    # AUDIT PILLAR: Log Password Change
    await activity_service.log(
        db,
        user_id=str(user_id),
        action="SECURITY_UPDATE",
        entity_type="USER",
        entity_id=str(user_id)
    )
    
    return {"success": True, "message": "Password updated successfully"}

class ForgotPassword(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    """Request password reset (Simulation)."""
    # In production: Verify email, generate token, send email via SendGrid
    return {"success": True, "message": "If this email is registered, a reset link will be sent."}

