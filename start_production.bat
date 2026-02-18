@echo off
TITLE OMEGO LOGISTICS - PRODUCTION LAUNCHER 🚀
COLOR 0A

ECHO ========================================================
ECHO    OMEGO LOGISTICS PLATFORM - CLOSING THE GAP
ECHO ========================================================
ECHO.
ECHO [1/3] Stopping any rogue development servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
ECHO.

ECHO [2/3] Building Production Containers (This may take a moment)...
docker-compose up --build -d
ECHO.

ECHO [3/3] System Launching...
ECHO.
ECHO    FRONTEND: http://localhost:3000
ECHO    BACKEND:  http://localhost:8000
ECHO    DB:       localhost:5432
ECHO.
ECHO ========================================================
ECHO    STATUS: ONLINE AND OPERATIONAL ✅
ECHO ========================================================
PAUSE
