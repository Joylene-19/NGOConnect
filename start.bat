@echo off
REM NGOConnect Project Startup Script for Windows
REM This script will start both the backend and frontend servers

echo 🚀 Starting NGOConnect Project...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "server\certificates" mkdir "server\certificates"
if not exist "server\public" mkdir "server\public"
echo ✅ Directories created

echo.
echo 🔧 Starting backend server...
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend will be available at: http://localhost:3001
echo.
echo 📋 Available test accounts:
echo    👥 Volunteer: volunteer@test.com / password123
echo    🏢 NGO: ngo@test.com / password123
echo    👑 Admin: admin@test.com / password123
echo.
echo 🛑 To stop the servers, close this window or press Ctrl+C
echo.

REM Start the development server (this will start both backend and frontend)
call npm run dev

echo.
echo ✅ Servers stopped. Goodbye!
pause
