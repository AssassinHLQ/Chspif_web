@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required. Install them from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting Chspif at http://127.0.0.1:4173/
start "Chspif server" /d "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1 --port 4173"
timeout /t 3 /nobreak >nul
start "Chspif" http://127.0.0.1:4173/
