# 🔗 Update Backend URL

After deploying your backend, you need to update the frontend to point to it.

## Step 1: Get Your Backend URL

### Railway
```bash
railway status
# Copy the URL shown (e.g., https://your-app.railway.app)
```

### Render
- Go to your service dashboard
- Copy the URL (e.g., https://your-app.onrender.com)

## Step 2: Update netlify.toml

Open `netlify.toml` and update line 11:

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

## Step 3: Update Backend CORS

In your backend environment variables (Railway/Render dashboard), add:

```env
FRONTEND_URL=https://your-app.netlify.app
```

## Step 4: Redeploy

```bash
# Commit changes
git add netlify.toml
git commit -m "Update backend URL"
git push

# Netlify will auto-deploy
# Or manually: netlify deploy --prod
```

## Step 5: Verify

Test the connection:

```bash
# Open browser console on your Netlify site
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)

# Should return: { status: 'ok', ... }
```

## ✅ Done!

Your frontend now communicates with your backend!

---

## Troubleshooting

### Still getting CORS errors?

1. Check `FRONTEND_URL` in backend env vars
2. Verify it matches your Netlify URL exactly
3. Redeploy backend after changing env vars
4. Clear browser cache

### API calls return 404?

1. Verify backend URL in `netlify.toml` is correct
2. Check backend is running: visit `https://your-backend.railway.app/api/health`
3. Ensure `/api` is included in the redirect
4. Redeploy frontend

### Backend not responding?

1. Check Railway/Render logs
2. Verify all environment variables are set
3. Check database connection
4. Restart backend service

---

## Quick Reference

**Frontend URL**: `https://your-app.netlify.app`
**Backend URL**: `https://your-app.railway.app`
**API Endpoint**: `https://your-app.netlify.app/api/*` → proxied to backend

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
