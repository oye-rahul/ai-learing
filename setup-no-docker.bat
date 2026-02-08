@echo off
echo 🚀 Setting up FlowState WITHOUT Docker (SQLite)
echo ===============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Dependencies installed successfully

REM Run database migrations (SQLite will be created automatically)
echo 🗄️ Setting up SQLite database...
cd backend
call npm run migrate
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)
cd ..

echo ✅ SQLite database setup completed

echo.
echo 🎉 FlowState setup completed successfully!
echo.
echo 📱 To start the application, run:
echo    start-no-docker.bat
echo.
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔧 Backend API will be available at: http://localhost:5000
echo 🗄️ Database: SQLite (backend/database.sqlite)
echo.
echo 🤖 Your Gemini AI is configured and ready!
echo    API Key: AIzaSyBEP_XDLeKG-Awp8vAK7jlc8ISgxr8QyV8
echo.
echo Press any key to exit...
pause >nul