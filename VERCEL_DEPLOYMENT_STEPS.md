# 🚀 Vercel Deployment Guide - Step by Step

## Complete Guide to Deploy Learnixo on Vercel

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ GitHub account with your code pushed
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Gemini API key ready
- ✅ All code committed and pushed to GitHub

---

## 🎯 Deployment Strategy

We'll deploy in 2 parts:
1. **Backend** - Separate Vercel project (API)
2. **Frontend** - Separate Vercel project (React app)

---

## Part 1: Deploy Backend (API)

### Step 1: Login to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2: Create New Project for Backend
1. Click "Add New..." → "Project"
2. Click "Import" next to your repository: `ai-learing`
3. Vercel will detect your repository

### Step 3: Configure Backend Project
```
Project Name: learnixo-backend
Framework Preset: Other
Root Directory: backend
Build Command: npm run build
Output Directory: (leave empty)
Install Command: npm install
```

### Step 4: Add Environment Variables
Click "Environment Variables" and add these:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
GEMINI_API_KEY=AIzaSyCt3TTXGaOot062kzqjA44f92wLNfYORBA
USE_FALLBACK_MODE=false
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** 
- Use your actual Gemini API key
- We'll update FRONTEND_URL after deploying frontend

### Step 5: Deploy Backend
1. Click "Deploy"
2. Wait 2-3 minutes for deployment
3. Once done, you'll see: ✅ "Your project has been deployed"
4. Copy your backend URL (e.g., `https://learnixo-backend.vercel.app`)

### Step 6: Test Backend
Open in browser:
```
https://your-backend-url.vercel.app/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## Part 2: Deploy Frontend (React App)

### Step 1: Create New Project for Frontend
1. Go back to Vercel dashboard
2. Click "Add New..." → "Project"
3. Click "Import" next to your repository: `ai-learing` (same repo)

### Step 2: Configure Frontend Project
```
Project Name: learnixo-frontend
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### Step 3: Add Environment Variables
Click "Environment Variables" and add:

```env
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_ENV=production
```

**Important:** Replace `your-backend-url` with the actual backend URL from Part 1

### Step 4: Deploy Frontend
1. Click "Deploy"
2. Wait 3-5 minutes for build and deployment
3. Once done, you'll see: ✅ "Your project has been deployed"
4. Copy your frontend URL (e.g., `https://learnixo-frontend.vercel.app`)

---

## Part 3: Update Backend CORS Settings

### Step 1: Update Backend Environment Variables
1. Go to your backend project in Vercel
2. Click "Settings" → "Environment Variables"
3. Find `FRONTEND_URL` variable
4. Click "Edit"
5. Update value to your actual frontend URL:
   ```
   https://learnixo-frontend.vercel.app
   ```
6. Click "Save"

### Step 2: Redeploy Backend
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait for redeployment to complete

---

## Part 4: Update Frontend API URL (if needed)

### Step 1: Update Frontend Environment Variables
1. Go to your frontend project in Vercel
2. Click "Settings" → "Environment Variables"
3. Verify `REACT_APP_API_URL` is correct:
   ```
   https://your-actual-backend-url.vercel.app/api
   ```
4. If wrong, edit and save

### Step 2: Redeploy Frontend (if changed)
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"

---

## ✅ Verification Steps

### Test Backend
1. Open: `https://your-backend-url.vercel.app/health`
2. Should see: `{"status":"ok"}`

### Test Frontend
1. Open: `https://your-frontend-url.vercel.app`
2. Should see: Homepage loads correctly
3. Try login/signup
4. Test AI Learnixo: `https://your-frontend-url.vercel.app/ai-learnixo`

### Test AI Features
1. Go to AI Learnixo page
2. Ask a question: "What is JavaScript?"
3. Should get real AI response (not fallback)
4. Check browser console for any errors

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Check backend `FRONTEND_URL` environment variable
2. Make sure it matches your actual frontend URL
3. Redeploy backend after changing

### Issue: AI not responding

**Solution:**
1. Check backend environment variables
2. Verify `GEMINI_API_KEY` is correct
3. Check backend logs in Vercel dashboard
4. Test API directly: `https://your-backend-url.vercel.app/api/health`

### Issue: 404 errors on routes

**Solution:**
1. Frontend: Check `vercel.json` has correct rewrites
2. Backend: Check `vercel.json` routes configuration
3. Redeploy both projects

### Issue: Build fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `package.json` has all dependencies
3. Check Node.js version compatibility
4. Try deploying again

---

## 📊 Post-Deployment Checklist

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Login/Signup works
- [ ] AI Learnixo responds with real AI
- [ ] Playground code execution works
- [ ] Code Editor loads
- [ ] Dashboard displays correctly
- [ ] No CORS errors in console
- [ ] All pages accessible
- [ ] Mobile responsive

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Frontend
1. Go to frontend project in Vercel
2. Click "Settings" → "Domains"
3. Click "Add"
4. Enter your domain: `learnixo.com`
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-30 minutes)

### Add Custom Domain to Backend
1. Go to backend project in Vercel
2. Click "Settings" → "Domains"
3. Click "Add"
4. Enter your domain: `api.learnixo.com`
5. Follow DNS configuration instructions
6. Update frontend `REACT_APP_API_URL` to use new domain

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

1. Make changes locally
2. Commit: `git commit -m "your message"`
3. Push: `git push origin main`
4. Vercel automatically builds and deploys
5. Check deployment status in Vercel dashboard

---

## 📝 Important URLs to Save

After deployment, save these URLs:

```
Frontend: https://learnixo-frontend.vercel.app
Backend: https://learnixo-backend.vercel.app
Backend API: https://learnixo-backend.vercel.app/api
Health Check: https://learnixo-backend.vercel.app/health
```

---

## 🎉 Success!

Your Learnixo platform is now live on Vercel!

### What's Working:
✅ AI Learnixo with real Gemini AI
✅ Code Playground with online compiler
✅ Code Editor with live preview
✅ Learning management system
✅ User authentication
✅ Dashboard and analytics
✅ All AI features (Explain, Debug, Optimize, etc.)

### Share Your App:
- Frontend: `https://your-frontend-url.vercel.app`
- Users can signup and start learning!

---

## 🔐 Security Notes

### After Deployment:
1. ✅ Change JWT_SECRET to a strong random string
2. ✅ Keep GEMINI_API_KEY private
3. ✅ Enable Vercel's security features
4. ✅ Set up monitoring and alerts
5. ✅ Regular security updates

### Environment Variables Security:
- Never commit `.env` files to GitHub
- Use Vercel's environment variables feature
- Rotate API keys regularly
- Use different keys for development and production

---

## 📈 Monitoring

### Vercel Dashboard:
- View deployment logs
- Monitor function execution
- Check error rates
- View analytics
- Set up alerts

### Check Logs:
1. Go to project in Vercel
2. Click "Deployments"
3. Click on a deployment
4. Click "View Function Logs"
5. See real-time logs

---

## 🆘 Need Help?

### Resources:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: Create issue in your repository
- Community: Vercel Discord server

### Common Commands:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: February 14, 2026  
**Status**: Production Ready ✅
