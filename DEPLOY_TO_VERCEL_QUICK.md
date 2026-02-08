# 🚀 Quick Deploy to Vercel

## Your GitHub Repo
**https://github.com/oye-rahul/ai-learing**

---

## ⚡ Super Quick Steps (5 Minutes)

### 1️⃣ Push Code to GitHub

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2️⃣ Deploy Backend (Railway)

1. Go to **[railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub**
3. Select: **oye-rahul/ai-learing**
4. Root Directory: **`backend`**
5. Add variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=ai-learning-secret-2024
   GEMINI_API_KEY=AIzaSyDQLirYTllwUuTc2CpddevvPhkuWpDDi3I
   FRONTEND_URL=https://ai-learing.vercel.app
   ```
6. **Deploy** → Copy URL

### 3️⃣ Deploy Frontend (Vercel)

1. Go to **[vercel.com](https://vercel.com)**
2. **Add New** → **Project**
3. Import: **oye-rahul/ai-learing**
4. Settings:
   - Root Directory: **`frontend`**
   - Framework: **Create React App**
5. Add variables:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_ENV=production
   REACT_APP_ENABLE_AI_FEATURES=true
   ```
6. **Deploy** → Copy URL

### 4️⃣ Update Backend CORS

In Railway, update:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

---

## ✅ Done!

Visit your Vercel URL and test:
- ✅ Login/Signup
- ✅ AI Chat
- ✅ Code Execution
- ✅ All Features

---

## 🐛 Troubleshooting

**Login fails?**
- Check `FRONTEND_URL` in Railway matches Vercel URL
- Check `REACT_APP_API_URL` in Vercel points to Railway

**Build fails?**
- Check Vercel build logs
- Verify `frontend` folder has `package.json`

**AI not working?**
- Check `GEMINI_API_KEY` in Railway
- Check backend logs

---

## 📖 Full Guide

See **VERCEL_DEPLOYMENT_GUIDE.md** for detailed instructions.

---

## 🎯 Quick Test

```bash
# Test backend
curl https://your-backend.railway.app/api/health

# Should return: {"status":"OK",...}
```

---

**Your app is live! 🎉**
