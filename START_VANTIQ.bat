@echo off
REM VANTIQ Quick Start Script
REM This starts all services needed for VANTIQ to run

echo.
echo ======================================
echo     VANTIQ Full Stack Startup
echo ======================================
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ollama is not installed!
    echo Please run: irm https://ollama.com/install.ps1 | iex
    pause
    exit /b 1
)

echo [1/4] Starting Ollama...
start "Ollama Server" cmd /k "ollama serve"
timeout /t 3 /nobreak

echo [2/4] Installing Qwen model (if needed)...
REM This only pulls if not already installed
ollama pull qwen2:4b >nul 2>nul

echo [3/4] Starting Backend API...
start "VANTIQ Backend" cmd /k "cd apps\backend && npm run dev"
timeout /t 5 /nobreak

echo [4/4] Starting Frontend...
start "VANTIQ Frontend" cmd /k "cd apps\web && npm run dev"
timeout /t 5 /nobreak

echo.
echo ======================================
echo     VANTIQ is Starting!
echo ======================================
echo.
echo Ollama:   http://localhost:11434
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak

start http://localhost:3000

echo.
echo All services started! Check the windows above for any errors.
echo.
pause
