import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # MISSION CRITICAL: Pydantic Settings automatically loads from .env 
    # if fields are defined without hardcoded defaults in the constructor logic.
    
    PROJECT_NAME: str = "Logistics OS (OMEGO)"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # OCEAN CARRIER KEYS (Loaded from .env)
    MAERSK_CONSUMER_KEY: str = ""
    MAERSK_CONSUMER_SECRET: str = ""
    MAERSK_INTEGRATION_ID: str = ""
    
    # DATABASE CONFIG
    DATABASE_URL: str = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"
    
    # AI & KNOWLEDGE
    REDIS_URL: str = "redis://localhost:6379/0"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    OPENAI_API_KEY: str = ""
    
    # GOOGLE ENTERPRISE
    GOOGLE_CLOUD_PROJECT: str = "OMEGO-logistics-2026"
    GOOGLE_CLIENT_ID: str = "852578606600-um6nsb17r0qm2hs5m7jmfhohtdcb9o27.apps.googleusercontent.com" # OMEGO Production Client
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_API_KEY: str = ""

    # AUTHENTICATION
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # N8N SECURE HANDSHAKE KEY
    OMEGO_API_SECRET: str = "OMEGO_SUPER_SECRET_KEY_2026"

    # CORS & RATE LIMITING
    # We load the raw string and then parse it via property
    ALLOWED_ORIGINS_RAW: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    
    @property
    def ALLOWED_ORIGINS(self) -> list:
        # Split by comma and clean whitespace
        return [o.strip() for o in self.ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

    RATE_LIMIT_PER_MINUTE: int = 60
    AI_PERSONA: str = "Logistics Oracle"

    # Pydantic V2 Config
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='allow'
    )

settings = Settings()
