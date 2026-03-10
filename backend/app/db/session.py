import asyncio
import sys
import ssl as ssl_mod
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# REAL DATABASE CONNECTION
# This requires DATABASE_URL to be set in .env
# Example: postgresql+asyncpg://user:password@localhost/logistics_db

DATABASE_URL = settings.DATABASE_URL

# Critical for Windows + Neon SSL stability
# asyncpg on Windows requires explicit SSLContext, not string "require"
_is_neon = "neon.tech" in DATABASE_URL

_connect_args = {}
if _is_neon:
    ctx = ssl_mod.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl_mod.CERT_NONE
    _connect_args = {
        "ssl": ctx,
        "command_timeout": 30,
        "server_settings": {"application_name": "omego_backend"}
    }

engine = create_async_engine(
    DATABASE_URL, 
    echo=settings.DEBUG, 
    pool_pre_ping=True, 
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
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
