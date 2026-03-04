# AWS Environment Variables

## For AWS Amplify (Frontend)

Add these in AWS Amplify Console → Environment variables:

```
NODE_ENV=production
GEMINI_API_KEY=AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=24h
CI=false
GENERATE_SOURCEMAP=false
DATABASE_URL=sqlite:./database.sqlite
USE_FALLBACK_MODE=false
```

---

## For AWS Elastic Beanstalk (Backend)

Add these using EB CLI or EB Console:

### Using EB CLI:

```bash
eb setenv \
  NODE_ENV=production \
  GEMINI_API_KEY=AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY \
  JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345 \
  JWT_EXPIRES_IN=24h \
  DATABASE_URL=sqlite:./database.sqlite \
  FRONTEND_URL=https://your-amplify-url.amplifyapp.com \
  USE_FALLBACK_MODE=false
```

### Using EB Console:

Go to: Configuration → Software → Environment properties

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `GEMINI_API_KEY` | `AIzaSyBIFCzrtBPYXJFkWi-0GML7ifhjyzKGSXY` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production-12345` |
| `JWT_EXPIRES_IN` | `24h` |
| `DATABASE_URL` | `sqlite:./database.sqlite` |
| `FRONTEND_URL` | `https://your-amplify-url.amplifyapp.com` |
| `USE_FALLBACK_MODE` | `false` |

---

## Generate Secure JWT_SECRET

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

---

## After Backend Deployment

Once your backend is deployed, add this to Amplify:

```
REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com
```

Then redeploy your frontend in Amplify Console.

---

## Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Use different secrets for production
- ⚠️ Rotate API keys regularly
- ⚠️ Use AWS Secrets Manager for sensitive data in production
