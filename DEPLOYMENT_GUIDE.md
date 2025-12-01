# ModMatrix - Discord Moderation Bot

## Deployment Guide

This guide will help you deploy ModMatrix to production so it runs 24/7.

---

## Prerequisites

1. GitHub account (to store code)
2. MongoDB Atlas account (free database)
3. Railway account (free hosting for bot & backend)
4. Vercel account (free hosting for dashboard)

---

## Part 1: MongoDB Atlas Setup (5 minutes)

### Create Free Cloud Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** → Sign up with Google/GitHub
3. Create a **FREE M0 cluster**:
   - Cloud Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: `discord-bot`
4. Click **"Create Cluster"** (takes 3-5 minutes)

### Get Connection String

1. Click **"Connect"** on your cluster
2. Click **"Compass"** → Copy the connection string
3. It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/discord-bot`
4. Replace `<username>` and `<password>` with your actual credentials
5. Keep this string safe - you'll need it!

### Setup Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `modmatrix`
4. Password: Click **"Autogenerate Secure Password"** (save it!)
5. Database User Privileges: **Read and write to any database**
6. Click **"Add User"**

### Allow Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

✅ MongoDB Atlas is ready!

---

## Part 2: Push to GitHub (5 minutes)

### Initialize Git Repository (if not already done)

```bash
cd d:\discord-moderation-bot
git init
git add .
git commit -m "Initial commit - ModMatrix bot"
```

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `modmatrix-bot`
3. Privacy: **Private** (recommended) or Public
4. **Don't** initialize with README
5. Click **"Create repository"**

### Push Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/modmatrix-bot.git
git branch -M main
git push -u origin main
```

✅ Code is on GitHub!

---

## Part 3: Deploy Bot to Railway (10 minutes)

### Create Railway Account

1. Go to https://railway.app
2. Click **"Login"** → Sign in with GitHub
3. Authorize Railway

### Deploy Bot

1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your `modmatrix-bot` repository
3. Railway will detect it - click **"Add variables"**

### Set Environment Variables (Bot)

Add these variables:

```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/discord-bot
API_URL=http://localhost:5000
```

### Configure Bot Service

1. Click **Settings** → **Root Directory**: `/bot`
2. **Start Command**: `npm start`
3. **Build Command**: `npm install`
4. Click **"Deploy"**

✅ Bot is deploying!

---

## Part 4: Deploy Backend API to Railway (10 minutes)

### Add Backend Service

1. In same Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select same `modmatrix-bot` repository
3. Click **"Add variables"**

### Set Environment Variables (Backend)

```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/discord-bot
BOT_TOKEN=your_bot_token_here
JWT_SECRET=your_super_secret_random_string_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=https://your-backend-url.railway.app/auth/discord/callback
FRONTEND_URL=https://your-dashboard-url.vercel.app
PORT=5000
```

### Configure Backend Service

1. Click **Settings** → **Root Directory**: `/backend`
2. **Start Command**: `npm start`
3. **Build Command**: `npm install`
4. Click **"Generate Domain"** (under Settings → Networking)
5. Copy the domain (e.g., `modmatrix-backend.railway.app`)
6. Click **"Deploy"**

### Update Discord OAuth Redirect URI

1. Go to https://discord.com/developers/applications
2. Select your bot application
3. Go to **OAuth2** → **Redirects**
4. Add: `https://your-backend-domain.railway.app/auth/discord/callback`
5. Save changes

✅ Backend is deployed!

---

## Part 5: Deploy Dashboard to Vercel (5 minutes)

### Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"** → Sign in with GitHub
3. Authorize Vercel

### Deploy Dashboard

1. Click **"Add New..."** → **"Project"**
2. Import your `modmatrix-bot` repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Set Environment Variables

```
REACT_APP_API_URL=https://your-backend-domain.railway.app
```

4. Click **"Deploy"**
5. Wait 2-3 minutes for build

### Get Dashboard URL

1. After deployment, copy your dashboard URL (e.g., `modmatrix-dashboard.vercel.app`)
2. Go back to Railway → Backend service
3. Update `FRONTEND_URL` environment variable with your Vercel URL
4. Redeploy backend

✅ Dashboard is live!

---

## Part 6: Final Configuration

### Update All URLs

1. **Railway Backend** - Update these variables:
   ```
   DISCORD_REDIRECT_URI=https://your-backend.railway.app/auth/discord/callback
   FRONTEND_URL=https://your-dashboard.vercel.app
   ```

2. **Railway Bot** - Update:
   ```
   API_URL=https://your-backend.railway.app
   ```

3. **Discord Developer Portal**:
   - OAuth2 Redirect: `https://your-backend.railway.app/auth/discord/callback`
   - OAuth2 URL: `https://your-dashboard.vercel.app`

### Test Everything

1. Visit `https://your-dashboard.vercel.app`
2. Click "Login with Discord"
3. Authorize the bot
4. You should see your servers!

---

## Troubleshooting

### Bot Not Online
- Check Railway logs for bot service
- Verify `DISCORD_TOKEN` is correct
- Ensure bot has proper intents enabled

### Dashboard Login Fails
- Check Railway logs for backend service
- Verify `DISCORD_REDIRECT_URI` matches exactly
- Check `FRONTEND_URL` is correct

### Database Connection Error
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check `MONGO_URI` connection string is correct
- Ensure database user has read/write permissions

---

## Cost Breakdown

- ✅ **MongoDB Atlas**: FREE (512MB)
- ✅ **Railway**: FREE ($5 credit/month, enough for small bots)
- ✅ **Vercel**: FREE (unlimited deployments)

**Total: $0/month** for hobby/small servers!

---

## Upgrading Later

As your bot grows:
- Railway: $5/month removes sleep timer
- MongoDB Atlas: $9/month for 2GB storage
- Consider dedicated VPS for $5-10/month

---

## Support

If you encounter issues:
1. Check Railway/Vercel deployment logs
2. Verify all environment variables
3. Test MongoDB connection string locally first

Your bot is now running 24/7! 🎉
