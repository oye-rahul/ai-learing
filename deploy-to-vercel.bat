@echo off
echo ========================================
echo   Deploy to Vercel - Quick Setup
echo ========================================
echo.
echo GitHub Repo: https://github.com/oye-rahul/ai-learing
echo.

echo STEP 1: Push Code to GitHub
echo ----------------------------
echo.
echo Checking git status...
git status
echo.

set /p CONFIRM="Do you want to commit and push all changes? (y/n): "
if /i "%CONFIRM%" NEQ "y" (
    echo Skipping git push. Make sure your code is on GitHub!
    goto STEP2
)

echo.
echo Adding all files...
git add .

echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Deploy to Vercel with configuration

echo Committing changes...
git commit -m "%COMMIT_MSG%"

echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo Failed to push. Trying 'master' branch...
    git push origin master
)

echo.
echo ✅ Code pushed to GitHub successfully!
echo.

:STEP2
echo ========================================
echo STEP 2: Deploy Backend to Railway
echo ========================================
echo.
echo 1. Go to: https://railway.app
echo 2. Sign in with GitHub
echo 3. Click "New Project" -^> "Deploy from GitHub repo"
echo 4. Select: oye-rahul/ai-learing
echo 5. Set Root Directory: backend
echo 6. Add Environment Variables:
echo.
echo    NODE_ENV=production
echo    PORT=5000
echo    JWT_SECRET=ai-learning-super-secret-key-2024
echo    GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
echo    FRONTEND_URL=https://your-app.vercel.app
echo.
echo 7. Click Deploy
echo 8. Copy your Railway URL
echo.
pause
echo.

set /p BACKEND_URL="Enter your Railway backend URL (e.g., https://ai-learing-production.up.railway.app): "

if "%BACKEND_URL%"=="" (
    echo.
    echo ⚠️  Warning: No backend URL provided!
    echo You'll need to update vercel.json manually later.
    echo.
    set BACKEND_URL=https://your-backend-url.railway.app
) else (
    echo.
    echo Updating vercel.json with backend URL...
    powershell -Command "(Get-Content vercel.json) -replace 'https://your-backend-url.railway.app', '%BACKEND_URL%' | Set-Content vercel.json"
    echo ✅ vercel.json updated!
    echo.
    
    echo Committing vercel.json update...
    git add vercel.json
    git commit -m "Update backend URL in vercel.json"
    git push
    echo.
)

echo ========================================
echo STEP 3: Deploy Frontend to Vercel
echo ========================================
echo.
echo 1. Go to: https://vercel.com
echo 2. Sign in with GitHub
echo 3. Click "Add New..." -^> "Project"
echo 4. Import: oye-rahul/ai-learing
echo 5. Configure:
echo    - Framework: Create React App
echo    - Root Directory: frontend
echo    - Build Command: npm run build
echo    - Output Directory: build
echo.
echo 6. Add Environment Variables:
echo    REACT_APP_API_URL=%BACKEND_URL%/api
echo    REACT_APP_ENV=production
echo    REACT_APP_ENABLE_AI_FEATURES=true
echo.
echo 7. Click "Deploy"
echo 8. Wait 2-3 minutes for build
echo 9. Copy your Vercel URL
echo.
pause
echo.

set /p VERCEL_URL="Enter your Vercel URL (e.g., https://ai-learing.vercel.app): "

if "%VERCEL_URL%"=="" (
    echo.
    echo ⚠️  No Vercel URL provided. Skipping CORS update.
    goto DONE
)

echo.
echo ========================================
echo STEP 4: Update Backend CORS
echo ========================================
echo.
echo Go back to Railway dashboard and update:
echo.
echo Environment Variable:
echo    FRONTEND_URL=%VERCEL_URL%
echo.
echo Railway will automatically redeploy.
echo.
pause

:DONE
echo.
echo ========================================
echo   ✅ Deployment Complete!
echo ========================================
echo.
echo Your app should now be live at:
echo Frontend: %VERCEL_URL%
echo Backend:  %BACKEND_URL%
echo.
echo Test your deployment:
echo 1. Visit: %VERCEL_URL%
echo 2. Try to login/signup
echo 3. Test AI features
echo 4. Test code execution
echo.
echo If something doesn't work:
echo - Check Vercel build logs
echo - Check Railway logs
echo - Check browser console (F12)
echo - Verify all environment variables
echo.
echo 📖 Full guide: VERCEL_DEPLOYMENT_GUIDE.md
echo.
pause
