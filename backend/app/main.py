import asyncio
import sys

# Critical fix for Windows: asyncpg + Neon SSL handshake
if sys.platform == "win32":
    try:
        from asyncio import WindowsSelectorEventLoopPolicy
        asyncio.set_event_loop_policy(WindowsSelectorEventLoopPolicy())
    except ImportError:
        pass

from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from fastapi.middleware.cors import CORSMiddleware
import time
from app.api.routers import auth, references, dashboard, marketplace, forwarders, tasks, quotes, tools, admin, bookings, conversations, forwarder_conversations
from app.core.config import settings
from contextlib import asynccontextmanager
from app.models.user import User
from app.api.deps import get_current_user
import redis.asyncio as aioredis
from app.core import redis as redis_mod

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        redis_mod.redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        print(f"[SYSTEM] CargoLink Logistics OS Backend Initialized.")
        print(f"[SYSTEM] CORS WHITELIST: {settings.ALLOWED_ORIGINS}")
        yield
    except asyncio.CancelledError:
        print(f"[SYSTEM] CargoLink Logistics OS: Shutdown Signal Received.")
    finally:
        if redis_mod.redis_client:
            await redis_mod.redis_client.aclose()
        print(f"[SYSTEM] CargoLink Logistics OS: Securely Offline.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CargoLink API — Freight logistics platform.",
    lifespan=lifespan
)

# SECURITY HEADERS + REDIS RATE LIMITING MIDDLEWARE
@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Rate Limit Check via Redis ZSET (Bypass for Localhost)
    if client_ip not in ["127.0.0.1", "::1"] and redis_mod.redis_client is not None:
        try:
            now = time.time()
            key = f"rate:{client_ip}"
            pipe = redis_mod.redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, now - 60)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, 60)
            results = await pipe.execute()
            request_count = results[2]
            if request_count > settings.RATE_LIMIT_PER_MINUTE:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again in a moment."}
                )
        except Exception as e:
            # Silent fallback for Redis connection errors to keep logs clean
            if "Connect call failed" not in str(e):
                print(f"[REDIS_WARNING] Rate limiting disabled: {e}")

    # 2. Process Request
    try:
        response = await call_next(request)

        # 3. Add Security Headers
        if hasattr(response, "headers"):
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response
    except asyncio.CancelledError:
        raise
    except Exception as e:
        print(f"[MIDDLEWARE_CRITICAL] Exception caught: {e}")
        raise e

# Mount the 'Honest' Routers
app.include_router(references.router, prefix="/api/references", tags=["Reference Data"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace Bidding"])
app.include_router(forwarders.router, prefix="/api/forwarders", tags=["Forwarder Network"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["User Tasks"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["Instant Quote Engine"])
app.include_router(tools.router, prefix="/api/tools", tags=["Freight Intelligence Tools"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(forwarder_conversations.router, prefix="/api/forwarders/conversations", tags=["Forwarder Portal Chat"])

# GLOBAL BRIDGE: Headless n8n Aliases (Matches COMPLETE_SETUP_GUIDE hardcoded URLs)
# All 4 routes are protected by verify_n8n_webhook
@app.post("/api/request-sync", tags=["n8n Global Bridge"])
async def global_request_sync(
    request: Request,
    sync_in: marketplace.N8nRequestSync,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(deps.verify_n8n_webhook),
):
    return await marketplace.n8n_request_sync(sync_in, db)

@app.post("/api/quotations/new", tags=["n8n Global Bridge"])
async def global_quote_sync(
    request: Request,
    sync_in: marketplace.N8nQuoteSync,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(deps.verify_n8n_webhook),
):
    return await marketplace.n8n_quote_sync(sync_in, db)

@app.post("/api/requests/close", tags=["n8n Global Bridge"])
async def global_request_close(
    request: Request,
    sync_in: marketplace.N8nStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(deps.verify_n8n_webhook),
):
    return await marketplace.n8n_requests_close(sync_in, db)

@app.post("/api/bid-status-sync", tags=["n8n Global Bridge"])
async def global_bid_status_sync(
    request: Request,
    sync_in: marketplace.N8nBidStatusSync,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(deps.verify_n8n_webhook),
):
    return await marketplace.n8n_bid_status_sync(sync_in, db)

@app.get("/api/forwarder/my-bids", tags=["n8n Global Bridge"]) # Singular alias for Guide Step 10
async def global_forwarder_my_bids(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await forwarders.get_forwarder_bids(db, current_user)


@app.get("/health")
@app.get("/api/health")
@app.get("/")
def health_check():
    return {
        "status": "Online",
        "note": "CargoLink API is running. Authentication required."
    }

# CORS CONFIGURATION (G.O.A.T. Security - OUTERMOST)
# Must be added AFTER all @app.middleware to be the OUTERMOST for requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With", "X-OMEGO-Key", "ngrok-skip-browser-warning"],
    expose_headers=["X-Total-Count", "X-Request-ID"],
    max_age=600,
)
