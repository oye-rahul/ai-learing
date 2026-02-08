# 🚀 Vercel Deployment Guide

## Complete Guide to Deploy on Vercel

Your GitHub repo: **https://github.com/oye-rahul/ai-learing**

---

## 📋 Prerequisites

1. ✅ GitHub account with your code pushed
2. ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
3. ✅ Backend deployed (Railway/Render)

---

## 🎯 Step 1: Deploy Backend First (Required!)

### Option A: Railway (Recommended - Free)

1. **Go to [railway.app](https://railway.app)** and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select: **oye-rahul/ai-learing**
4. Click **"Add variables"** and configure:
   - **Root Directory**: `backend`
5. Add **Environment Variables**:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=ai-learning-super-secret-key-2024
GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
FRONTEND_URL=https://your-app.vercel.app
```

6. Click **"Deploy"**
7. **Copy your Railway URL**: `https://ai-learing-production.up.railway.app`

### Option B: Render (Alternative)

1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub: **oye-rahul/ai-learing**
4. Configure:
   - **Name**: ai-learning-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add same environment variables as Railway
6. Click **"Create Web Service"**
7. Copy your Render URL

---

## 🎯 Step 2: Deploy Frontend to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. Click **"Add New..."** → **"Project"**

3. **Import Git Repository**
   - Find: **oye-rahul/ai-learing**
   - Click **"Import"**

4. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

5. **Add Environment Variables**
   
   Click **"Environment Variables"** and add:
   
   ```env
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_ENV=production
   REACT_APP_ENABLE_AI_FEATURES=true
   ```
   
   Replace `your-backend.railway.app` with your actual Railway/Render URL.

6. Click **"Deploy"**

7. Wait 2-3 minutes for build to complete

8. **Copy your Vercel URL**: `https://ai-learing.vercel.app`

---

## 🎯 Step 3: Update Backend CORS

Now that you have your Vercel URL, update backend to allow requests from it.

### In Railway/Render Dashboard:

Add/Update environment variable:
```env
FRONTEND_URL=https://ai-learing.vercel.app
```

Replace with your actual Vercel URL (no trailing slash).

Railway/Render will automatically redeploy with new settings.

---

## 🎯 Step 4: Push Code to GitHub

Make sure all your latest code is on GitHub:

```bash
# Check current status
git status

# Add all files
git add .

# Commit changes
git commit -m "Add Vercel deployment configuration"

# Push to GitHub
git push origin main
```

If you haven't connected to GitHub yet:

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/oye-rahul/ai-learing.git

# Add all files
git add .

# Commit
git commit -m "Initial commit with Vercel config"

# Push
git push -u origin main
```

---

## ✅ Step 5: Verify Deployment

### Test Checklist:

1. **Frontend Loads**
   - Visit: `https://ai-learing.vercel.app`
   - Should see homepage ✅

2. **Backend Connection**
   - Test: `https://your-backend.railway.app/api/health`
   - Should return: `{"status":"OK",...}` ✅

3. **Login Works**
   - Try to signup/login
   - Check browser console (F12) for errors
   - Should successfully authenticate ✅

4. **AI Features Work**
   - Go to AI Learnixo
   - Send a message
   - Should get AI response ✅

5. **Code Execution Works**
   - Go to Playground
   - Write and run code
   - Should execute successfully ✅

---

## 🔧 Update vercel.json (If Using API Proxy)

If you want to use Vercel's proxy instead of direct API calls:

Edit `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-actual-backend.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

Replace `your-actual-backend.railway.app` with your real backend URL.

Then push to GitHub:
```bash
git add vercel.json
git commit -m "Update backend URL in vercel.json"
git push
```

Vercel will automatically redeploy.

---

## 🐛 Troubleshooting

### Issue: Build Fails on Vercel

**Error**: "Command failed: npm run build"

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify build works locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. If it works locally, check Node version:
   - Vercel uses Node 18 by default
   - Match it locally: `node -v`

### Issue: API Calls Fail (CORS Error)

**Error**: "Access to fetch blocked by CORS policy"

**Solution**:
1. Check `FRONTEND_URL` in backend matches Vercel URL exactly
2. No trailing slash: ✅ `https://ai-learing.vercel.app`
3. With trailing slash: ❌ `https://ai-learing.vercel.app/`
4. Redeploy backend after changing

### Issue: Environment Variables Not Working

**Solution**:
1. Vercel env vars must start with `REACT_APP_`
2. After adding env vars, redeploy:
   - Go to Vercel dashboard
   - Deployments tab
   - Click "..." → "Redeploy"
3. Clear browser cache and test

### Issue: 404 on Page Refresh

**Solution**:
Already handled in `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

If still happening, make sure this file exists in `frontend/` folder.

### Issue: Login Works But AI Features Don't

**Solution**:
1. Check `GEMINI_API_KEY` is set in backend
2. Test API key at [makersuite.google.com](https://makersuite.google.com)
3. Check backend logs in Railway/Render
4. Verify API key has no extra spaces

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Vercel** automatically deploys when you push to GitHub:

```
1. Make changes to code
   ↓
2. git add . && git commit -m "Update"
   ↓
3. git push
   ↓
4. Vercel auto-builds and deploys
   ↓
5. Live in 2-3 minutes! 🚀
```

### Preview Deployments

Vercel creates preview deployments for:
- Every push to any branch
- Every pull request

Access them in Vercel dashboard → Deployments

---

## 📊 Monitoring

### View Logs

**Vercel Logs**:
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View "Build Logs" and "Function Logs"

**Backend Logs**:
- Railway: Dashboard → Your project → Logs
- Render: Dashboard → Your service → Logs

### Analytics

Enable Vercel Analytics:
1. Go to project settings
2. Click "Analytics"
3. Enable analytics
4. View real-time traffic data

---

## 💰 Cost

### Free Tier (Perfect for Your Project)

- **Vercel**: 100GB bandwidth/month (Free)
- **Railway**: $5 credit/month (Free)
- **Gemini API**: Free tier (60 requests/minute)

**Total: $0/month** ✅

### If You Need More

- **Vercel Pro**: $20/month (1TB bandwidth)
- **Railway**: ~$10-20/month (usage-based)

---

## 🎯 Quick Commands Summary

```bash
# 1. Push code to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main

# 2. Deploy backend to Railway
# (Use Railway dashboard - no CLI needed)

# 3. Deploy frontend to Vercel
# (Use Vercel dashboard - imports from GitHub)

# 4. Test deployment
curl https://your-backend.railway.app/api/health
curl https://ai-learing.vercel.app

# 5. Done! 🎉
```

---

## 📝 Environment Variables Reference

### Backend (Railway/Render)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=ai-learning-super-secret-key-2024
GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
FRONTEND_URL=https://ai-learing.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_ENV=production
REACT_APP_ENABLE_AI_FEATURES=true
```

---

## 🔗 Useful Links

- **Your GitHub**: https://github.com/oye-rahul/ai-learing
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app

---

## 🆘 Need Help?

1. **Check Vercel build logs** for frontend errors
2. **Check Railway/Render logs** for backend errors
3. **Test API endpoints** with curl or Postman
4. **Check browser console** (F12) for frontend errors
5. **Verify all environment variables** are set correctly

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub: https://github.com/oye-rahul/ai-learing
- [ ] Backend deployed to Railway/Render
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added in Vercel
- [ ] `FRONTEND_URL` updated in backend
- [ ] Login tested and working
- [ ] AI features tested and working
- [ ] Code execution tested and working

---

**🎊 Your app is now live on Vercel!**

Visit: `https://ai-learing.vercel.app` 🚀

**Share your live app with the world!** 🌍
