# ✅ Vercel Deployment Checklist

## Your GitHub Repository
**https://github.com/oye-rahul/ai-learing** ✅ PUSHED!

---

## 🎯 Step-by-Step Deployment

### ✅ Step 1: Code on GitHub (DONE!)
- [x] Code pushed to GitHub
- [x] All files committed
- [x] Deployment configs added

---

### 📦 Step 2: Deploy Backend to Railway

1. **Go to Railway**
   - Visit: https://railway.app
   - Click "Login" → Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: **oye-rahul/ai-learing**

3. **Configure Backend**
   - Click "Add variables" or "Settings"
   - Set **Root Directory**: `backend`
   
4. **Add Environment Variables**
   Click "Variables" tab and add:
   
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=ai-learning-super-secret-key-2024-change-this
   GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
   FRONTEND_URL=https://ai-learing.vercel.app
   ```
   
   ⚠️ **Important**: Change `FRONTEND_URL` after you get your Vercel URL!

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your Railway URL (e.g., `https://ai-learing-production.up.railway.app`)

6. **Test Backend**
   - Visit: `https://your-railway-url.railway.app/api/health`
   - Should see: `{"status":"OK",...}`

**Railway URL**: _____________________________________ (write it here)

---

### 🚀 Step 3: Deploy Frontend to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Login" → Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Find and select: **oye-rahul/ai-learing**
   - Click "Import"

3. **Configure Project**
   
   **Framework Preset**: Create React App
   
   **Root Directory**: Click "Edit" → Enter `frontend`
   
   **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:
   
   ```
   REACT_APP_API_URL=https://your-railway-url.railway.app/api
   REACT_APP_ENV=production
   REACT_APP_ENABLE_AI_FEATURES=true
   ```
   
   ⚠️ Replace `your-railway-url.railway.app` with your actual Railway URL!

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Copy your Vercel URL (e.g., `https://ai-learing.vercel.app`)

**Vercel URL**: _____________________________________ (write it here)

---

### 🔄 Step 4: Update Backend CORS

1. **Go back to Railway Dashboard**
   - Open your project
   - Click "Variables"

2. **Update FRONTEND_URL**
   - Find `FRONTEND_URL` variable
   - Change to your actual Vercel URL
   - Example: `https://ai-learing.vercel.app`
   - ⚠️ **No trailing slash!**

3. **Save**
   - Railway will automatically redeploy (30 seconds)

---

### 🧪 Step 5: Test Your Deployment

Visit your Vercel URL and test:

- [ ] Homepage loads correctly
- [ ] Can signup/create account
- [ ] Can login successfully
- [ ] Dashboard shows correctly
- [ ] AI Learnixo chat works
- [ ] Code execution works in Playground
- [ ] Fix Code button works
- [ ] Projects can be created
- [ ] All pages load without errors

**Open Browser Console (F12)** and check for errors!

---

## 🐛 Troubleshooting

### Issue: Login Fails

**Check:**
1. `FRONTEND_URL` in Railway matches Vercel URL exactly
2. `REACT_APP_API_URL` in Vercel points to Railway URL
3. No trailing slashes in URLs

**Test Backend:**
```bash
curl https://your-railway-url.railway.app/api/health
```

### Issue: AI Features Don't Work

**Check:**
1. `GEMINI_API_KEY` is set in Railway
2. API key is valid at https://makersuite.google.com
3. Check Railway logs for errors

### Issue: Build Fails on Vercel

**Check:**
1. Root Directory is set to `frontend`
2. Build command is `npm run build`
3. Output directory is `build`
4. Check build logs for specific errors

### Issue: CORS Errors

**Check:**
1. `FRONTEND_URL` in Railway backend
2. Should match Vercel URL exactly
3. No trailing slash
4. Railway redeployed after change

---

## 📊 Monitor Your Deployment

### Vercel Dashboard
- View deployments: https://vercel.com/dashboard
- Check build logs
- View analytics
- Monitor performance

### Railway Dashboard
- View logs: https://railway.app/dashboard
- Monitor resource usage
- Check deployment status
- View environment variables

---

## 🎉 Success Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated in backend
- [ ] Login works
- [ ] AI features work
- [ ] Code execution works
- [ ] All pages load correctly

---

## 📝 Your Deployment URLs

**Frontend (Vercel)**: _____________________________________

**Backend (Railway)**: _____________________________________

**GitHub Repo**: https://github.com/oye-rahul/ai-learing

---

## 🔄 Future Updates

To update your deployed app:

```bash
# Make changes to code
git add .
git commit -m "Your update message"
git push origin main
```

Both Vercel and Railway will automatically redeploy! 🚀

---

## 🆘 Need Help?

1. Check Railway logs for backend errors
2. Check Vercel build logs for frontend errors
3. Check browser console (F12) for client errors
4. Test API endpoint: `/api/health`
5. Verify all environment variables

---

## 📖 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Gemini API**: https://ai.google.dev
- **Full Guide**: See VERCEL_DEPLOYMENT_GUIDE.md

---

**🎊 Congratulations! Your app is now live on the internet!**

Share your Vercel URL with friends and start learning! 🚀
