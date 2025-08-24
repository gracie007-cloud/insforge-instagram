# Instagram Clone - InsForge

A full-featured Instagram clone built with React, TypeScript, and InsForge Backend.

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. **IMPORTANT**: Add environment variables:
   - Click "Environment Variables"
   - Add: `VITE_APP_URL` = `https://your-app-name.vercel.app` (you'll update this after first deploy)
   - Add: `VITE_API_BASE_URL` = `https://4g87vjv6.us-east.insforge.app`
6. Click "Deploy"

### Step 3: Update OAuth Redirect URL

After deployment, you'll get your Vercel URL (like `https://your-app.vercel.app`)

1. Go back to Vercel project settings
2. Update the `VITE_APP_URL` environment variable with your actual Vercel URL
3. Redeploy by clicking "Redeploy" in Vercel dashboard

## 🎉 That's it!

Your Instagram clone is now live on Vercel with:
- Automatic HTTPS
- Global CDN
- Automatic deployments on git push
- InsForge backend integration

## Features

- 📱 User authentication (Email/Password + Google OAuth)
- 📸 Create posts with multiple images/videos
- ❤️ Like and comment on posts
- 👤 User profiles with follow system
- 🔔 Real-time updates
- 📱 Fully responsive design

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: InsForge (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Authentication**: JWT + Google OAuth