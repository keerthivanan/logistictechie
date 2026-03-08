import asyncio
import sys
import uvicorn

# ==============================================================================
# 🚨 CRITICAL WINDOWS POSTGRES FIX (PSYCOPG3) 🚨
# The `uvicorn` command line tool ALWAYS initializes the default ProactorEventLoop
# BEFORE our code in main.py ever runs. This permanently crashes psycopg3.
# The ONLY way to run this on Windows is to manually enforce the SelectorEventLoop
# first, and THEN launch uvicorn programmatically.
# ==============================================================================

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
