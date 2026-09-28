@echo off
echo ============================================
echo AI Traffic Analysis System - Full Startup
echo ============================================
echo.
echo This will start both Backend and Frontend servers.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Node.js is not installed!
    echo Frontend will not start. Only backend will run.
    echo.
    echo To install Node.js: https://nodejs.org/
    echo.
    timeout /t 3 >nul
)

echo Starting Backend Server...
start "AI Traffic Backend" cmd /k "cd backend && start.bat"
timeout /t 2 >nul

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Frontend Server...
    start "AI Traffic Frontend" cmd /k "cd frontend && start.bat"
) else (
    echo Skipping frontend (Node.js not installed)
)

echo.
echo ============================================
echo Servers are starting in separate windows:
echo ============================================
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000 (if Node.js installed)
echo.
echo Close the terminal windows to stop the servers.
echo ============================================
