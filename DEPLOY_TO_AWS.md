# 🚀 Quick AWS Deployment - 5 Minutes

## Step 1: Push to Git (1 min)

```bash
git add .
git commit -m "Ready for AWS deployment"
git push origin main
```

## Step 2: Deploy Frontend to AWS Amplify (2 min)

1. Go to: https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**
3. Connect your GitHub repository
4. Select branch: `main`
5. Click **"Next"**

## Step 3: Add Environment Variables (1 min)

Click **"Advanced settings"** and add:

```
NODE_ENV = production
GEMINI_API_KEY = AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production-12345
CI = false
GENERATE_SOURCEMAP = false
```

## Step 4: Deploy! (1 min)

Click **"Save and deploy"**

Wait 5-10 minutes for build to complete.

You'll get a URL like: `https://main.d1234abcd.amplifyapp.com`

---

## ✅ That's It!

Your AI Learning Platform is now live on AWS!

For backend deployment and advanced configuration, see: `AWS_DEPLOYMENT_GUIDE.md`

---

## 🎓 For Hackathon Submission

Your live demo URL: `https://main.d1234abcd.amplifyapp.com`

Features to showcase:
- ✅ AI-powered learning assistant (Google Gemini)
- ✅ Interactive code editor with real-time execution
- ✅ Unlocked tutorials: HTML, CSS, JavaScript
- ✅ Progress tracking and badges
- ✅ Persistent login (stays logged in)
- ✅ Modern UI with dark mode
- ✅ Deployed on AWS cloud infrastructure

---

## 🐛 If Build Fails

Check the build logs in Amplify Console. Common fixes:

1. Ensure `amplify.yml` exists in root
2. Check environment variables are set
3. Verify Node.js version compatibility

---

## 📞 Need Help?

See detailed guide: `AWS_DEPLOYMENT_GUIDE.md`
