# 🚀 Netlify Deployment Guide

## Complete Setup for Production Deployment

### 📋 Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **Backend Hosting** - Choose one:
   - Railway (Recommended - Free tier)
   - Render (Free tier)
   - Heroku
   - Your own VPS

---

## 🎯 Step 1: Deploy Backend First

### Option A: Railway (Recommended)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` folder as root

3. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   
   # Database (Choose one)
   # Option 1: Railway PostgreSQL (Recommended)
   DATABASE_URL=${RAILWAY_PROVIDED_URL}
   
   # Option 2: Supabase
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.railway.app/api/auth/google/callback
   
   # CORS
   FRONTEND_URL=https://your-app.netlify.app
   ```

4. **Deploy**
   - Railway will auto-deploy
   - Copy your backend URL: `https://your-app.railway.app`

### Option B: Render

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables** (same as Railway above)

4. **Deploy** and copy your URL

---

## 🎯 Step 2: Deploy Frontend to Netlify

### Method 1: Netlify UI (Easiest)

1. **Go to [app.netlify.com](https://app.netlify.com)**

2. **New Site from Git**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your repository

3. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add these variables:
   
   ```env
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   REACT_APP_ENV=production
   REACT_APP_ENABLE_AI_FEATURES=true
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at: `https://random-name.netlify.app`

6. **Custom Domain (Optional)**
   - Go to Domain settings
   - Add your custom domain
   - Update DNS records as instructed

### Method 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend
cd frontend

# Build the app
npm run build

# Deploy
netlify deploy --prod

# Follow prompts to link/create site
```

---

## 🔧 Step 3: Update Backend URL in Frontend

### Update netlify.toml

Edit the `netlify.toml` file in your project root:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-actual-backend-url.railway.app/api/:splat"
  status = 200
  force = true
```

Replace `your-actual-backend-url.railway.app` with your real backend URL.

---

## 🔐 Step 4: Configure Backend CORS

Make sure your backend allows requests from Netlify:

**backend/server.js** should have:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

---

## 🗄️ Step 5: Database Setup

### Option A: Railway PostgreSQL (Recommended)

1. In Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway auto-provides `DATABASE_URL`
3. Run migrations:
   ```bash
   # Connect to Railway
   railway link
   
   # Run migrations
   railway run npm run migrate
   ```

### Option B: Supabase (Free Forever)

1. **Create Supabase Project** at [supabase.com](https://supabase.com)

2. **Run SQL Schema**
   - Go to SQL Editor
   - Run the schema from `backend/database-schema.sql`

3. **Get Credentials**
   - Settings → API
   - Copy URL and anon key
   - Add to backend environment variables

---

## ✅ Step 6: Verify Deployment

### Test Checklist

1. **Frontend Loads**
   - Visit your Netlify URL
   - Check console for errors

2. **API Connection**
   - Try to login/signup
   - Check Network tab for API calls

3. **AI Features**
   - Test AI Learnixo chat
   - Test Fix Code button
   - Verify Gemini API is working

4. **Code Execution**
   - Test Playground
   - Run code in different languages
   - Verify online compiler works

5. **Database**
   - Create account
   - Save projects
   - Verify data persists

---

## 🐛 Troubleshooting

### Issue: API calls fail (CORS error)

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Add `FRONTEND_URL` to backend env vars.

### Issue: Build fails on Netlify

**Solution:**
1. Check build logs
2. Verify all dependencies in `package.json`
3. Ensure `CI=true npm run build` works locally
4. Check Node version matches (18.x)

### Issue: Environment variables not working

**Solution:**
1. Netlify env vars must start with `REACT_APP_`
2. Redeploy after adding env vars
3. Clear cache: Site settings → Build & deploy → Clear cache

### Issue: 404 on page refresh

**Solution:**
Already handled in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue: AI features not working

**Solution:**
1. Verify `GEMINI_API_KEY` in backend env vars
2. Check API key is valid at [makersuite.google.com](https://makersuite.google.com)
3. Ensure backend can reach Gemini API
4. Check backend logs for errors

---

## 📊 Monitoring & Analytics

### Add Monitoring

1. **Netlify Analytics**
   - Site settings → Analytics
   - Enable analytics

2. **Backend Monitoring**
   - Railway: Built-in metrics
   - Render: Metrics tab
   - Or use external: Sentry, LogRocket

### Performance Optimization

1. **Enable Netlify CDN** (automatic)

2. **Add Asset Optimization**
   ```toml
   # netlify.toml
   [build.processing]
     skip_processing = false
   [build.processing.css]
     bundle = true
     minify = true
   [build.processing.js]
     bundle = true
     minify = true
   [build.processing.images]
     compress = true
   ```

3. **Enable Gzip** (automatic on Netlify)

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Netlify:**
- Automatically deploys on push to main branch
- Preview deploys for pull requests

**Railway:**
- Automatically deploys backend on push
- Zero-downtime deployments

### Deploy Workflow

```
1. Push code to GitHub
   ↓
2. Netlify builds frontend
   ↓
3. Railway builds backend
   ↓
4. Both deploy automatically
   ↓
5. Site is live!
```

---

## 💰 Cost Estimate

### Free Tier (Recommended for Start)

- **Netlify**: 100GB bandwidth/month (Free)
- **Railway**: $5 credit/month (Free tier)
- **Supabase**: 500MB database (Free forever)
- **Gemini API**: Free tier available

**Total: $0/month** for small projects

### Paid Tier (For Production)

- **Netlify Pro**: $19/month (1TB bandwidth)
- **Railway**: ~$10-20/month (usage-based)
- **Supabase Pro**: $25/month (8GB database)

**Total: ~$54-64/month** for production apps

---

## 🎉 Quick Start Commands

```bash
# 1. Deploy Backend to Railway
railway login
railway init
railway up

# 2. Get backend URL
railway status

# 3. Update netlify.toml with backend URL

# 4. Deploy Frontend to Netlify
cd frontend
netlify deploy --prod

# 5. Done! 🚀
```

---

## 📝 Environment Variables Checklist

### Backend (Railway/Render)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `DATABASE_URL` or `SUPABASE_URL` + `SUPABASE_KEY`
- [ ] `JWT_SECRET`
- [ ] `GEMINI_API_KEY`
- [ ] `FRONTEND_URL`
- [ ] `GOOGLE_CLIENT_ID` (optional)
- [ ] `GOOGLE_CLIENT_SECRET` (optional)

### Frontend (Netlify)
- [ ] `REACT_APP_API_URL`
- [ ] `REACT_APP_ENV=production`
- [ ] `REACT_APP_ENABLE_AI_FEATURES=true`

---

## 🔗 Useful Links

- **Netlify Docs**: https://docs.netlify.com
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev

---

## 🆘 Need Help?

1. Check Netlify build logs
2. Check Railway/Render logs
3. Test API endpoints with Postman
4. Check browser console for errors
5. Verify all environment variables

---

**🎊 Your app is now live and production-ready!**

Visit your Netlify URL and start coding! 🚀
