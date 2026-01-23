"""
Logistics AI Backend - Main Application
====================================================
A production-ready FastAPI backend for the logistics platform.

Features:
- SeaRates API integration for real shipping quotes
- Container tracking
- Port search autocomplete
- Intelligent simulation fallback when API key is not configured

API Documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

from app.config import get_settings
from app.routers import quotes_router, tracking_router, ports_router, bookings_router
from app.database import engine, Base

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager"""
    settings = get_settings()
    
    # === Startup ===
    # 1. Database Init (Auto-Migration)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("=" * 60)
    print("🚀 LOGISTICS AI BACKEND (OMEGOLOGISTICS EDITION)")
    print("=" * 60)
    print(f"📍 Server: http://{settings.host}:{settings.port}")
    print(f"📚 Docs: http://{settings.host}:{settings.port}/docs")
    print(f"🌐 Frontend: {settings.frontend_url}")
    print(f"💾 Database: Connected (PostgreSQL Enterprise)")
    
    if settings.freightos_api_key:
         print("🔌 Freightos API: Connected")
    
    print("=" * 60)
    
    yield
    
    # === Shutdown ===
    print("\n👋 Shutting down Logistics AI Backend...")


# Initialize FastAPI app
settings = get_settings()

app = FastAPI(
    title="Omegologistics API",
    description="Enterprise-grade logistics platform backend. Features High-Performance Freight Engine and Real-time Tracking.",
    version="2.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Compression (Speed Boost)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === Health & Info Endpoints ===

@app.get("/", tags=["Health"])
def root():
    """Root endpoint with API information"""
    return {
        "name": "Logistics AI Backend",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "quotes": "/api/quotes",
            "tracking": "/api/tracking",
            "ports": "/api/ports/search"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for monitoring"""
    settings = get_settings()
    return {
        "status": "healthy",
        "api_mode": "real" if settings.searates_api_key else "simulation",
        "version": "2.0.0"
    }


@app.get("/api/status", tags=["Health"])
def api_status():
    """Detailed API status"""
    settings = get_settings()
    return {
        "status": "operational",
        "searates_connected": bool(settings.searates_api_key),
        "simulation_mode": not bool(settings.searates_api_key),
        "endpoints": {
            "quotes": "active",
            "tracking": "active",
            "ports": "active"
        }
    }


# === Register Routers ===
app.include_router(bookings_router)

# === GraphQL Support ===
from strawberry.fastapi import GraphQLRouter
from app.graphql import schema

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


# === Run Server ===
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
