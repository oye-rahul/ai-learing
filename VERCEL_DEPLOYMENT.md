# 🚀 Vercel Deployment Guide - Learnixo

Complete guide to deploy your AI-powered learning platform on Vercel with automatic backend startup.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Your code pushed to GitHub
3. **Gemini API Key**: Get from https://aistudio.google.com/app/apikey

---

## 🎯 Deployment Strategy

We'll deploy in two parts:
1. **Backend** - Serverless API on Vercel
2. **Frontend** - Static React app on Vercel

---

## 📦 Part 1: Deploy Backend

### Step 1: Import Backend Project

1. Go to https://vercel.com/new
2. Click **"Import Project"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 2: Configure Backend

**Root Directory**: Set to `backend`

**Framework Preset**: Other

**Build Command**: 
```bash
npm install
```

**Output Directory**: Leave empty (serverless function)

**Install Command**:
```bash
npm install
```

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add these:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
GEMINI_API_KEY=AIzaSyCt3TTXGaOot062kzqjA44f92wLNfYORBA
USE_FALLBACK_MODE=false
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: 
- Replace `GEMINI_API_KEY` with your actual key
- Update `FRONTEND_URL` after deploying frontend
- Update `BACKEND_URL` with your backend URL (you'll get this after deployment)

### Step 4: Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-backend.vercel.app`)

---

## 🎨 Part 2: Deploy Frontend

### Step 1: Import Frontend Project

1. Go to https://vercel.com/new again
2. Click **"Import Project"**
3. Select the same GitHub repository
4. Click **"Import"**

### Step 2: Configure Frontend

**Root Directory**: Set to `frontend`

**Framework Preset**: Create React App

**Build Command**: 
```bash
npm run build
```

**Output Directory**: `build`

**Install Command**:
```bash
npm install
```

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```env
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_ENV=production
```

**Important**: Replace `your-backend.vercel.app` with your actual backend URL from Part 1

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your frontend URL (e.g., `https://your-app.vercel.app`)

---

## 🔄 Part 3: Update Backend with Frontend URL

### Step 1: Update Backend Environment

1. Go to your backend project in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Update `FRONTEND_URL` with your frontend URL
4. Click **"Save"**

### Step 2: Redeploy Backend

1. Go to **"Deployments"** tab
2. Click the three dots on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment

---

## ✅ Verification

### Test Backend

Visit: `https://your-backend.vercel.app/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T...",
  "uptime": 123.456,
  "environment": "production"
}
```

### Test Frontend

Visit: `https://your-app.vercel.app`

You should see:
- ✅ Homepage loads
- ✅ Can navigate to different pages
- ✅ AI Learnixo works
- ✅ Playground works
- ✅ Code editor works

### Test AI Features

1. Go to AI Learnixo: `https://your-app.vercel.app/ai-learnixo`
2. Ask a question: "What is a function in JavaScript?"
3. Should get real AI response (not fallback)

---

## 🔧 Configuration Files

### Root `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/health",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/build/$1"
    }
  ]
}
```

### Backend `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Frontend `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.vercel.app/api/:path*"
    }
  ]
}
```

---

## 🎯 Quick Deploy (Alternative Method)

### Using Vercel CLI

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy Backend**:
```bash
cd backend
vercel --prod
```

4. **Deploy Frontend**:
```bash
cd frontend
vercel --prod
```

---

## 🔐 Security Checklist

- ✅ Change all default secrets in environment variables
- ✅ Use strong JWT secrets (min 32 characters)
- ✅ Keep Gemini API key secure
- ✅ Enable CORS only for your frontend domain
- ✅ Set up rate limiting
- ✅ Use HTTPS (automatic on Vercel)

---

## 📊 Environment Variables Summary

### Backend Environment Variables
| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `5000` |
| `DATABASE_URL` | Yes | `sqlite:./database.sqlite` |
| `JWT_SECRET` | Yes | `your-secret-key` |
| `JWT_EXPIRES_IN` | Yes | `24h` |
| `JWT_REFRESH_SECRET` | Yes | `your-refresh-secret` |
| `GEMINI_API_KEY` | Yes | `AIzaSy...` |
| `USE_FALLBACK_MODE` | Yes | `false` |
| `FRONTEND_URL` | Yes | `https://your-app.vercel.app` |
| `BACKEND_URL` | Yes | `https://your-backend.vercel.app` |

### Frontend Environment Variables
| Variable | Required | Example |
|----------|----------|---------|
| `REACT_APP_API_URL` | Yes | `https://your-backend.vercel.app/api` |
| `REACT_APP_ENV` | Yes | `production` |

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: 500 Internal Server Error
- **Solution**: Check Vercel logs in dashboard
- **Solution**: Verify all environment variables are set
- **Solution**: Check database connection

**Problem**: CORS errors
- **Solution**: Update `FRONTEND_URL` in backend environment
- **Solution**: Redeploy backend after updating

**Problem**: AI features not working
- **Solution**: Verify `GEMINI_API_KEY` is correct
- **Solution**: Check `USE_FALLBACK_MODE=false`
- **Solution**: Test API key with test script

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: Update `REACT_APP_API_URL` with correct backend URL
- **Solution**: Redeploy frontend

**Problem**: 404 on page refresh
- **Solution**: Vercel handles this automatically with SPA routing
- **Solution**: Check `vercel.json` rewrites configuration

**Problem**: Environment variables not working
- **Solution**: Ensure variables start with `REACT_APP_`
- **Solution**: Redeploy after adding variables

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. **Push to main branch**:
```bash
git add .
git commit -m "Update"
git push origin main
```

2. **Vercel automatically**:
   - Detects the push
   - Builds your project
   - Deploys to production
   - Updates your live site

### Preview Deployments

Every pull request gets a preview URL:
- Test changes before merging
- Share with team for review
- Automatic cleanup after merge

---

## 📈 Monitoring

### Vercel Dashboard

Monitor your deployments:
- **Analytics**: Page views, performance
- **Logs**: Real-time function logs
- **Deployments**: History and status
- **Domains**: Custom domain management

### Check Logs

1. Go to Vercel dashboard
2. Select your project
3. Click **"Functions"** tab
4. View real-time logs

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain

1. Go to project settings
2. Click **"Domains"**
3. Add your domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

---

## 💡 Tips for Production

### Performance
- ✅ Enable caching for static assets
- ✅ Use CDN (automatic on Vercel)
- ✅ Optimize images
- ✅ Enable compression

### Reliability
- ✅ Set up error monitoring
- ✅ Configure health checks
- ✅ Use environment-specific configs
- ✅ Regular backups of database

### Cost Optimization
- ✅ Use Vercel free tier for hobby projects
- ✅ Monitor function execution time
- ✅ Optimize API calls
- ✅ Cache frequently accessed data

---

## 🎉 Success!

Your AI-powered learning platform is now live on Vercel!

### Your URLs
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.vercel.app
- **API**: https://your-backend.vercel.app/api
- **Health Check**: https://your-backend.vercel.app/health

### Next Steps
1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Share with users!

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions

---

**Last Updated**: February 14, 2026  
**Status**: Production Ready  
**Deployment**: Optimized for Vercel
