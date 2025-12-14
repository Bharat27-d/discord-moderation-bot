# Discord Moderation Bot 🤖

A comprehensive Discord moderation bot with an advanced web dashboard for server management, analytics, and automation. Built with Discord.js v14, React, Node.js, Express, and MongoDB.

## ✨ Features

### 🛡️ Moderation Commands
- **Ban/Kick** - Remove problematic users from your server
- **Mute/Unmute** - Temporarily silence users
- **Timeout** - Discord's native timeout feature
- **Warn** - Issue warnings to users with case tracking
- **Purge** - Bulk delete messages
- **Slowmode** - Control message rate in channels

### 📢 Server Management
- **Announcements** - Schedule and send formatted announcements
- **Custom Commands** - Create custom bot commands
- **Reaction Roles** - Auto-assign roles based on reactions
- **Ticket System** - Support ticket system with categories
- **Reminders** - Set reminders for users and channels

### 📊 Analytics & Logging
- **Server Analytics** - Track server growth and activity
- **Message Logs** - Track message edits and deletions
- **Member Logs** - Monitor member joins/leaves
- **Role Logs** - Track role changes
- **Voice Logs** - Monitor voice channel activity
- **Advanced Analytics** - Detailed insights with charts and graphs

### 🎨 Web Dashboard
- **Server Overview** - Real-time server statistics
- **User Management** - View and manage server members
- **Settings Configuration** - Configure bot features per server
- **Embed Builder** - Create beautiful Discord embeds
- **Profile Management** - User profile and preferences
- **Dark/Light Theme** - Toggle between themes

## 🏗️ Project Structure

```
discord-moderation-bot/
├── bot/                    # Discord bot application
│   ├── commands/          # Slash commands
│   ├── events/            # Discord event handlers
│   ├── handlers/          # Command and event handlers
│   ├── models/            # MongoDB models
│   └── utils/             # Utility functions
├── backend/               # REST API server
│   ├── middleware/        # Authentication middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API endpoints
│   └── server.js          # Express server
├── dashboard/             # React web dashboard
│   ├── public/            # Static files
│   └── src/               # React components and pages
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Discord Bot Token** ([Create one here](https://discord.com/developers/applications))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/discord-moderation-bot.git
   cd discord-moderation-bot
   ```

2. **Install dependencies for all modules**
   ```bash
   # Install bot dependencies
   cd bot
   npm install

   # Install backend dependencies
   cd ../backend
   npm install

   # Install dashboard dependencies
   cd ../dashboard
   npm install
   ```

3. **Set up environment variables**

   **Bot Configuration** (`bot/.env`):
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   MONGO_URI=mongodb://localhost:27017/discord-bot
   API_URL=http://localhost:5000
   ```

   **Backend Configuration** (`backend/.env`):
   ```env
   MONGO_URI=mongodb://localhost:27017/discord-bot
   BOT_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here
   DISCORD_REDIRECT_URI=http://localhost:5000/auth/discord/callback
   JWT_SECRET=your_super_secret_random_string_here
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

4. **Set up MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Windows
   net start MongoDB

   # Linux/Mac
   sudo systemctl start mongod
   ```

5. **Deploy slash commands**
   ```bash
   cd bot
   node deploy-commands.js
   ```

## 🎮 Running the Application

### Option 1: Run All Services at Once (Recommended)

**Windows:**
```bash
# Using batch file
RUN.bat

# Or using PowerShell script
.\start-all.ps1
```

**Linux/Mac:**
```bash
# Make sure to create a shell script or run each service in separate terminals
```

### Option 2: Run Services Individually

**Terminal 1 - Discord Bot:**
```bash
cd bot
npm start
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm start
```

**Terminal 3 - Dashboard:**
```bash
cd dashboard
npm start
```

The services will be available at:
- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Bot**: Running in Discord

## 🔧 Configuration

### Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Enable the following **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent
   - Presence Intent
5. Go to "OAuth2" section and note your **Client ID** and **Client Secret**
6. Add redirect URL: `http://localhost:5000/auth/discord/callback`

### Bot Permissions

Required bot permissions (Permission integer: 8589934591):
- Administrator (or specific permissions based on your needs)
- Manage Server
- Manage Roles
- Manage Channels
- Kick Members
- Ban Members
- Moderate Members
- Manage Messages
- Read Messages/View Channels
- Send Messages
- Manage Webhooks
- Read Message History

### Invite Bot to Your Server

Run the invite generator:
```bash
cd bot
node generate-invite.js
```

Or use this URL format:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8589934591&scope=bot%20applications.commands
```

## 📝 Usage Examples

### Moderation Commands

```
/ban @user reason: Spamming
/kick @user reason: Breaking rules
/warn @user reason: Inappropriate behavior
/mute @user duration: 1h reason: Toxic behavior
/purge amount: 50
/slowmode duration: 10s
```

### Utility Commands

```
/announce channel: #general message: Important announcement
/reactionrole create
/ticket-setup
/remind time: 30m message: Check the event
/customcommand create name: rules response: Read our rules!
```

## 🛠️ Development

### Bot Development

```bash
cd bot
npm run dev  # Runs with nodemon for auto-restart
```

### Backend Development

```bash
cd backend
npm run dev  # Runs with nodemon for auto-restart
```

### Dashboard Development

```bash
cd dashboard
npm start  # Runs with hot reload
```

## 📊 Database Models

The bot uses MongoDB with Mongoose for data persistence:

- **User** - User profiles and authentication
- **GuildSettings** - Server-specific configurations
- **ModerationCase** - Moderation actions history
- **MessageLog** - Message edit/delete logs
- **MemberLog** - Member join/leave logs
- **RoleLog** - Role change logs
- **VoiceLog** - Voice channel activity
- **Ticket** - Support tickets
- **ReactionRole** - Reaction role configurations
- **CustomCommand** - Custom commands
- **Announcement** - Scheduled announcements
- **Reminder** - User reminders
- **ServerAnalytics** - Analytics data
- **UserActivity** - User activity tracking

## 🔐 Security

- **JWT Authentication** - Secure API endpoints
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize user inputs
- **Environment Variables** - Sensitive data protection
- **CORS Protection** - Controlled cross-origin requests

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Bot doesn't respond to commands
- Ensure the bot has proper permissions in your server
- Check if slash commands are deployed: `node deploy-commands.js`
- Verify `CLIENT_ID` and `DISCORD_TOKEN` are correct
- Check if the bot has the "applications.commands" scope

### Dashboard can't connect to backend
- Verify backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Ensure `FRONTEND_URL` in backend `.env` is correct

### Database connection errors
- Ensure MongoDB is running
- Verify `MONGO_URI` in environment variables
- Check MongoDB connection string format

### Authentication issues
- Verify `DISCORD_CLIENT_SECRET` is correct
- Check `DISCORD_REDIRECT_URI` matches the one in Discord Developer Portal
- Ensure `JWT_SECRET` is set and secure

## 📞 Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Join our Discord server (if applicable)
- Email: your-email@example.com

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Chart.js](https://www.chartjs.org/) - Analytics charts

---

Made with ❤️ by the Discord Moderation Bot Team
