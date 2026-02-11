from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
from collections import defaultdict
from app.api.routers import quotes, auth, bookings, tracking, ai, documents, references, dashboard
from app.core.config import settings
from app.db.session import engine, Base
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Sovereign Database Handshake
    # Schema harmonization is now handled via Alembic migrations.
    from app.services.knowledge import knowledge_oracle
    import asyncio
    asyncio.create_task(knowledge_oracle.refresh_intelligence())
    
    print("[SYSTEM] Phoenix Logistics OS Backend Initialized.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="The 'True Ocean' Protocol. Uses strictly real API integrations.",
    lifespan=lifespan
)

# Rate Limiting Logic (Simple in-memory for Best-of-All-Time efficiency)
user_rates = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    current_time = time.time()
    
    # Clean old requests
    user_rates[client_ip] = [t for t in user_rates[client_ip] if current_time - t < 60]
    
    if len(user_rates[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Too many requests. Oracle threshold reached.")
    
    user_rates[client_ip].append(current_time)
    response = await call_next(request)
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the 'Honest' Routers
# Mount references first to avoid greedy matching if any
app.include_router(references.router, prefix="/api", tags=["Reference Data"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["Ocean Quotes"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Global Tracking"])
app.include_router(ai.router, prefix="/api/ai", tags=["Creative Cortex AI"])
app.include_router(documents.router, prefix="/api/documents", tags=["Document AI"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def health_check():
    return {
        "status": "Online",
        "mode": "TRUE_OCEAN_PROTOCOL",
        "note": "This system connects to Real APIs only. Authentication required."
    }
