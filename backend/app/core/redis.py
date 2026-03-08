"""
Shared Redis client reference.
Initialized by main.py lifespan; None until then (safe to check).
"""
import redis.asyncio as aioredis
from typing import Optional

redis_client: Optional[aioredis.Redis] = None
