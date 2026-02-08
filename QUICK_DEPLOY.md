# 🚀 Quick Deploy - FlowState to Netlify

## Option 1: Fastest Way (Netlify Drag & Drop)

### Step 1: Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Deploy manually"
3. Drag the `frontend/build` folder into the upload area
4. Wait 30 seconds - Done! ✅

**⚠️ Problem**: Backend won't work yet (API calls will fail)

---

## Option 2: Complete Deployment (Frontend + Backend)

### Backend First (Render - 10 mins)

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your Git repo OR use manual deploy
   - Settings:
     ```
     Name: flowstate-backend
     Root Directory: backend
     Build Command: npm install
     Start Command: npm start
     ```

3. **Add Environment Variables** (IMPORTANT!)
   ```env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-random-secret-min-32-chars
   GEMINI_API_KEY=your-gemini-api-key
   USE_SUPABASE=true
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   FRONTEND_URL=https://your-app.netlify.app
   ```

4. **Deploy** - Click "Create Web Service"
   - Wait 5-10 minutes
   - Copy your backend URL (e.g., `https://flowstate-abc123.onrender.com`)

### Database Setup (Supabase - 5 mins)

1. **Go to [supabase.com](https://supabase.com)**
2. **Create new project** (free tier)
3. **Get credentials** from Settings → API:
   - Project URL → Copy to `SUPABASE_URL`
   - anon/public key → Copy to `SUPABASE_KEY`
4. **Add these to Render** environment variables
5. **Restart Render service** (backend will auto-create tables)

### Frontend (Netlify - 5 mins)

1. **Update Environment**
   Edit `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_WS_URL=wss://your-backend-url.onrender.com
   ```

2. **Build**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Netlify**
   - Drag `frontend/build` folder to Netlify
   - OR use GitHub integration (recommended for auto-deploys)

4. **Add Environment Variables in Netlify**
   - Go to Site settings → Environment variables
   - Add the same variables from `.env.production`

5. **Copy Netlify URL** and update in Render:
   - Go back to Render
   - Update `FRONTEND_URL` to your Netlify URL
   - Save (auto-redeploys)

### Test Everything

Visit your Netlify URL and:
- ✅ Register a new account
- ✅ Login
- ✅ Test AI features
- ✅ Create a project
- ✅ Check that there are no CORS errors

---

## Option 3: GitHub Auto-Deploy (Best for Teams)

### Setup Once

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/flowstate.git
   git push -u origin main
   ```

2. **Connect Render to GitHub**
   - New Web Service → Connect repository
   - Auto-deploys on every push to main

3. **Connect Netlify to GitHub**
   - New site → Import from Git
   - Auto-deploys on every push to main

### Deploy Updates

Just push to GitHub:
```bash
git add .
git commit -m "Updated feature X"
git push
```

Both frontend and backend will auto-deploy! 🎉

---

## Where to Get API Keys

### Gemini API Key (Free)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create in new project or select existing
4. Copy the key

### Generate JWT Secret
Run this command (or use any random string generator):
```bash
openssl rand -base64 32
```
Or online: [Generate Random String](https://www.random.org/strings/)

---

## Cost Breakdown

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Netlify** | ✅ Free forever | 100GB bandwidth, auto SSL |
| **Render** | ✅ Free forever | 750 hrs/month (one 24/7 service) |
| **Supabase** | ✅ Free forever | 500MB database, unlimited API requests |
| **Gemini API** | ✅ Free tier | 60 requests/minute |

**Total: $0/month** for small projects! 🎉

---

## Troubleshooting

### ❌ "Failed to fetch" errors
→ Check CORS: `FRONTEND_URL` in backend must match Netlify URL exactly

### ❌ "Unauthorized" / JWT errors  
→ Check `JWT_SECRET` is set in Render

### ❌ Database connection errors
→ Verify Supabase credentials in Render

### ❌ Build fails on Netlify
→ Make sure build works locally first: `npm run build`

### ❌ Backend health check fails
→ Visit: `https://your-backend.onrender.com/api/health`  
→ Check Render logs for errors

---

## Need Help?

1. Check the detailed guide: `DEPLOYMENT_GUIDE.md`
2. Follow the checklist: `DEPLOYMENT_CHECKLIST.md`
3. Check Render/Netlify logs for specific errors

---

## Success! 🎉

Your app should now be live at:
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend.onrender.com

Share the Netlify URL with users!
