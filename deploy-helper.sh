#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 FlowState Deployment Helper"
echo "=============================="
echo ""

# Check if .env files exist
echo "📋 Checking configuration..."
if [ ! -f "backend/.env" ]; then
    echo "${YELLOW}⚠️  backend/.env not found. Copying from example...${NC}"
    cp backend/.env.example backend/.env
    echo "   Please edit backend/.env with your API keys before deploying!"
fi

if [ ! -f "frontend/.env.production" ]; then
    echo "${YELLOW}⚠️  frontend/.env.production not found. Creating...${NC}"
    echo "REACT_APP_API_URL=https://YOUR_BACKEND_URL/api" > frontend/.env.production
    echo "REACT_APP_WS_URL=wss://YOUR_BACKEND_URL" >> frontend/.env.production
    echo "   Please edit frontend/.env.production with your backend URL!"
fi

echo ""
echo "✅ Configuration files ready"
echo ""
echo "📦 Next Steps:"
echo "1. Update backend/.env with:"
echo "   - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)"
echo "   - JWT_SECRET (use: openssl rand -base64 32)"
echo "   - SUPABASE_URL and SUPABASE_KEY (from supabase.com)"
echo ""
echo "2. Deploy backend to Render:"
echo "   - Go to render.com"
echo "   - Create Web Service"
echo "   - Set root directory: backend"
echo "   - Add environment variables from backend/.env"
echo ""
echo "3. Update frontend/.env.production with your Render backend URL"
echo ""
echo "4. Build and deploy frontend:"
echo "   - Run: cd frontend && npm run build"
echo "   - Deploy the 'build' folder to netlify.com"
echo ""
echo "📖 For detailed instructions, see:"
echo "   - QUICK_DEPLOY.md (quick start)"
echo "   - DEPLOYMENT_GUIDE.md (comprehensive guide)"
echo "   - DEPLOYMENT_CHECKLIST.md (step-by-step)"
