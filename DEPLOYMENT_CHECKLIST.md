# ✅ Deployment Checklist

## Pre-Deployment

### Code Preparation
- [ ] All ESLint errors fixed
- [ ] All TypeScript errors resolved
- [ ] Build succeeds locally: `cd frontend && CI=true npm run build`
- [ ] Backend starts without errors: `cd backend && npm start`
- [ ] All tests pass (if you have tests)

### Environment Variables Prepared
- [ ] Backend `.env` file ready with all required variables
- [ ] Frontend environment variables documented
- [ ] API keys obtained (Gemini, Google OAuth, etc.)
- [ ] Database credentials ready

---

## Backend Deployment (Railway)

### Setup
- [ ] Railway account created
- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] Logged in: `railway login`

### Deploy
- [ ] Create new project: `railway init`
- [ ] Link to backend folder
- [ ] Add environment variables in Railway dashboard:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `DATABASE_URL` (if using Railway PostgreSQL)
  - [ ] `SUPABASE_URL` and `SUPABASE_KEY` (if using Supabase)
  - [ ] `JWT_SECRET`
  - [ ] `GEMINI_API_KEY`
  - [ ] `FRONTEND_URL`
  - [ ] `GOOGLE_CLIENT_ID` (optional)
  - [ ] `GOOGLE_CLIENT_SECRET` (optional)
- [ ] Deploy: `railway up`
- [ ] Copy backend URL: `https://your-app.railway.app`
- [ ] Test backend health: `curl https://your-app.railway.app/api/health`

### Database Setup
- [ ] Database created (Railway PostgreSQL or Supabase)
- [ ] Run migrations: `railway run npm run migrate`
- [ ] Verify tables created
- [ ] Test database connection

---

## Frontend Deployment (Netlify)

### Setup
- [ ] Netlify account created
- [ ] Netlify CLI installed: `npm install -g netlify-cli`
- [ ] Logged in: `netlify login`

### Configuration
- [ ] Update `netlify.toml` with actual backend URL
- [ ] Verify build settings:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `build`

### Deploy
- [ ] Build locally first: `cd frontend && npm run build`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Add environment variables in Netlify dashboard:
  - [ ] `REACT_APP_API_URL=/api` (will be proxied)
  - [ ] `REACT_APP_ENV=production`
  - [ ] `REACT_APP_ENABLE_AI_FEATURES=true`
- [ ] Copy frontend URL: `https://your-app.netlify.app`

### Update Backend CORS
- [ ] Add Netlify URL to backend CORS whitelist
- [ ] Update `FRONTEND_URL` in Railway environment variables
- [ ] Redeploy backend if needed

---

## Post-Deployment Testing

### Frontend Tests
- [ ] Site loads without errors
- [ ] No console errors
- [ ] All pages accessible
- [ ] Routing works (refresh on any page)
- [ ] Dark mode works
- [ ] Responsive design works on mobile

### API Connection Tests
- [ ] Login works
- [ ] Signup works
- [ ] JWT token stored correctly
- [ ] Protected routes work
- [ ] Logout works

### Feature Tests
- [ ] **Dashboard**
  - [ ] Loads user data
  - [ ] Shows progress
  - [ ] Activity calendar works
  
- [ ] **AI Learnixo**
  - [ ] Chat works
  - [ ] AI responds correctly
  - [ ] Fix Code button works
  - [ ] Code is applied automatically
  
- [ ] **Playground**
  - [ ] Code editor loads
  - [ ] Code execution works
  - [ ] Multiple languages work
  - [ ] Output displays correctly
  
- [ ] **Code Editor**
  - [ ] Monaco editor loads
  - [ ] Syntax highlighting works
  - [ ] File management works
  - [ ] Save functionality works
  
- [ ] **Learning Page**
  - [ ] Modules load
  - [ ] Video player works
  - [ ] Code examples display
  - [ ] Progress tracking works
  
- [ ] **Projects**
  - [ ] Create project works
  - [ ] Edit project works
  - [ ] Delete project works
  - [ ] Projects persist

### Database Tests
- [ ] User registration saves to database
- [ ] User login retrieves from database
- [ ] Projects save correctly
- [ ] Progress updates persist
- [ ] Data doesn't disappear on refresh

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Bundle size reasonable

---

## Security Checklist

### Backend Security
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] JWT secret is strong (32+ characters)
- [ ] Environment variables not exposed
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection enabled

### Frontend Security
- [ ] No API keys in frontend code
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Security headers configured
- [ ] No sensitive data in localStorage
- [ ] Input validation on forms

---

## Monitoring Setup

### Netlify
- [ ] Analytics enabled (optional)
- [ ] Deploy notifications configured
- [ ] Error tracking setup (Sentry, optional)

### Railway
- [ ] Logs accessible
- [ ] Metrics visible
- [ ] Alerts configured (optional)

### Database
- [ ] Backups enabled
- [ ] Connection pooling configured
- [ ] Query performance monitored

---

## Documentation

- [ ] README updated with live URLs
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created

---

## Final Checks

### URLs
- [ ] Frontend URL: `https://your-app.netlify.app`
- [ ] Backend URL: `https://your-app.railway.app`
- [ ] Custom domain (if applicable): `https://your-domain.com`

### Access
- [ ] Admin account created
- [ ] Test user account created
- [ ] Demo data populated (optional)

### Communication
- [ ] Team notified of deployment
- [ ] Users notified (if applicable)
- [ ] Social media updated (if applicable)

---

## Rollback Plan

### If Something Goes Wrong

1. **Frontend Issues**
   ```bash
   # Rollback to previous deploy in Netlify dashboard
   # Or redeploy previous version
   netlify deploy --prod
   ```

2. **Backend Issues**
   ```bash
   # Rollback in Railway dashboard
   # Or redeploy previous version
   railway up
   ```

3. **Database Issues**
   ```bash
   # Restore from backup
   # Check Railway/Supabase backup options
   ```

---

## Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Check performance metrics
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Backup database regularly
- [ ] Test disaster recovery plan

### Updates
- [ ] Plan for zero-downtime deployments
- [ ] Test updates in staging first
- [ ] Communicate maintenance windows
- [ ] Keep changelog updated

---

## Success Criteria

Your deployment is successful when:

✅ All checklist items are complete
✅ Site is accessible and fast
✅ All features work as expected
✅ No errors in logs
✅ Users can sign up and use the app
✅ Data persists correctly
✅ Security measures in place
✅ Monitoring is active

---

## 🎉 Congratulations!

Your FlowState app is now live in production!

**Next Steps:**
1. Share your app with users
2. Gather feedback
3. Monitor performance
4. Plan next features
5. Keep improving!

---

## Need Help?

- **Netlify Support**: https://answers.netlify.com
- **Railway Support**: https://railway.app/help
- **Community**: Create an issue on GitHub

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Frontend URL**: _____________
**Backend URL**: _____________
**Database**: _____________
