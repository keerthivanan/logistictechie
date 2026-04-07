from fastapi import APIRouter, HTTPException, Depends, Request, Body, BackgroundTasks
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.api.deps import reusable_oauth2
from app.models.user import User
from app.models.forwarder import Forwarder
from app.schemas import Token, UserLogin, UserResponse
from app.core import security
from app import crud
from datetime import timedelta
import asyncio
from app.core.config import settings
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.services.activity import activity_service
import logging
import httpx
import random
import string

logger = logging.getLogger(__name__)

router = APIRouter()

import os as _os

def _effective_role(user_email: str, db_role: str) -> str:
    """Returns 'admin' if this email is the configured admin, otherwise the DB role."""
    admin_email = _os.getenv("ADMIN_EMAIL", "")
    if admin_email and user_email.lower() == admin_email.lower():
        return "admin"
    return db_role

class RegisterRequest(BaseModel):
    email: EmailStr
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
    background_tasks: BackgroundTasks,
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
    
    if not email:
        raise HTTPException(status_code=400, detail="Google Account has no email")

    user = await crud.user.get_by_email(db, email=email)
    
    needs_commit = False
    if not user:
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
        logger.info(f"[SOCIAL_SYNC] New user registered: {email} | ID: {new_sovereign_id}")
        
        # OMEGO PROTOCOL: Create Initial Mission Set
        await create_default_tasks(db, str(user.id))

        # Fire welcome email after commit (background — don't block login)
        from app.services.webhook import webhook_service as _ws
        background_tasks.add_task(_ws.trigger_welcome_webhook, {
            "email": email,
            "full_name": name or "Valued Client",
            "company_name": "",
            "sovereign_id": new_sovereign_id,
            "registered_at": "",
        })
    else:
        # SELF-HEALING: Legacy Data Fix
        if not user.sovereign_id:
            user_count_res = await db.execute(select(func.count(User.id)))
            user_count = user_count_res.scalar() or 0
            new_sovereign_id = f"OMEGO-{str(user_count + 1).zfill(4)}"

            check_existing = await db.execute(select(User).filter(User.sovereign_id == new_sovereign_id))
            if check_existing.scalars().first():
                entropy = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
                new_sovereign_id = f"OMEGO-{entropy}-{str(user_count).zfill(4)}"

            user.sovereign_id = new_sovereign_id
            needs_commit = True
            logger.info(f"[SELF-HEALING] Assigned Account ID {new_sovereign_id} to {email}")

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
    
    needs_commit = True  # Always commit to capture activity log
    if needs_commit:
        await db.commit()
        if user.id: # Refresh only if we have an ID
            await db.refresh(user)
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account Inactive")

    role = _effective_role(user.email, user.role)
    social_fwd_id = None
    if role == "forwarder":
        fwd_res = await db.execute(select(Forwarder).where(Forwarder.email == user.email))
        fwd = fwd_res.scalars().first()
        social_fwd_id = fwd.forwarder_id if fwd else user.sovereign_id
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "name": user.full_name or "User",
            "sovereign_id": user.sovereign_id,
            "role": role,
            "website": user.website
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
        "user_email": user.email,
        "onboarding_completed": user.onboarding_completed,
        "sovereign_id": user.sovereign_id,
        "role": role,
        "forwarder_id": social_fwd_id,
        "avatar_url": user.avatar_url,
        "website": user.website
    }

