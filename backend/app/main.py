from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import quotes, auth, bookings, tracking, ai, documents, references
from app.core.config import settings
from app.db.session import engine, Base
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Sovereign Database Handshake
    async with engine.begin() as conn:
        print("[DB] Harmonizing Sovereign Database Schema...")
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="The 'True Ocean' Protocol. Uses strictly real API integrations.",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the 'Honest' Routers
app.include_router(quotes.router, prefix="/api/quotes", tags=["Ocean Quotes"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Global Tracking"])
app.include_router(ai.router, prefix="/api/ai", tags=["Creative Cortex AI"])
app.include_router(documents.router, prefix="/api/documents", tags=["Document AI"])
app.include_router(references.router, prefix="/api", tags=["Reference Data"]) # Mounts at /api/ports, etc.

@app.get("/")
def health_check():
    return {
        "status": "Online",
        "mode": "TRUE_OCEAN_PROTOCOL",
        "note": "This system connects to Real APIs only. Authentication required."
    }
