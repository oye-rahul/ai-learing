@echo off
echo 🚀 FlowState Deployment Helper
echo ==============================
echo.

REM Check if .env files exist
echo 📋 Checking configuration...
if not exist "backend\.env" (
    echo ⚠️  backend\.env not found. Copying from example...
    copy "backend\.env.example" "backend\.env"
    echo    Please edit backend\.env with your API keys before deploying!
)

if not exist "frontend\.env.production" (
    echo ⚠️  frontend\.env.production not found. Creating...
    echo REACT_APP_API_URL=https://YOUR_BACKEND_URL/api > "frontend\.env.production"
    echo REACT_APP_WS_URL=wss://YOUR_BACKEND_URL >> "frontend\.env.production"
    echo    Please edit frontend\.env.production with your backend URL!
)

echo.
echo ✅ Configuration files ready
echo.
echo 📦 Next Steps:
echo 1. Update backend\.env with:
echo    - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)
echo    - JWT_SECRET (use a random 32+ character string)
echo    - SUPABASE_URL and SUPABASE_KEY (from supabase.com)
echo.
echo 2. Deploy backend to Render:
echo    - Go to render.com
echo    - Create Web Service
echo    - Set root directory: backend
echo    - Add environment variables from backend\.env
echo.
echo 3. Update frontend\.env.production with your Render backend URL
echo.
echo 4. Build and deploy frontend:
echo    - Run: cd frontend ^&^& npm run build
echo    - Deploy the 'build' folder to netlify.com
echo.
echo 📖 For detailed instructions, see:
echo    - QUICK_DEPLOY.md (quick start)
echo    - DEPLOYMENT_GUIDE.md (comprehensive guide)
echo    - DEPLOYMENT_CHECKLIST.md (step-by-step)
echo.
pause
