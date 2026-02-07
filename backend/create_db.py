import asyncio
import asyncpg
from app.core.config import settings
from urllib.parse import urlparse

# 🛠️ DATABASE CREATION SCRIPT
# Connects to default 'postgres' DB to create 'logistics_os'

async def create_database():
    # Parse the configured URL to get credentials
    # e.g. postgresql+asyncpg://postgres:password@localhost/logistics_os
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    parsed = urlparse(url)
    
    # Connect to the default 'postgres' database to perform administrative tasks
    # We strip the path (dbname) and replace with 'postgres'
    port = parsed.port if parsed.port else 5432
    admin_url = f"postgresql://{parsed.username}:{parsed.password}@{parsed.hostname}:{port}/postgres"
    
    target_db = parsed.path.lstrip('/')
    
    print(f"Connecting to System DB to create: '{target_db}'...")
    
    try:
        sys_conn = await asyncpg.connect(admin_url)
        
        # Check if DB exists
        exists = await sys_conn.fetchval(f"SELECT 1 FROM pg_database WHERE datname='{target_db}'")
        
        if not exists:
            print(f"Creating database '{target_db}'...")
            await sys_conn.execute(f'CREATE DATABASE "{target_db}"')
            print("Database created successfully.")
        else:
            print(f"Database '{target_db}' already exists.")
            
        await sys_conn.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")
        # If password failure, it means the .env is still wrong
        if "password authentication failed" in str(e):
             print("\nCRITICAL: Your password in .env is still incorrect.")

if __name__ == "__main__":
    import os
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(create_database())
