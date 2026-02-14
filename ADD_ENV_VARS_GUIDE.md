# 🎯 How to Add Environment Variables in Vercel - Visual Guide

## Simple 5-Step Process

---

## 📍 Step 1: Go to Your Project

1. Open https://vercel.com/dashboard
2. You'll see your projects list
3. Click on your **backend project** (e.g., `learnixo-backend`)

---

## 📍 Step 2: Open Settings

1. At the top of the page, you'll see tabs: Overview, Deployments, Analytics, **Settings**
2. Click **Settings**

---

## 📍 Step 3: Find Environment Variables

1. On the left sidebar, you'll see:
   - General
   - Domains
   - Git
   - **Environment Variables** ← Click this
   - Functions
   - etc.

2. Click **Environment Variables**

---

## 📍 Step 4: Add Each Variable

You'll see a section that says "Environment Variables" with an "Add New" button.

### For Each Variable:

1. Click **"Add New"** button
2. You'll see 3 fields:

```
┌─────────────────────────────────────┐
│ Key                                 │
│ [Enter variable name here]          │
├─────────────────────────────────────┤
│ Value                               │
│ [Enter variable value here]         │
├─────────────────────────────────────┤
│ Environment                         │
│ ☑ Production                        │
│ ☐ Preview                           │
│ ☐ Development                       │
└─────────────────────────────────────┘
     [Cancel]  [Save]
```

3. **Key**: Enter the variable name (e.g., `NODE_ENV`)
4. **Value**: Enter the variable value (e.g., `production`)
5. **Environment**: Check ☑ **Production** (required)
6. Click **Save**

---

## 📍 Step 5: Repeat for All Variables

### Backend Variables (Add these 12):

| # | Key | Value |
|---|-----|-------|
| 1 | `NODE_ENV` | `production` |
| 2 | `PORT` | `5000` |
| 3 | `DATABASE_URL` | `sqlite:./database.sqlite` |
| 4 | `JWT_SECRET` | `your-random-32-char-string` |
| 5 | `JWT_EXPIRES_IN` | `24h` |
| 6 | `JWT_REFRESH_SECRET` | `another-random-32-char-string` |
| 7 | `GEMINI_API_KEY` | `AIzaSyCt3TTXGaOot062kzqjA44f92wLNfYORBA` |
| 8 | `USE_FALLBACK_MODE` | `false` |
| 9 | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| 10 | `BACKEND_URL` | `https://your-backend.vercel.app` |
| 11 | `RATE_LIMIT_WINDOW_MS` | `900000` |
| 12 | `RATE_LIMIT_MAX_REQUESTS` | `100` |

### Frontend Variables (Add these 2):

| # | Key | Value |
|---|-----|-------|
| 1 | `REACT_APP_API_URL` | `https://your-backend.vercel.app/api` |
| 2 | `REACT_APP_ENV` | `production` |

---

## 🎬 Example: Adding NODE_ENV

### Step-by-Step:

1. Click **"Add New"**
2. In **Key** field, type: `NODE_ENV`
3. In **Value** field, type: `production`
4. Check ☑ **Production**
5. Click **Save**
6. You'll see it appear in the list: `NODE_ENV = production`

### Repeat for Next Variable:

1. Click **"Add New"** again
2. In **Key** field, type: `PORT`
3. In **Value** field, type: `5000`
4. Check ☑ **Production**
5. Click **Save**

**Continue** until all 12 backend variables are added!

---

## 🎬 Example: Adding GEMINI_API_KEY

This is the most important one for AI features!

1. Click **"Add New"**
2. In **Key** field, type exactly: `GEMINI_API_KEY`
3. In **Value** field, paste: `AIzaSyCt3TTXGaOot062kzqjA44f92wLNfYORBA`
4. Check ☑ **Production**
5. Click **Save**

✅ Now your AI features will work!

---

## 🔄 After Adding All Variables

### What You Should See:

In the Environment Variables page, you should see a list like:

