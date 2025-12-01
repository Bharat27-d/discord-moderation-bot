# Discord Bot Setup

## Installation

```powershell
npm install
```

## Configuration

Edit `.env` file with your credentials:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
MONGO_URI=mongodb://localhost:27017/discord-bot
API_URL=http://localhost:5000
```

### Getting Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to "Bot" section
4. Click "Reset Token" to get your bot token
5. Copy the token to `DISCORD_TOKEN` in `.env`

### Getting Client ID

1. In Discord Developer Portal
2. Go to "General Information"
3. Copy "Application ID"
4. Paste into `CLIENT_ID` in `.env`

### Bot Intents

Make sure these intents are enabled in Discord Developer Portal:
- ✅ Server Members Intent
- ✅ Message Content Intent

### Bot Permissions

Required permissions (use OAuth2 URL Generator):
- Administrator (or specific moderation permissions)

## Running the Bot

### Production Mode
```powershell
npm start
```

### Development Mode (auto-reload)
```powershell
npm run dev
```

## Registering Slash Commands

After starting the bot for the first time, slash commands will be automatically registered.

## Inviting Bot to Server

1. Go to Discord Developer Portal
2. OAuth2 > URL Generator
3. Select scopes: `bot`, `applications.commands`
4. Select permissions: `Administrator`
5. Copy generated URL and open in browser
6. Select your server and authorize

## Troubleshooting

**Bot won't start:**
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Ensure Discord token is valid

**Commands not showing:**
- Wait a few minutes (Discord caches commands)
- Check bot has proper permissions
- Verify intents are enabled

**Database errors:**
- Ensure MongoDB is running on localhost:27017
- Or update `MONGO_URI` to point to your MongoDB instance
