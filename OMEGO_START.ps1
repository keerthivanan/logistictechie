# OMEGO LOGISTICS OS: G.O.A.T. STARTUP NEXUS
# Version 2.1 (Self-Contained AI Mode)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INITIATING OMEGO LOGISTICS OS (Vision 2.1)  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. DATABASE HANDSHAKE
Write-Host "[1/4] Synchronizing Database..." -ForegroundColor Yellow
cd backend
.\venv\Scripts\activate
alembic upgrade head

# 2. BACKEND LAUNCH
Write-Host "[2/4] Initializing Sovereign Engine..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `".\venv\Scripts\activate; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`""

# 3. FRONTEND LAUNCH
Write-Host "[3/4] Triggering Creative Cortex UI..." -ForegroundColor Yellow
cd ../frontend
Start-Process powershell -ArgumentList "-NoExit -Command `"npm run dev`""

# 4. FINAL TELEMETRY
Write-Host "[4/4] Systems Operational. Accessing local gateway..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