```
Environment Variables (12)

NODE_ENV = production
PORT = 5000
DATABASE_URL = sqlite:./database.sqlite
JWT_SECRET = ••••••••••••••••••••••••••••••••
JWT_EXPIRES_IN = 24h
JWT_REFRESH_SECRET = ••••••••••••••••••••••••••••••••
GEMINI_API_KEY = ••••••••••••••••••••••••••••••••
USE_FALLBACK_MODE = false
FRONTEND_URL = https://your-frontend.vercel.app
BACKEND_URL = https://your-backend.vercel.app
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
```

(Values with sensitive data will show as dots ••••)

---

## ⚠️ Important: Update URLs After Deployment

### First Time Setup:

1. **Add all variables** with placeholder URLs:
   - `FRONTEND_URL = https://placeholder.vercel.app`
   - `BACKEND_URL = https://placeholder.vercel.app`

2. **Deploy backend** → Get actual backend URL

3. **Deploy frontend** → Get actual frontend URL

4. **Update variables**:
   - Go back to backend Settings → Environment Variables
   - Find `FRONTEND_URL`
   - Click **Edit** (pencil icon)
   - Update to actual frontend URL
   - Click **Save**

5. **Redeploy backend**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 🎯 Quick Checklist

### Before Deploying:

- [ ] Added all 12 backend environment variables
- [ ] Added all 2 frontend environment variables
- [ ] Used correct GEMINI_API_KEY
- [ ] Set USE_FALLBACK_MODE to false
- [ ] Changed JWT secrets to random strings

### After First Deployment:

- [ ] Updated FRONTEND_URL in backend
- [ ] Updated BACKEND_URL in backend
- [ ] Updated REACT_APP_API_URL in frontend
- [ ] Redeployed backend
- [ ] Redeployed frontend (if needed)

---

## 🐛 Common Mistakes

### ❌ Wrong:
```
Key: GEMINI_API_KEY
Value: your-api-key-here
```
(Don't use placeholder text!)

### ✅ Correct:
```
Key: GEMINI_API_KEY
Value: AIzaSyCt3TTXGaOot062kzqjA44f92wLNfYORBA
```
(Use actual API key!)

---

### ❌ Wrong:
```
Key: REACT_APP_API_URL
Value: https://your-backend.vercel.app
```
(Missing `/api` at the end!)

### ✅ Correct:
```
Key: REACT_APP_API_URL
Value: https://your-backend.vercel.app/api
```
(Must end with `/api`)

---

### ❌ Wrong:
```
Key: FRONTEND_URL
Value: https://your-frontend.vercel.app/
```
(Has trailing slash!)

### ✅ Correct:
```
Key: FRONTEND_URL
Value: https://your-frontend.vercel.app
```
(No trailing slash)

---

## 🎉 You're Done!

After adding all environment variables:

1. ✅ All variables added to backend project
2. ✅ All variables added to frontend project
3. ✅ Ready to deploy!

**Next Step**: Click "Deploy" button in Vercel!

---

## 💡 Pro Tips

### Tip 1: Copy-Paste
- Open `VERCEL_ENV_VARIABLES.md`
- Copy each value
- Paste directly into Vercel

### Tip 2: Double-Check
- After adding all variables, scroll through the list
- Make sure no typos in variable names
- Verify values are correct

### Tip 3: Save URLs
- After deployment, save your URLs in a text file:
```
Backend: https://learnixo-backend.vercel.app
Frontend: https://learnixo-frontend.vercel.app
API: https://learnixo-backend.vercel.app/api
```

### Tip 4: Test Immediately
- After deployment, test the health endpoint:
- Open: `https://your-backend.vercel.app/health`
- Should see: `{"status":"ok"}`

---

**Need the actual values?** → See `VERCEL_ENV_VARIABLES.md`  
**Need deployment steps?** → See `QUICK_DEPLOY.md`

---

**Last Updated**: February 14, 2026  
**Status**: Ready to Use ✅
