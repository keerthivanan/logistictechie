import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PHOENIX LOGISTICS OS"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # CRITICAL: These keys must remain empty here.
    # They MUST be provided in the .env file.
    # If missing, the application will log a warning but won't fake data.
    
    MAERSK_CONSUMER_KEY: str = os.getenv("MAERSK_CONSUMER_KEY", "")
    MAERSK_CONSUMER_SECRET: str = os.getenv("MAERSK_CONSUMER_SECRET", "")
    MAERSK_INTEGRATION_ID: str = os.getenv("MAERSK_INTEGRATION_ID", "")
    
    # Removed legacy carriers (Searates, CMA, MSC) for simplicity as requested.
    
    # DATABASE CONFIG (PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db")
    
    # AI & KNOWLEDGE CONFIG
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", 6333))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # GOOGLE ENTERPRISE SUITE
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "phoenix-logistics-2026")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")

    # NOTIFICATIONS & COMMUNICATION (Production Ready)
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")

    # AUTHENTICATION
    # Removed default fallback to force production-safe configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # CORS & RATE LIMITING
    # Pydantic Settings handles .env override automatically. 
    # We use a string for the .env source to avoid complex parsing.
    ALLOWED_ORIGINS_RAW: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    
    @property
    def ALLOWED_ORIGINS(self) -> list:
        return [o.strip() for o in self.ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

    RATE_LIMIT_PER_MINUTE: int = 60
    AI_PERSONA: str = "Logistics Oracle"

    class Config:
        # Load .env from backend/ directory
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        extra = "allow" # Robustness: Ignore unknown env vars rather than crashing

settings = Settings()
