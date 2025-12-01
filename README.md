# ModMatrix 🛡️

<div align="center">

![ModMatrix Logo](https://i.postimg.cc/Jhh44yyT/modmatrix.png)

**Advanced Discord Server Moderation & Management**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://mongodb.com)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.25-blue.svg)](https://discord.js.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)

[Features](#features) • [Quick Start](#quick-start) • [Deployment](#deployment) • [Commands](#commands) • [Dashboard](#dashboard)

</div>

---

## 🌟 Features

### Moderation Tools
- ⚠️ **Warn** - Issue warnings to members
- 👢 **Kick** - Remove members from server
- 🔨 **Ban** - Permanently ban members
- 🔇 **Mute** - Timeout members for specified duration
- ⏰ **Timeout** - Discord native timeout system
- 🔊 **Unmute** - Remove timeouts from members
- 🗑️ **Purge** - Bulk delete messages
- 🐌 **Slowmode** - Set channel slowmode

### Logging & Tracking
- 📝 **Case System** - Every action creates a tracked case
- 📊 **Moderation Logs** - Detailed logs sent to designated channel
- 📈 **Statistics** - View warns, kicks, bans, automod actions
- 🔍 **Log Viewer** - Browse all moderation history in dashboard

### Dashboard Features
- 🎨 **Modern UI** - Cyberpunk neon theme with smooth animations
- ⚙️ **Settings Panel** - Configure channels, welcome messages, automod
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🔐 **Secure** - Discord OAuth2 authentication
- 🌓 **Dark/Light Mode** - Theme toggle support

### Auto-Moderation
- 🚫 **Anti-Spam** - Detect and prevent spam messages
- 🔗 **Anti-Link** - Block unauthorized links with whitelist
- 📢 **Anti-Mass Ping** - Prevent mass mention abuse
- 🤬 **Word Filter** - Custom banned words list
- 👻 **Ghost Ping Detection** - Track deleted mentions

### Welcome System
- 👋 **Welcome Messages** - Customizable embed messages
- 📤 **Leave Messages** - Notify when members leave
- 🎨 **Rich Embeds** - Full customization (title, description, color, images)
- 📌 **Variables** - Dynamic placeholders ({user}, {server}, etc.)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)
- Discord Bot Token

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/modmatrix-bot.git
   cd modmatrix-bot
   ```

2. **Install Dependencies**
   ```bash
   cd bot && npm install
   cd ../backend && npm install
   cd ../dashboard && npm install
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` files to `.env` in each folder
   - Fill in your Discord credentials and MongoDB URI
   - See [QUICKSTART.md](QUICKSTART.md) for details

4. **Start MongoDB**
   ```bash
   net start MongoDB  # Windows
   ```

5. **Run Everything**
   ```bash
   .\RUN.bat  # Windows
   # Opens 3 terminals: Bot, Backend, Dashboard
   ```

6. **Access Dashboard**
   - Open http://localhost:3000
   - Login with Discord
   - Start managing your servers!

---

## 🌐 Deployment

Deploy ModMatrix to production for 24/7 availability:

- **MongoDB**: MongoDB Atlas (FREE 512MB)
- **Bot & Backend**: Railway.app (FREE $5 credit/month)
- **Dashboard**: Vercel (FREE unlimited)

**Total Cost: $0/month** for small servers!

📖 **Full deployment guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🎮 Commands

### Moderation Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/warn` | Warn a user | `/warn @user [reason]` |
| `/kick` | Kick a user | `/kick @user [reason]` |
| `/ban` | Ban a user | `/ban @user [reason] [delete_days]` |
| `/mute` | Mute a user | `/mute @user <duration> [reason]` |
| `/unmute` | Unmute a user | `/unmute @user [reason]` |
| `/timeout` | Timeout a user | `/timeout @user <duration> [reason]` |
| `/purge` | Delete messages | `/purge <amount> [@user]` |
| `/slowmode` | Set slowmode | `/slowmode <seconds>` |

### Duration Examples
- `10m` - 10 minutes
- `1h` - 1 hour
- `1d` - 1 day
- `7d` - 7 days

---

## 📊 Dashboard

The web dashboard provides full control over your server:

### General Settings
- Set moderation log channel
- Configure punishment log channel
- Set welcome/leave channels
- Custom mute role

### Welcome Messages
- Enable/disable welcome messages
- Customize embed (title, description, color)
- Add images and thumbnails
- Use dynamic variables

### Auto-Moderation
- **Anti-Spam**: Configure message limits
- **Anti-Link**: Whitelist allowed domains
- **Anti-Mass Ping**: Set ping thresholds
- **Word Filter**: Add banned words
- **Ghost Ping**: Enable detection

### Logs Viewer
- View all moderation cases
- Filter by action type, user, or moderator
- Search cases by ID
- Export logs (coming soon)

### Statistics
- Total moderation actions
- Warns, kicks, bans breakdown
- Auto-mod actions count
- Visual charts (coming soon)

---

## 🏗️ Architecture

```
modmatrix-bot/
├── bot/                    # Discord bot (Discord.js)
│   ├── commands/          # Slash commands
│   ├── events/            # Discord events
│   ├── models/            # Mongoose schemas
│   └── utils/             # Helper functions
│
├── backend/               # REST API (Express.js)
│   ├── routes/            # API endpoints
│   ├── models/            # Mongoose schemas
│   └── middleware/        # Auth & validation
│
└── dashboard/             # Web UI (React)
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Dashboard pages
    │   ├── context/       # React context
    │   └── services/      # API calls
    └── public/            # Static assets
```

---

## 🔒 Security

- ✅ Discord OAuth2 authentication
- ✅ JWT tokens for API security
- ✅ Permission-based access control
- ✅ Environment variable protection
- ✅ Rate limiting on API endpoints
- ✅ MongoDB injection prevention
- ✅ CORS configuration

---

## 🛠️ Technologies

### Bot
- **Discord.js 14** - Discord API wrapper
- **Mongoose** - MongoDB ODM
- **dotenv** - Environment configuration

### Backend
- **Express.js** - REST API framework
- **MongoDB** - Database
- **Passport.js** - OAuth authentication
- **JWT** - Token-based auth
- **Axios** - HTTP client

### Dashboard
- **React 18** - UI framework
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

---

## 📈 Roadmap

- [ ] Export logs to CSV/JSON
- [ ] Advanced analytics dashboard
- [ ] Custom command aliases
- [ ] Timed punishments (auto-unban)
- [ ] Appeal system
- [ ] Ticket system
- [ ] Music commands
- [ ] Leveling system
- [ ] Economy system
- [ ] Custom role rewards

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

Need help? Here's how to get support:

1. Check [QUICKSTART.md](QUICKSTART.md) and [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Review common issues in documentation
3. Open an issue on GitHub
4. Join our Discord server (coming soon)

---

## 🙏 Acknowledgments

- Discord.js community
- MongoDB team
- All contributors and users

---

<div align="center">

**Made with ❤️ by the ModMatrix Team**

⭐ Star this repo if you find it helpful!

</div>
