# AWS Deployment Guide - FlowState AI Learning Platform

Complete guide to deploy your AI-powered learning platform to AWS for the AWS AI for Bharat Hackathon.

## 🎯 Deployment Strategy

We'll use **AWS Amplify** - the easiest and most powerful way to deploy full-stack applications with automatic CI/CD, SSL, and global CDN.

---

## 📋 Prerequisites

- AWS Account (Free tier works!)
- Git repository pushed to GitHub/GitLab/Bitbucket
- Your API keys ready:
  - `GEMINI_API_KEY`: AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY
  - `JWT_SECRET`: (generate a secure random string)

---

## 🚀 Quick Deploy Steps

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Ready for AWS deployment"
git push origin main
```

### Step 2: Deploy to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize AWS Amplify to access your repository
5. Select your repository and branch (usually `main` or `master`)
6. Click **"Next"**

### Step 3: Configure Build Settings

Amplify will auto-detect your app. Update the build settings with this configuration:

**App name**: `flowstate-ai-learning`

**Build and test settings**: Click "Edit" and paste this:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install --legacy-peer-deps
    build:
      commands:
        - CI=false npm run build
  artifacts:
    baseDirectory: frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### Step 4: Add Environment Variables

Click **"Advanced settings"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | `AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production-12345` |
| `JWT_EXPIRES_IN` | `24h` |
| `CI` | `false` |
| `GENERATE_SOURCEMAP` | `false` |
| `DATABASE_URL` | `sqlite:./database.sqlite` |
| `USE_FALLBACK_MODE` | `false` |

**Important**: Generate a strong JWT_SECRET for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Deploy!

1. Click **"Next"**
2. Review your settings
3. Click **"Save and deploy"**

AWS Amplify will now:
- Clone your repository
- Install dependencies
- Build your frontend
- Deploy to global CDN
- Provide you with a live URL (e.g., `https://main.d1234abcd.amplifyapp.com`)

⏱️ First deployment takes 5-10 minutes.

---

## 🔧 Backend API Deployment

Since your app needs a backend API, you have two options:

### Option A: AWS Elastic Beanstalk (Recommended)

1. Go to [AWS Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk/)
2. Click **"Create Application"**
3. **Application name**: `flowstate-backend`
4. **Platform**: Node.js
5. **Platform branch**: Node.js 18 running on 64bit Amazon Linux 2023
6. **Application code**: Upload your code (zip the `backend` folder)

**Or use EB CLI**:

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB in backend folder
cd backend
eb init -p node.js-18 flowstate-backend --region us-east-1

# Create environment and deploy
eb create flowstate-production --single

# Set environment variables
eb setenv NODE_ENV=production \
  GEMINI_API_KEY=AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY \
  JWT_SECRET=your-super-secret-jwt-key \
  JWT_EXPIRES_IN=24h \
  DATABASE_URL=sqlite:./database.sqlite \
  FRONTEND_URL=https://your-amplify-url.amplifyapp.com

# Deploy
eb deploy
```

### Option B: AWS Lambda + API Gateway (Serverless)

Create `backend/lambda.js`:

```javascript
const serverless = require('serverless-http');
const app = require('./server');

module.exports.handler = serverless(app);
```

Then deploy using AWS SAM or Serverless Framework.

---

## 🔗 Connect Frontend to Backend

After deploying backend, update your frontend environment:

1. Go to AWS Amplify Console
2. Select your app
3. Go to **"Environment variables"**
4. Add:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://flowstate-backend.us-east-1.elasticbeanstalk.com`)

5. Redeploy frontend:
   - Go to your app in Amplify
   - Click **"Redeploy this version"**

---

## 📁 Alternative: Single Build Configuration

If you want to serve both frontend and backend from one deployment, create this file:

**amplify.yml** (in root directory):

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm install --legacy-peer-deps
        build:
          commands:
            - CI=false npm run build
      artifacts:
        baseDirectory: frontend/build
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
    appRoot: frontend
  - backend:
      phases:
        preBuild:
          commands:
            - cd backend
            - npm install
        build:
          commands:
            - echo "Backend build complete"
      artifacts:
        baseDirectory: backend
        files:
          - '**/*'
      cache:
        paths:
          - backend/node_modules/**/*
    appRoot: backend
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend is accessible at Amplify URL
- [ ] Backend API is running (test `/health` endpoint)
- [ ] Environment variables are set correctly
- [ ] CORS is configured to allow your Amplify domain
- [ ] Database is initialized (SQLite file created)
- [ ] AI features work (test chat with Gemini)
- [ ] Authentication works (login/signup)
- [ ] SSL certificate is active (HTTPS)

---

## 🔍 Testing Your Deployment

1. **Frontend**: Visit your Amplify URL
2. **Backend Health**: Visit `https://your-backend-url/health`
3. **API Test**: Try login/signup
4. **AI Test**: Use the AI chat feature

---

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Amplify Console
- Ensure `package.json` has correct scripts
- Verify Node.js version compatibility

### API Not Working

- Check CORS settings in `backend/server.js`
- Verify environment variables are set
- Check backend logs in Elastic Beanstalk or CloudWatch

### Database Issues

- SQLite works for demo, but consider RDS for production
- Ensure write permissions for database file

---

## 🎓 For AWS AI for Bharat Hackathon

Your deployment showcases:
- ✅ AI-powered learning assistant (Gemini API)
- ✅ Real-time code execution
- ✅ Interactive tutorials
- ✅ Progress tracking
- ✅ Scalable cloud architecture
- ✅ Production-ready deployment

---

## 📊 Monitoring & Logs

- **Amplify Logs**: AWS Amplify Console → Your App → Build logs
- **Backend Logs**: CloudWatch Logs (if using Elastic Beanstalk)
- **Metrics**: CloudWatch Metrics for performance monitoring

---

## 💰 Cost Estimate

- **AWS Amplify**: Free tier covers 1000 build minutes/month
- **Elastic Beanstalk**: ~$10-20/month (t2.micro instance)
- **Data Transfer**: Minimal for hackathon demo
- **Total**: ~$0-20/month (mostly free tier eligible)

---

## 🚀 Your Deployment URLs

After deployment, you'll have:

- **Frontend**: `https://main.d1234abcd.amplifyapp.com`
- **Backend**: `https://flowstate-backend.us-east-1.elasticbeanstalk.com`

Update these in your hackathon submission!

---

## 📝 Quick Commands Reference

```bash
# Push to Git
git add .
git commit -m "AWS deployment ready"
git push origin main

# Deploy backend with EB CLI
cd backend
eb init -p node.js-18 flowstate-backend
eb create flowstate-production
eb setenv NODE_ENV=production GEMINI_API_KEY=your-key
eb deploy

# Check backend status
eb status
eb logs

# Open backend in browser
eb open
```

---

## 🎉 Success!

Your AI Learning Platform is now live on AWS! Share your deployment URL in the hackathon submission.
