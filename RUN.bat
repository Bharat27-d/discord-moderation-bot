@echo off
title Discord Moderation Bot - Launcher
color 0B

echo ========================================
echo   Discord Moderation Bot Launcher
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/5] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo [!] MongoDB is not running!
    echo [*] Attempting to start MongoDB...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo [X] Failed to start MongoDB. Please start it manually.
        echo     Run: net start MongoDB
        pause
        exit /b 1
    )
    echo [+] MongoDB started successfully!
) else (
    echo [+] MongoDB is running
)
echo.

REM Kill any existing Node processes
echo [2/5] Stopping existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo [+] Cleaned up old processes
echo.

REM Start Backend API
echo [3/5] Starting Backend API...
start "Backend API" cmd /k "cd /d %~dp0backend && color 0A && echo [Backend API] Starting on port 5000... && npm start"
timeout /t 3 >nul
echo [+] Backend API started
echo.

REM Start Discord Bot
echo [4/5] Starting Discord Bot...
start "Discord Bot" cmd /k "cd /d %~dp0bot && color 0E && echo [Discord Bot] Connecting to Discord... && npm start"
timeout /t 3 >nul
echo [+] Discord Bot started
echo.

REM Start Dashboard
echo [5/5] Starting Dashboard...
start "Dashboard" cmd /k "cd /d %~dp0dashboard && color 0B && echo [Dashboard] Starting on port 3000... && npm start"
echo [+] Dashboard started
echo.

echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo   Backend API:  http://localhost:5000
echo   Dashboard:    http://localhost:3000
echo.
echo   3 CMD windows opened:
echo   - Backend API (Green)
echo   - Discord Bot (Yellow)
echo   - Dashboard (Cyan)
echo.
echo   Close individual windows to stop services
echo ========================================
echo.
pause
