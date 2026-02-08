@echo off
echo ========================================
echo   Fix Netlify Login Issue
echo ========================================
echo.

echo This script will help you fix the login issue on Netlify.
echo.
echo STEP 1: Deploy Backend First
echo ----------------------------
echo You need to deploy your backend to Railway or Render.
echo.
echo Option A - Railway (Recommended):
echo   1. Go to https://railway.app
echo   2. Sign up and create new project
echo   3. Deploy from GitHub repo
echo   4. Set root directory to: backend
echo   5. Add environment variables (see below)
echo.
echo Option B - Render:
echo   1. Go to https://render.com
echo   2. Create Web Service
echo   3. Root Directory: backend
echo   4. Build: npm install
echo   5. Start: npm start
echo.
echo Required Environment Variables:
echo   NODE_ENV=production
echo   PORT=5000
echo   JWT_SECRET=your-super-secret-jwt-key
echo   GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
echo   FRONTEND_URL=https://your-netlify-site.netlify.app
echo.
pause
echo.

echo STEP 2: Update netlify.toml
echo ----------------------------
set /p BACKEND_URL="Enter your backend URL (e.g., https://your-app.railway.app): "

if "%BACKEND_URL%"=="" (
    echo Error: Backend URL cannot be empty!
    pause
    exit /b 1
)

echo.
echo Updating netlify.toml with backend URL: %BACKEND_URL%
echo.

powershell -Command "(Get-Content netlify.toml) -replace 'https://your-backend-url.com', '%BACKEND_URL%' | Set-Content netlify.toml"

echo ✅ netlify.toml updated successfully!
echo.

echo STEP 3: Commit and Push
echo ------------------------
echo.
git add netlify.toml
git commit -m "Fix: Update backend URL for Netlify deployment"
echo.
echo Ready to push? This will trigger Netlify redeploy.
pause
git push
echo.

echo ========================================
echo   ✅ Done!
echo ========================================
echo.
echo Your changes have been pushed to GitHub.
echo Netlify will automatically redeploy with the correct backend URL.
echo.
echo Next Steps:
echo 1. Wait for Netlify build to complete (2-3 minutes)
echo 2. Visit your Netlify site
echo 3. Try logging in
echo.
echo If login still fails, check:
echo - Backend is running (visit: %BACKEND_URL%/api/health)
echo - FRONTEND_URL is set in backend environment variables
echo - Browser console for errors
echo.
pause
