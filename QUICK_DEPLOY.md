# ⚡ Quick Deploy to Vercel - Cheat Sheet

## 🎯 Deploy in 10 Minutes

---

## Step 1: Deploy Backend (5 min)

1. **Go to Vercel**: https://vercel.com
2. **Import Project**: Click "Add New" → "Project"
3. **Select Repo**: Choose `ai-learing`
4. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Install Command: `npm install`

5. **Add Environment Variables**:
```env
NODE_ENV=production
GEMINI_API_KEY=AIzaSyCt3TTXGaOot062kzqjA44f92wLNfYORBA
JWT_SECRET=change-this-to-random-32-char-string
JWT_REFRESH_SECRET=change-this-to-another-random-string
FRONTEND_URL=https://your-frontend.vercel.app
DATABASE_URL=sqlite:./database.sqlite
USE_FALLBACK_MODE=false
```

6. **Deploy**: Click "Deploy" button
7. **Copy URL**: Save your backend URL

---

## Step 2: Deploy Frontend (5 min)

1. **Import Again**: Click "Add New" → "Project"
2. **Select Same Repo**: Choose `ai-learing`
3. **Configure**:
   - Root Directory: `frontend`
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Add Environment Variables**:
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_ENV=production
```

5. **Deploy**: Click "Deploy" button
6. **Copy URL**: Save your frontend URL

---

## Step 3: Update Backend CORS

1. Go to backend project → Settings → Environment Variables
2. Edit `FRONTEND_URL` to your actual frontend URL
3. Click "Redeploy" in Deployments tab

---

## ✅ Done!

**Your URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`
- API: `https://your-backend.vercel.app/api`

**Test:**
- Open frontend URL
- Go to AI Learnixo
- Ask a question
- Should get real AI response!

---

## 🔧 If Something Breaks

### CORS Error?
- Update `FRONTEND_URL` in backend env vars
- Redeploy backend

### AI Not Working?
- Check `GEMINI_API_KEY` in backend env vars
- Make sure `USE_FALLBACK_MODE=false`

### Build Failed?
- Check build logs in Vercel
- Verify all dependencies in package.json
- Try deploying again

---

## 📱 Quick Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from terminal
vercel

# Deploy to production
vercel --prod
```

---

**That's it! Your app is live! 🎉**
