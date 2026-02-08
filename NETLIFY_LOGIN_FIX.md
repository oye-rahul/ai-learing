# 🔧 Fix Login Issue on Netlify

## Problem
Login fails after deploying to Netlify because the frontend can't reach the backend API.

## Root Cause
The `netlify.toml` file has a placeholder backend URL that needs to be updated with your actual backend URL.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Deploy Your Backend

Choose one of these options:

#### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Important**: Set root directory to `backend`
5. Add these environment variables in Railway:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
FRONTEND_URL=https://your-netlify-site.netlify.app
```

6. Deploy and copy your Railway URL (e.g., `https://your-app.railway.app`)

#### Option B: Render (Free Alternative)

1. Go to [render.com](https://render.com) and sign up
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add same environment variables as above
8. Deploy and copy your Render URL

---

### Step 2: Update netlify.toml

Edit `netlify.toml` and replace the placeholder with your actual backend URL:

**Before:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
  force = true
```

**After:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-actual-backend.railway.app/api/:splat"
  status = 200
  force = true
```

Replace `your-actual-backend.railway.app` with your real backend URL.

---

### Step 3: Update Backend CORS

Make sure your backend allows requests from Netlify.

In `backend/server.js`, the CORS is already configured to use `FRONTEND_URL` environment variable:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

**In Railway/Render**, add this environment variable:
```
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Replace with your actual Netlify URL.

---

### Step 4: Redeploy to Netlify

After updating `netlify.toml`:

```bash
git add netlify.toml
git commit -m "Update backend URL for production"
git push
```

Netlify will automatically redeploy with the correct backend URL.

---

## 🧪 Test Your Fix

1. **Visit your Netlify site**
2. **Open browser console** (F12)
3. **Try to login**
4. **Check Network tab** - API calls should go to your backend URL
5. **Verify login works** ✅

---

## 🚨 Alternative: Use Environment Variable (Better for Security)

Instead of hardcoding the backend URL in `netlify.toml`, you can use an environment variable:

### Step 1: Update Frontend Code

Edit `frontend/src/services/api.ts`:

```javascript
// Use environment variable for production
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
```

### Step 2: Add Environment Variable in Netlify

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

### Step 3: Simplify netlify.toml

Remove the API redirect (since we're using direct URL):

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "build"

# SPA fallback only
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Redeploy

Netlify will rebuild with the new environment variable.

---

## 🔍 Troubleshooting

### Issue: Still getting CORS errors

**Solution:**
1. Check backend logs in Railway/Render
2. Verify `FRONTEND_URL` matches your Netlify URL exactly
3. Make sure backend is running (check Railway/Render dashboard)

### Issue: API calls return 404

**Solution:**
1. Verify backend URL is correct
2. Test backend directly: `https://your-backend.railway.app/api/health`
3. Should return: `{"status":"OK",...}`

### Issue: Login works but other features fail

**Solution:**
1. Check if JWT_SECRET is set in backend
2. Verify GEMINI_API_KEY is set for AI features
3. Check browser console for specific errors

---

## 📋 Complete Environment Variables Checklist

### Backend (Railway/Render)
- ✅ `NODE_ENV=production`
- ✅ `PORT=5000`
- ✅ `JWT_SECRET=your-secret-key`
- ✅ `GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I`
- ✅ `FRONTEND_URL=https://your-netlify-site.netlify.app`

### Frontend (Netlify)
- ✅ `REACT_APP_API_URL=https://your-backend.railway.app/api` (if using env var method)
- ✅ `REACT_APP_ENV=production`

---

## 🎯 Quick Commands

```bash
# Test backend is running
curl https://your-backend.railway.app/api/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":123}

# Test login endpoint
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## ✅ Success Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL copied
- [ ] `netlify.toml` updated with backend URL
- [ ] `FRONTEND_URL` set in backend env vars
- [ ] Code pushed to GitHub
- [ ] Netlify redeployed automatically
- [ ] Login tested and working ✅

---

**Your login should now work! 🎉**

If you still have issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Backend logs in Railway/Render dashboard
