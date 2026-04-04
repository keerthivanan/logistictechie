from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.forwarder import Forwarder
from app.models.user import User
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.api.deps import get_admin_user
from app.services.webhook import webhook_service
from datetime import datetime, timezone

router = APIRouter()


@router.get("/pending-forwarders")
async def list_pending_forwarders(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """List all forwarder applications awaiting approval."""
    result = await db.execute(
        select(Forwarder).where(Forwarder.status == "PENDING").order_by(Forwarder.registered_at.desc())
    )
    forwarders = result.scalars().all()
    return [
        {
            "forwarder_id": f.forwarder_id,
            "company_name": f.company_name,
            "contact_person": f.contact_person,
            "email": f.email,
            "company_email": f.company_email,
            "phone": f.phone,
            "country": f.country,
            "specializations": f.specializations,
            "routes": f.routes,
            "tax_id": f.tax_id,
            "website": f.website,
            "document_url": f.document_url,
            "logo_url": f.logo_url,
            "registered_at": str(f.registered_at),
            "status": f.status,
        }
        for f in forwarders
    ]


@router.get("/all-forwarders")
async def list_all_forwarders(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """List all forwarders (all statuses) for admin overview."""
    result = await db.execute(
        select(Forwarder).order_by(Forwarder.registered_at.desc())
    )
    forwarders = result.scalars().all()
    return [
        {
            "forwarder_id": f.forwarder_id,
            "company_name": f.company_name,
            "contact_person": f.contact_person,
            "email": f.email,
            "country": f.country,
            "specializations": f.specializations,
            "status": f.status,
            "registered_at": str(f.registered_at),
            "is_verified": f.is_verified,
        }
        for f in forwarders
    ]


@router.get("/all-users")
async def list_all_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """List all registered users for admin overview."""
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "sovereign_id": u.sovereign_id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "is_locked": u.is_locked,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


@router.post("/approve-forwarder/{forwarder_id}")
async def approve_forwarder(
    forwarder_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """
    Approve a pending forwarder application.
    - Sets forwarder status = ACTIVE
    - Sets user role = forwarder
    - Changes user sovereign_id from OMEGO-XXXX to REG-OMEGO-XXXX
    """
    # Get forwarder record
    f_result = await db.execute(select(Forwarder).where(Forwarder.forwarder_id == forwarder_id))
    forwarder = f_result.scalars().first()
    if not forwarder:
        raise HTTPException(status_code=404, detail="Forwarder not found.")
    if forwarder.status == "ACTIVE":
        raise HTTPException(status_code=400, detail="Already approved.")

    # Get linked user by email
    u_result = await db.execute(select(User).where(User.email == forwarder.email))
    user = u_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User account for {forwarder.email} not found.")

    # Approve forwarder
    forwarder.status = "ACTIVE"
    forwarder.is_verified = True
    forwarder.activated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    # Promote user — only now do we change sovereign_id and role
    old_sovereign_id = user.sovereign_id
    if not old_sovereign_id.startswith("REG-"):
        user.sovereign_id = f"REG-{old_sovereign_id}"
    user.role = "forwarder"

    await db.commit()

    background_tasks.add_task(webhook_service.trigger_forwarder_decision_webhook, {
        "decision": "APPROVED",
        "forwarder_id": forwarder.forwarder_id,
        "company_name": forwarder.company_name,
        "contact_person": forwarder.contact_person,
        "email": forwarder.email,
        "country": forwarder.country,
        "new_sovereign_id": user.sovereign_id,
    })

    return {
        "success": True,
        "message": f"{forwarder.company_name} approved.",
        "forwarder_id": forwarder.forwarder_id,
        "new_sovereign_id": user.sovereign_id,
    }


@router.post("/reject-forwarder/{forwarder_id}")
async def reject_forwarder(
    forwarder_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Reject a pending forwarder application."""
    f_result = await db.execute(select(Forwarder).where(Forwarder.forwarder_id == forwarder_id))
    forwarder = f_result.scalars().first()
    if not forwarder:
        raise HTTPException(status_code=404, detail="Forwarder not found.")

    forwarder.status = "REJECTED"
    await db.commit()

    background_tasks.add_task(webhook_service.trigger_forwarder_decision_webhook, {
        "decision": "REJECTED",
        "forwarder_id": forwarder.forwarder_id,
        "company_name": forwarder.company_name,
        "contact_person": forwarder.contact_person,
        "email": forwarder.email,
        "country": forwarder.country,
    })

    return {
        "success": True,
        "message": f"{forwarder.company_name} application rejected.",
    }


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Full stats for the admin dashboard."""
    # --- Users ---
    total_users        = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users       = (await db.execute(select(func.count(User.id)).where(User.is_active == True, User.is_locked == False))).scalar() or 0
    inactive_users     = (await db.execute(select(func.count(User.id)).where((User.is_active == False) | (User.is_locked == True)))).scalar() or 0
    forwarder_users    = (await db.execute(select(func.count(User.id)).where(User.role == "forwarder"))).scalar() or 0
    regular_users      = (await db.execute(select(func.count(User.id)).where(User.role == "user"))).scalar() or 0

    # --- Forwarders ---
    total_forwarders   = (await db.execute(select(func.count(Forwarder.id)))).scalar() or 0
    pending            = (await db.execute(select(func.count(Forwarder.id)).where(Forwarder.status == "PENDING"))).scalar() or 0
    active_forwarders  = (await db.execute(select(func.count(Forwarder.id)).where(Forwarder.status == "ACTIVE"))).scalar() or 0
    rejected           = (await db.execute(select(func.count(Forwarder.id)).where(Forwarder.status == "REJECTED"))).scalar() or 0

    # --- Marketplace ---
    total_requests     = (await db.execute(select(func.count(MarketplaceRequest.id)))).scalar() or 0
    open_requests      = (await db.execute(select(func.count(MarketplaceRequest.id)).where(MarketplaceRequest.status == "OPEN"))).scalar() or 0
    closed_requests    = (await db.execute(select(func.count(MarketplaceRequest.id)).where(MarketplaceRequest.status == "CLOSED"))).scalar() or 0
    total_quotes       = (await db.execute(select(func.count(MarketplaceBid.id)))).scalar() or 0

    locked_users = (await db.execute(select(func.count(User.id)).where(User.is_locked == True))).scalar() or 0

    return {
        # Users
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "locked_users": locked_users,
        "forwarder_users": forwarder_users,
        "regular_users": regular_users,
        # Forwarders
        "total_forwarders": total_forwarders,
        "pending_applications": pending,
        "active_forwarders": active_forwarders,
        "rejected_applications": rejected,
        # Marketplace
        "total_requests": total_requests,
        "open_requests": open_requests,
        "closed_requests": closed_requests,
        "total_quotes": total_quotes,
    }


@router.post("/unlock-user/{user_id}")
async def unlock_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Unlock a user account that was locked after repeated failed login attempts."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user.is_locked:
        return {"success": True, "message": f"{user.email} is not locked."}
    user.is_locked = False
    user.failed_login_attempts = 0
    await db.commit()
    return {"success": True, "message": f"{user.email} has been unlocked."}
