@echo off
title TrySpace Platform - 1-Click Launch
echo ===================================================
echo           TRYSPACE - Launching Platform
echo ===================================================
echo.

echo [1/3] Checking dependencies...

cd /d "%~dp0backend"
if not exist "data\products.json" (
    echo Initializing backend data...
)

echo [2/3] Starting FastAPI Backend on http://localhost:8000 ...
start "TrySpace Backend (Port 8000)" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 2 >nul

cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing frontend packages (first-time only)...
    call npm install
)

echo [3/3] Starting Vite Frontend on http://localhost:5173 ...
start "TrySpace Frontend (Port 5173)" cmd /k "npm run dev -- --host"

timeout /t 3 >nul

echo.
echo ===================================================
echo    TrySpace is now running!
echo    Local:   http://localhost:5173
echo ===================================================
echo.
pause
