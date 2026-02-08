#!/bin/bash

# FlowState Deployment Script
# This script helps you deploy to Netlify and Railway

echo "🚀 FlowState Deployment Helper"
echo "================================"
echo ""

# Check if required tools are installed
command -v netlify >/dev/null 2>&1 || { echo "❌ Netlify CLI not installed. Run: npm install -g netlify-cli"; exit 1; }
command -v railway >/dev/null 2>&1 || { echo "⚠️  Railway CLI not installed. Install from: https://railway.app/cli"; }

echo "✅ Required tools found"
echo ""

# Ask what to deploy
echo "What would you like to deploy?"
echo "1) Frontend only (Netlify)"
echo "2) Backend only (Railway)"
echo "3) Both (Full deployment)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    echo ""
    echo "📦 Deploying Frontend to Netlify..."
    cd frontend
    npm run build
    netlify deploy --prod
    echo "✅ Frontend deployed!"
    ;;
  2)
    echo ""
    echo "📦 Deploying Backend to Railway..."
    cd backend
    railway up
    echo "✅ Backend deployed!"
    ;;
  3)
    echo ""
    echo "📦 Deploying Backend to Railway..."
    cd backend
    railway up
    cd ..
    
    echo ""
    echo "📦 Deploying Frontend to Netlify..."
    cd frontend
    npm run build
    netlify deploy --prod
    cd ..
    
    echo ""
    echo "✅ Full deployment complete!"
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check your Netlify dashboard for frontend URL"
echo "2. Check your Railway dashboard for backend URL"
echo "3. Update netlify.toml with your backend URL"
echo "4. Verify all environment variables are set"
echo ""
echo "🔗 Useful links:"
echo "- Netlify: https://app.netlify.com"
echo "- Railway: https://railway.app/dashboard"
echo ""
