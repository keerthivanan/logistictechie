@echo off
echo ========================================================
echo 🔱 PHOENIX LOGISTICS OS: SOVEREIGN ENVIRONMENT
echo ========================================================
echo.
echo [INFO] Activating 'logistics_env'...
call conda activate logistics_env

if %errorlevel% neq 0 (
    echo [ERROR] Could not activate conda environment. 
    echo Make sure you have run 'conda init cmd.exe' first.
    echo Fallback: You can manually type 'conda activate logistics_env'
    pause
    exit /b
)

echo.
echo [SUCCESS] You are now KING. 👑
echo [TIP] Run 'python start_services.py' to launch the OS.
echo.
cmd /k
