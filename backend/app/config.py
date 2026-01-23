"""
Logistics AI Backend - Configuration Module
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys (Legacy)
    # searates_api_key removed.
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    # Database (PostgreSQL ONLY)
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/logistics_db"
    search_path: str = "public"
    
    # Enterprise Caching (Redis)
    redis_url: str = "" # e.g. redis://localhost:6379/0
    
    # Omegologistics Credentials
    freightos_api_key: str = ""
    freightos_secret_key: str = ""
    omegologistics_app_id: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()
