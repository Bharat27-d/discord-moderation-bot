# Backend API Setup

## Installation

```powershell
npm install
```

## Configuration

Edit `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/discord-bot
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:5000/auth/callback
JWT_SECRET=your_random_jwt_secret_here
FRONTEND_URL=http://localhost:3000
BOT_TOKEN=your_bot_token
```

### Getting Discord OAuth Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "OAuth2" section
4. Copy "Client ID" → `DISCORD_CLIENT_ID`
5. Copy "Client Secret" → `DISCORD_CLIENT_SECRET`
6. Add redirect URL: `http://localhost:5000/auth/callback`

### Generating JWT Secret

Run in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output to `JWT_SECRET`

## Running the Backend

### Production Mode
```powershell
npm start
```

### Development Mode (auto-reload)
```powershell
npm run dev
```

## API Endpoints

### Authentication
- `GET /auth/discord` - Initiate Discord OAuth
- `GET /auth/callback` - OAuth callback
- `GET /auth/logout` - Logout user

### Servers
- `GET /api/servers` - Get user's servers
- `GET /api/server/:guildId` - Get server details
- `GET /api/server/:guildId/settings` - Get server settings
- `PUT /api/server/:guildId/settings` - Update server settings
- `GET /api/server/:guildId/logs` - Get moderation logs

### Health Check
- `GET /health` - Server health status

## Testing API

Use PowerShell to test endpoints:

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:5000/health

# Get servers (requires authentication)
Invoke-WebRequest -Uri http://localhost:5000/api/servers -UseDefaultCredentials
```

## Troubleshooting

**Port already in use:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

**MongoDB connection failed:**
- Ensure MongoDB is running
- Check `MONGO_URI` is correct
- Try: `mongod --dbpath C:\data\db`

**CORS errors:**
- Verify `FRONTEND_URL` matches dashboard URL
- Check frontend is running on port 3000
