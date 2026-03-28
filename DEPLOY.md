# 🚀 SpendXP MVP Deployment Guide

## Quick Setup (Under 30 minutes)

### 1. Local Production Test
```bash
# Test local production build
npm run mvp:local
```

Verify app works at:
- http://localhost:9002
- http://<your-local-ip>:9002

### 2. Push to GitHub
```bash
git add .
git commit -m "MVP-ready deployment setup"
git push origin main
```

### 3. Deploy to Vercel

#### A) Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "SpendXP" project

#### B) Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_v3_key
FIREBASE_ADMIN_SDK_KEY=your_admin_sdk_json_content
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

#### C) Deploy
1. Click "Deploy"
2. Wait for deployment (~2-3 minutes)
3. Click the production URL to verify

### 4. Verify Production
Check these URLs work:
- https://your-app-name.vercel.app/
- https://your-app-name.vercel.app/login
- https://your-app-name.vercel.app/dashboard

## Troubleshooting

### Build Issues
- Run `npm run typecheck` locally first
- Ensure all env vars are set in Vercel
- Check Vercel build logs for errors

### Runtime Issues  
- Verify Firebase project settings allow your Vercel domain
- Check API keys have correct permissions
- Ensure CORS settings allow your domain

### Local Development
```bash
# Restart local dev server
npm run mvp:restart

# Development mode
npm run dev
```

## Success Criteria
✅ Build passes locally  
✅ App loads in local production  
✅ Deployed to Vercel  
✅ All pages load in production  
✅ Authentication works  
✅ Firebase connects successfully

## Support
- Check Vercel logs: Dashboard → Functions → Logs
- Firebase console: Project settings → Service accounts
- Local testing: `npm run typecheck && npm run build`
