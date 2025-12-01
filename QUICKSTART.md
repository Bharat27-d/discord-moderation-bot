# ModMatrix Quick Start

## Local Development (Testing on Your Computer)

1. **Install Requirements**
   - Node.js 18+ (https://nodejs.org)
   - MongoDB (https://www.mongodb.com/try/download/community)

2. **Clone & Setup**
   ```bash
   git clone https://github.com/YOUR_USERNAME/modmatrix-bot.git
   cd modmatrix-bot
   ```

3. **Configure Environment Variables**
   
   **Bot** (`bot/.env`):
   ```
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   MONGO_URI=mongodb://localhost:27017/discord-bot
   API_URL=http://localhost:5000
   ```

   **Backend** (`backend/.env`):
   ```
   MONGO_URI=mongodb://localhost:27017/discord-bot
   BOT_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_REDIRECT_URI=http://localhost:5000/auth/discord/callback
   JWT_SECRET=random_secret_string_here
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

   **Dashboard** (`dashboard/.env`):
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Install Dependencies**
   ```bash
   cd bot
   npm install
   cd ../backend
   npm install
   cd ../dashboard
   npm install
   cd ..
   ```

5. **Start MongoDB**
   ```bash
   # Windows (if MongoDB installed as service)
   net start MongoDB
   
   # Or just ensure MongoDB Compass is running
   ```

6. **Run Everything**
   ```bash
   # From root directory
   .\RUN.bat
   ```

7. **Access Dashboard**
   - Open: http://localhost:3000
   - Login with Discord
   - Start moderating!

---

## Production Deployment (24/7 Public Bot)

See `DEPLOYMENT_GUIDE.md` for full instructions.

**Quick Steps:**
1. Setup MongoDB Atlas (free cloud database)
2. Push code to GitHub
3. Deploy bot to Railway
4. Deploy backend to Railway
5. Deploy dashboard to Vercel
6. Update all environment variables
7. Done! Bot runs 24/7

---

## Getting Bot Token & Client ID

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it "ModMatrix"
3. Go to "Bot" tab → Click "Reset Token" → Copy token
4. Go to "OAuth2" → Copy "Client ID" and "Client Secret"
5. Enable these intents (Bot tab → Privileged Gateway Intents):
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

---

## Inviting Bot to Server

Use this URL (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=1099511627775&scope=bot%20applications.commands
```

---

## Support

- Check logs in terminal/Railway/Vercel
- Verify environment variables
- Ensure MongoDB is running
- Check Discord bot has proper intents enabled