async def create_default_tasks(db: AsyncSession, user_id: str):
    """Create default onboarding tasks for a new user."""
    from app import crud
    default_tasks = [
        {
            "title": "Complete Your Profile",
            "description": "Add your company name, phone number, and contact details to your profile.",
            "task_type": "SECURITY",
            "priority": "HIGH"
        },
        {
            "title": "Verify Your Account",
            "description": "Complete identity verification to unlock all platform features.",
            "task_type": "SECURITY",
            "priority": "CRITICAL"
        },
        {
            "title": "Browse the Marketplace",
            "description": "Explore open freight requests and find the right shipping partner for your cargo.",
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

    if not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="This account was created with Google. Please use 'Sign in with Google' to login."
        )

    loop = asyncio.get_event_loop()
    pw_ok = await loop.run_in_executor(None, security.verify_password, form_data.password, user.password_hash)
    if not pw_ok:
        # Increment failed attempts
        current_attempts = int(user.failed_login_attempts or 0)
        new_attempts = current_attempts + 1
        update_data = {"failed_login_attempts": new_attempts}
        if new_attempts >= 5:
            update_data["is_locked"] = True
        
        await crud.user.update(db, user_id=str(user.id), obj_in=update_data)
        
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Reset on success + silently re-hash if using old slow params
    update_fields: dict = {}
    if int(user.failed_login_attempts or 0) > 0:
        update_fields["failed_login_attempts"] = 0

    # Detect old argon2 params (m=65536) and upgrade to fast params on the fly
    if security.pwd_context.needs_update(user.password_hash):
        new_hash = await loop.run_in_executor(None, security.get_password_hash, form_data.password)
        update_fields["password_hash"] = new_hash
        logger.info(f"[SECURITY] Upgraded argon2 hash params for user {user.id}")

    if update_fields:
        await crud.user.update(db, user_id=str(user.id), obj_in=update_fields)

    role = _effective_role(user.email, user.role)

    # Look up actual forwarder table ID (differs from sovereign_id for promoted users)
    forwarder_id_val = None
    if role == "forwarder":
        fwd_res = await db.execute(select(Forwarder).where(Forwarder.email == user.email))
        fwd = fwd_res.scalars().first()
        forwarder_id_val = fwd.forwarder_id if fwd else user.sovereign_id

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "name": user.full_name or "User",
            "role": role,
            "website": user.website,
            "sovereign_id": user.sovereign_id,
        },
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
        "user_email": user.email,
        "sovereign_id": user.sovereign_id or "OMEGO-PENDING",
        "role": role,
        "forwarder_id": forwarder_id_val,
        "onboarding_completed": user.onboarding_completed or False,
        "avatar_url": user.avatar_url,
        "website": user.website
    }

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    refresh_token: str = Body(..., embed=True),
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
        if user.is_locked:
            raise HTTPException(status_code=401, detail="Account is locked. Contact support.")

        # Reject refresh tokens issued before a password change
        if _redis_mod.redis_client:
            pw_changed_at = await _redis_mod.redis_client.get(f"pw_changed_at:{user.id}")
            if pw_changed_at:
                token_iat = payload.get("iat", 0)
                if token_iat < int(pw_changed_at):
                    raise HTTPException(status_code=401, detail="Session expired after a password change. Please log in again.")

        role = _effective_role(user.email, user.role)
        refresh_fwd_id = None
        if role == "forwarder":
            fwd_res = await db.execute(select(Forwarder).where(Forwarder.email == user.email))
            fwd = fwd_res.scalars().first()
            refresh_fwd_id = fwd.forwarder_id if fwd else user.sovereign_id
        access_token = security.create_access_token(
            data={
                "sub": user.email,
                "user_id": user.id,
                "name": user.full_name or "User",
                "role": role,
                "website": user.website,
                "sovereign_id": user.sovereign_id,
            }
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
            "avatar_url": user.avatar_url,
            "role": role,
            "forwarder_id": refresh_fwd_id,
            "website": user.website,
        }
    except Exception as e:
        logger.warning(f"[REFRESH] Token validation failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

@router.post("/register")
async def register_user(
    form_data: RegisterRequest,
    background_tasks: BackgroundTasks,
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
            detail="Password too weak. Must be 10+ chars with uppercase, lowercase, number, and special character."
        )

    existing_user = await crud.user.get_by_email(db, email=form_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please sign in."
        )

    # Hash password (CPU-bound, ~200ms)
    password_hash = security.get_password_hash(form_data.password)

    # SOVEREIGN ID — 2 queries, no commit yet
    user_count_res = await db.execute(select(func.count(User.id)))
    user_count = user_count_res.scalar() or 0
    new_sovereign_id = f"OMEGO-{str(user_count + 1).zfill(4)}"
    check_existing = await db.execute(select(User).filter(User.sovereign_id == new_sovereign_id))
    if check_existing.scalars().first():
        entropy = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        new_sovereign_id = f"OMEGO-{entropy}-{str(user_count).zfill(4)}"

    # Stage user (no commit)
    user = User(
        email=form_data.email.lower().strip(),
        password_hash=password_hash,
        full_name=form_data.full_name,
        company_name=form_data.company_name,
        sovereign_id=new_sovereign_id,
        role="user",
        onboarding_completed=True,
    )
    db.add(user)
    await db.flush()  # Gets user.id without committing

    # Stage 3 tasks (no commit)
    from app.models.task import Task
    for task_data in [
        {"title": "Complete Your Profile", "description": "Add your company name, phone number, and contact details to your profile.", "task_type": "SECURITY", "priority": "HIGH"},
        {"title": "Verify Your Account", "description": "Complete identity verification to unlock all platform features.", "task_type": "SECURITY", "priority": "CRITICAL"},
        {"title": "Browse the Marketplace", "description": "Explore open freight requests and find the right shipping partner for your cargo.", "task_type": "DOCUMENT", "priority": "MEDIUM"},
    ]:
        db.add(Task(**task_data, user_id=str(user.id)))

    # Stage activity (no commit)
    await activity_service.log(db, user_id=str(user.id), action="SIGNUP", entity_type="USER", entity_id=str(user.id), commit=False)

    # ONE commit for everything
    await db.commit()
    await db.refresh(user)

    # Send welcome email via n8n WF_WELCOME
    from app.services.webhook import webhook_service
    background_tasks.add_task(webhook_service.trigger_welcome_webhook, {
        "email": user.email,
        "full_name": user.full_name or "Valued Client",
        "company_name": user.company_name or "",
        "sovereign_id": user.sovereign_id or "",
        "registered_at": user.created_at.isoformat() if user.created_at else ""
    })

    return {
        "success": True,
        "message": "Account created successfully. Please sign in.",
        "user_id": str(user.id)
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db),
):
    """Get current user profile."""
    user = current_user
        
    role = _effective_role(user.email, user.role)
    me_forwarder_id = None
    if role == "forwarder":
        fwd_res = await db.execute(select(Forwarder).where(Forwarder.email == user.email))
        fwd = fwd_res.scalars().first()
        me_forwarder_id = fwd.forwarder_id if fwd else user.sovereign_id
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "company_name": user.company_name,
        "company_email": user.company_email,
        "phone_number": user.phone_number,
        "website": user.website,
        "sovereign_id": user.sovereign_id,
        "onboarding_completed": user.onboarding_completed,
        "avatar_url": user.avatar_url,
        "role": role,
        "forwarder_id": me_forwarder_id,
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
    token: str = Depends(reusable_oauth2),
    db: AsyncSession = Depends(deps.get_db)
):
    """Update current user profile."""
    payload = security.decode_token(token)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    updated_user = await crud.user.update(db, user_id=user_id, obj_in=update_data.model_dump(exclude_unset=True))
    
    # AUDIT PILLAR: Log Profile Update
    await activity_service.log(
        db,
        user_id=str(user_id),
        action="PROFILE_UPDATE",
        entity_type="USER",
        entity_id=str(user_id)
    )
    
    return updated_user

