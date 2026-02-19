from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
from collections import defaultdict
from app.api.routers import quotes, auth, bookings, tracking, ai, documents, references, dashboard, vessels, billing
from app.core.config import settings
from contextlib import asynccontextmanager

import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Sovereign Database Handshake
    try:
        from app.services.knowledge import knowledge_oracle
        await knowledge_oracle.initialize()
        
        print(f"[SYSTEM] OMEGO LOGISTICS OS Backend Initialized.")
        print(f"[SYSTEM] CORS WHITELIST: {settings.ALLOWED_ORIGINS}")
        yield
    except asyncio.CancelledError:
        print(f"[SYSTEM] OMEGO LOGISTICS OS: Shutdown Signal Received.")
    finally:
        print(f"[SYSTEM] OMEGO LOGISTICS OS: Securely Offline.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="The 'True Ocean' Protocol. Uses strictly real API integrations.",
    lifespan=lifespan
)

# Rate Limiting Logic (World-Class Efficiency)
user_rates = defaultdict(list)

from fastapi.responses import JSONResponse

# SECURITY HEADERS MIDDLEWARE (Standard implementation to avoid BaseHTTPMiddleware overhead)
@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # 1. Rate Limit Check (Bypass for Localhost)
    if client_ip not in ["127.0.0.1", "::1"]:
        current_time = time.time()
        # Clean old marks
        user_rates[client_ip] = [t for t in user_rates[client_ip] if current_time - t < 60]
        if len(user_rates[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=429, 
                content={"detail": "Sovereign Threshold Exceeded."}
            )

        user_rates[client_ip].append(current_time)

    # 2. Process Request
    try:
        response = await call_next(request)
        
        # 3. Add Security Headers (Skip for non-responses)
        if hasattr(response, "headers"):
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response
    except asyncio.CancelledError:
        # Expected on Sovereign Shutdown
        raise
    except Exception as e:
        # LOG AND RERISE (Let FastAPI exception handlers handle it)
        print(f"[MIDDLEWARE_CRITICAL] Exception caught: {e}")
        raise e

# Mount the 'Honest' Routers
app.include_router(references.router, prefix="/api/references", tags=["Reference Data"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["Ocean Quotes"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Global Tracking"])
app.include_router(ai.router, prefix="/api/ai", tags=["Creative Cortex AI"])
app.include_router(documents.router, prefix="/api/documents", tags=["Document AI"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(vessels.router, prefix="/api/vessels", tags=["Maritime Assets"])
app.include_router(billing.router, prefix="/api/billing", tags=["Sovereign Billing"])

@app.get("/health")
@app.get("/")
def health_check():
    return {
        "status": "Online",
        "mode": "TRUE_OCEAN_PROTOCOL",
        "note": "This system connects to Real APIs only. Authentication required."
    }

# CORS CONFIGURATION (G.O.A.T. Security - OUTERMOST)
# Must be added AFTER all @app.middleware to be the OUTERMOST for requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
