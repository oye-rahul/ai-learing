@echo off
echo 🚀 Starting FlowState Application (SQLite - No Docker)
echo ====================================================

REM Start backend in a new window
echo 🔧 Starting backend server...
start "FlowState Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo 📱 Starting frontend development server...
start "FlowState Frontend" cmd /k "cd frontend && npm start"

echo.
echo 🎉 FlowState is starting up!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 🗄️ Database: SQLite (backend/database.sqlite)
echo.
echo 🤖 AI Chatbot is ready with Gemini API!
echo    API Key: AIzaSyBEP_XDLeKG-Awp8vAK7jlc8ISgxr8QyV8
echo.
echo Close the terminal windows to stop the application.
echo.
pause