from app.core import redis as _redis_mod

@router.post("/logout")
async def logout(
    token: str = Depends(reusable_oauth2),
    db: AsyncSession = Depends(deps.get_db)
):
    """Logout endpoint. Adds token to blacklist and logs the event."""
    try:
        payload = security.decode_token(token)
        user_id = payload.get("user_id")

        # Blacklist the token in Redis
        if _redis_mod.redis_client:
            # Token expiration time could be extracted from payload ('exp'), else default to ACCESS_TOKEN_EXPIRE_MINUTES
            exp = payload.get("exp")
            import time
            current_time = int(time.time())
            ttl = exp - current_time if exp else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            if ttl > 0:
                await _redis_mod.redis_client.setex(f"blacklist:{token}", ttl, "true")
        
        if user_id:
            await activity_service.log(
                db,
                user_id=str(user_id),
                action="LOGOUT",
                entity_type="USER",
                entity_id=str(user_id)
            )
    except Exception as e:
        logger.warning(f"[LOGOUT] Failed to blacklist token or log event: {e}")
    return {"success": True, "message": "Logged out successfully"}

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Change user password."""
    user_id = current_user.id
    user = current_user
    loop = asyncio.get_event_loop()
    pw_ok = await loop.run_in_executor(None, security.verify_password, data.current_password, user.password_hash or "")
    if not user.password_hash or not pw_ok:
        raise HTTPException(status_code=400, detail="Invalid current password")
    
    if not security.validate_password_strength(data.new_password):
        raise HTTPException(status_code=400, detail="Password too weak. Must be 10+ chars with uppercase, lowercase, number, and special character.")
        
    await crud.user.update(db, user_id=user_id, obj_in={"password_hash": security.get_password_hash(data.new_password)})

    # Invalidate all existing sessions (attacker with stolen token can no longer use it)
    import time as _time
    if _redis_mod.redis_client:
        await _redis_mod.redis_client.setex(f"pw_changed_at:{user_id}", 86400 * 30, str(int(_time.time())))

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

class ResetPassword(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, background_tasks: BackgroundTasks, db: AsyncSession = Depends(deps.get_db)):
    """
    Generates a single-use signed 1-hour reset token and fires a webhook so n8n emails the link.
    Security:
    - Rate limited to 1 request per 2 minutes per email (prevents inbox flooding)
    - Each new request invalidates the previous token (only latest token is valid)
    - Always returns the same response to prevent email enumeration
    """
    import os, uuid, time
    from app.services.webhook import webhook_service
    from app.core import redis as _redis_mod

    email = data.email.lower().strip()

    # Rate limit: 1 reset request per email per 2 minutes
    if _redis_mod.redis_client:
        cooldown_key = f"reset_cooldown:{email}"
        if await _redis_mod.redis_client.get(cooldown_key):
            # Silent success to avoid timing attacks revealing whether email is registered
            return {"success": True, "message": "If this email is registered, a reset link will be sent."}

    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalars().first()

    if user:
        jti = str(uuid.uuid4())
        reset_token = security.create_access_token(
            data={"sub": user.email, "purpose": "password_reset", "jti": jti},
            expires_delta=timedelta(minutes=60),
        )
        if _redis_mod.redis_client:
            # Store latest JTI — overwrites any previous token (only 1 valid at a time)
            await _redis_mod.redis_client.setex(f"reset_jti:{user.id}", 3600, jti)
            # Rate limit this email for 2 minutes
            await _redis_mod.redis_client.setex(f"reset_cooldown:{email}", 120, "1")

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        background_tasks.add_task(webhook_service.trigger_password_reset_webhook, {
            "email": user.email,
            "full_name": user.full_name or "User",
            "reset_url": reset_url,
        })

    return {"success": True, "message": "If this email is registered, a reset link will be sent."}


@router.post("/reset-password")
async def reset_password(data: ResetPassword, background_tasks: BackgroundTasks, db: AsyncSession = Depends(deps.get_db)):
    """
    Verifies and consumes the password reset token, then sets the new password.
    Security:
    - Token is single-use (deleted from Redis on first use)
    - Only the LATEST issued token is valid (replaces any older link)
    - All existing sessions are invalidated after reset (kills attacker sessions too)
    - Security alert fired via n8n after successful reset
    """
    import time
    from app.services.webhook import webhook_service
    from app.core import redis as _redis_mod

    try:
        payload = security.decode_token(data.token)
    except HTTPException:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")

    if payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    email = payload.get("sub")
    jti = payload.get("jti")
    if not email or not jti:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    # Verify JTI — ensures this is the latest token and hasn't been used yet
    if _redis_mod.redis_client:
        stored_jti = await _redis_mod.redis_client.get(f"reset_jti:{user.id}")
        if not stored_jti or stored_jti != jti:
            raise HTTPException(
                status_code=400,
                detail="This reset link has already been used or a newer one was requested. Please request a new link."
            )

    if not security.validate_password_strength(data.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password too weak. Must be 10+ chars with uppercase, lowercase, number, and special character."
        )

    # Update password
    await crud.user.update(db, user_id=user.id, obj_in={"password_hash": security.get_password_hash(data.new_password)})

    if _redis_mod.redis_client:
        # Consume the token — it cannot be used again
        await _redis_mod.redis_client.delete(f"reset_jti:{user.id}")
        # Invalidate ALL existing sessions — tokens issued before NOW are rejected
        # This logs out any attacker who had a live session on this account
        await _redis_mod.redis_client.setex(f"pw_changed_at:{user.id}", 86400 * 30, str(int(time.time())))

    # Fire security alert so the real user knows their password was just changed
    background_tasks.add_task(webhook_service.trigger_password_reset_webhook, {
        "email": user.email,
        "full_name": user.full_name or "User",
        "reset_url": "",
        "is_confirmation": True,
        "alert": "Your CargoLink password was just reset. If this wasn't you, contact support immediately.",
    })

    return {"success": True, "message": "Password reset successfully. You can now log in with your new password."}

