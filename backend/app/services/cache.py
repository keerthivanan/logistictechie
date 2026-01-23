"""
Logistics AI Backend - Distributed Cache (Redis)
================================================
Enterprise Caching Layer for sub-millisecond data retrieval.
Connects to Redis Cluster or Standalone instance.
"""
import redis.asyncio as redis
import json
from typing import Optional, Any, Union
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

class CacheEngine:
    """
    High-Performance Cache Wrapper.
    Gracefully handles Redis connection failures to fail-safe.
    """
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.enabled = False
        
        if settings.redis_url:
            try:
                self.redis = redis.from_url(
                    settings.redis_url, 
                    encoding="utf-8", 
                    decode_responses=True
                )
                self.enabled = True
                logger.info("🚀 Enterprise Cache: Redis Connected.")
            except Exception as e:
                logger.error(f"❌ Cache Init Failed: {e}")

    async def get(self, key: str) -> Optional[dict]:
        """Get structured data from cache"""
        if not self.enabled or not self.redis:
            return None
        try:
            data = await self.redis.get(key)
            return json.loads(data) if data else None
        except Exception:
            return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        """Set structured data with TTL (Time To Live)"""
        if not self.enabled or not self.redis:
            return
        try:
            # Serialize if object/dict
            if isinstance(value, (dict, list)):
                value_str = json.dumps(value)
            else:
                value_str = str(value)
                
            await self.redis.set(key, value_str, ex=ttl)
        except Exception as e:
            logger.warning(f"Cache Write Failed: {e}")

    async def ping(self):
        if self.enabled and self.redis:
            return await self.redis.ping()
        return False

# Global Cache Instance
cache = CacheEngine()
