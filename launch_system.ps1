# 🦅 PHOENIX LAUNCH SCRIPT
# "The Best of All Time"

Write-Host "🚀 INITIALIZING PHOENIX LOGISTICS OS..." -ForegroundColor Cyan

# 1. Start Backend (New Window)
Write-Host "1. Igniting Backend Engines (FastAPI)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload}"

# 2. Wait for Backend
Start-Sleep -Seconds 5

# 3. Start Frontend (New Window)
Write-Host "2. Launching Frontend Interface (Next.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd frontend; npm run dev}"

# 4. Open Browser
Start-Sleep -Seconds 5
Write-Host "3. Opening Mission Control..." -ForegroundColor Green
Start-Process "http://localhost:3000/dashboard"

Write-Host "✅ SYSTEM LAUNCH COMPLETED." -ForegroundColor Cyan
