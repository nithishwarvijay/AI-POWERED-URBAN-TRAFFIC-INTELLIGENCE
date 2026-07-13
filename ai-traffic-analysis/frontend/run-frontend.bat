@echo off
set PATH=%PATH%;C:\Program Files\nodejs
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    exit /b 1
)
echo.
echo Starting development server...
call npm run dev
