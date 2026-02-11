import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings

print(f"KEY_REPR: {repr(settings.MAERSK_CONSUMER_KEY)}")
print(f"SEC_REPR: {repr(settings.MAERSK_CONSUMER_SECRET)}")
