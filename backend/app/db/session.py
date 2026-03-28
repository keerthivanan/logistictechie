import asyncio
import sys
import ssl as ssl_mod
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# REAL DATABASE CONNECTION
# This requires DATABASE_URL to be set in .env
# Example: postgresql+asyncpg://user:password@localhost/logistics_db

_raw_url = settings.DATABASE_URL

# Critical for NeonDB + asyncpg: strip ?ssl=require from URL (handled via connect_args below)
# asyncpg raises "duplicate SSL arguments" if ssl appears in both the URL and connect_args
_is_neon = "neon.tech" in _raw_url
DATABASE_URL = _raw_url.split("?")[0] if _is_neon else _raw_url

_connect_args = {}
if _is_neon:
    ctx = ssl_mod.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl_mod.CERT_NONE
    _connect_args = {
        "ssl": ctx,
        "command_timeout": 30,
        "server_settings": {"application_name": "cargolink_backend"},
    }

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=240,      # Recycle before Neon's 5-min sleep threshold
    pool_size=10,          # More warm connections ready
    max_overflow=20,
    pool_timeout=30,
    connect_args=_connect_args
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
