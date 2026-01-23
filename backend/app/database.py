"""
Logistics AI Backend - Enterprise Database Core
===============================================
STRICT POSTGRESQL ENGINE.
SQLite support has been permanently removed per architecture requirements.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import AsyncAdaptedQueuePool
import logging

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Verify Database URL is PostgreSQL
if "postgresql" not in settings.database_url:
    err_msg = "❌ CRITICAL: Codebase is locked to PostgreSQL only. Please update .env with a valid postgresql+asyncpg:// URL."
    logger.critical(err_msg)
    raise ValueError(err_msg)

logger.info("🚀 Enterprise Database: Initializing PostgreSQL Connection Pool...")

# High-Performance PostgreSQL Configuration
# Optimized for production scale and reliability.
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=20,           # Handle 20 concurrent DB connections
    pool_recycle=1800,      # Recycle connections every 30 mins
    pool_pre_ping=True,     # Auto-heal stale connections
    max_overflow=10         # Burst capacity
)

# Enterprise Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    pass

# Dependency Injection
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
