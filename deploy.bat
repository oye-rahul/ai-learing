@echo off
echo ========================================
echo FlowState Deployment Helper (Windows)
echo ========================================
echo.

REM Check if Netlify CLI is installed
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Netlify CLI not installed
    echo Install with: npm install -g netlify-cli
    pause
    exit /b 1
)

echo [OK] Netlify CLI found
echo.

echo What would you like to deploy?
echo 1) Frontend only (Netlify)
echo 2) Backend only (Railway)
echo 3) Both (Full deployment)
echo.
set /p choice="Enter choice [1-3]: "

if "%choice%"=="1" goto frontend
if "%choice%"=="2" goto backend
if "%choice%"=="3" goto both
echo [ERROR] Invalid choice
pause
exit /b 1

:frontend
echo.
echo [DEPLOY] Building and deploying frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    cd ..
    pause
    exit /b 1
)
call netlify deploy --prod
cd ..
echo [SUCCESS] Frontend deployed!
goto end

:backend
echo.
echo [DEPLOY] Deploying backend to Railway...
echo Please use Railway CLI or dashboard to deploy backend
echo Visit: https://railway.app/dashboard
pause
goto end

:both
echo.
echo [DEPLOY] Full deployment starting...
echo.
echo Step 1: Deploy backend first
echo Please deploy backend using Railway dashboard
echo Visit: https://railway.app/dashboard
pause
echo.
echo Step 2: Building and deploying frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    cd ..
    pause
    exit /b 1
)
call netlify deploy --prod
cd ..
echo [SUCCESS] Full deployment complete!
goto end

:end
echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check Netlify dashboard for frontend URL
echo 2. Check Railway dashboard for backend URL
echo 3. Update netlify.toml with backend URL
echo 4. Verify environment variables
echo.
echo Useful links:
echo - Netlify: https://app.netlify.com
echo - Railway: https://railway.app/dashboard
echo.
pause
