@echo off
echo 🚀 Setting up FlowState - AI-Powered Developer Learning Platform
echo ================================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker found

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

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d postgres redis

REM Wait for PostgreSQL to be ready
echo ⏳ Waiting for PostgreSQL to be ready...
timeout /t 15 /nobreak >nul

REM Run database migrations
echo 🗄️ Running database migrations...
cd backend
call npm run migrate
if %errorlevel% neq 0 (
    echo ❌ Database migration failed
    pause
    exit /b 1
)
cd ..

echo ✅ Database setup completed

echo.
echo 🎉 FlowState setup completed successfully!
echo.
echo 📱 To start the application, run:
echo    npm run dev (in the root directory)
echo.
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔧 Backend API will be available at: http://localhost:5000
echo 🗄️ Database is running on: localhost:5432
echo.
echo 🤖 Your Gemini AI is configured and ready!
echo    API Key: AIzaSyBEP_XDLeKG-Awp8vAK7jlc8ISgxr8QyV8
echo.
echo Press any key to exit...
pause >nul