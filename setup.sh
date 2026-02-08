#!/bin/bash

echo "🚀 Setting up FlowState - AI-Powered Developer Learning Platform"
echo "================================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed successfully"

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
cd backend
npm run migrate
cd ..

echo "✅ Database setup completed"

# Start the application
echo "🚀 Starting FlowState application..."
echo ""
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "Starting frontend development server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 FlowState is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️ Database: localhost:5432"
echo ""
echo "💡 To stop the application, press Ctrl+C"
echo ""
echo "🤖 Your Gemini AI is ready to help with coding!"
echo "   API Key: AIzaSyBEP_XDLeKG-Awp8vAK7jlc8ISgxr8QyV8"
echo ""

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID