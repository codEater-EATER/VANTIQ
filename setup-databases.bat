@echo off
REM VANTIQ Database Setup Script
REM Run this as Administrator

echo.
echo ========================================
echo VANTIQ Database Setup (PostgreSQL + Redis)
echo ========================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/2] Installing PostgreSQL 15...
choco install postgresql15 -y

echo.
echo [2/2] Installing Redis...
choco install redis-64 -y

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo PostgreSQL: http://localhost:5432
echo Redis: http://localhost:6379
echo.
echo Next steps:
echo 1. Create database: createdb -U postgres vantiq
echo 2. Update .env with credentials
echo 3. Run: npm install
echo 4. Run: npx prisma migrate dev
echo.
pause
