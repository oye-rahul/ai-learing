#!/bin/bash
# Vercel Build Script

echo "🚀 Starting build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

# Build frontend
echo "🔨 Building frontend..."
CI=false GENERATE_SOURCEMAP=false npm run build

echo "✅ Build complete!"
