# Dashboard Setup

## Installation

```powershell
npm install
```

## Configuration

Edit `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DISCORD_CLIENT_ID=your_client_id_here
REACT_APP_REDIRECT_URI=http://localhost:5000/auth/callback
```

### Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)
- `REACT_APP_DISCORD_CLIENT_ID` - Your Discord application client ID
- `REACT_APP_REDIRECT_URI` - OAuth callback URL (must match backend)

## Running the Dashboard

### Development Mode
```powershell
npm start
```

Opens browser at http://localhost:3000

### Production Build
```powershell
npm run build
```

Creates optimized production build in `build/` folder

## Features

### Pages
- **Login** - Discord OAuth authentication
- **Servers** - List of servers bot is in
- **Dashboard** - Server overview and stats
- **Settings** - Configure moderation settings
- **Logs** - View moderation logs
- **Embed Builder** - Create custom Discord embeds
- **Profile** - User profile and preferences

### Moderation Settings
- Auto-moderation toggles
- Moderation roles configuration
- Log channel setup
- Banned words filter
- Welcome/leave messages

## Development

### Available Scripts

```powershell
# Start dev server
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from create-react-app (irreversible)
npm run eject
```

### File Structure

```
src/
├── components/     # Reusable components
├── context/        # React context providers
├── pages/          # Page components
├── services/       # API service layer
└── utils/          # Utility functions
```

## Troubleshooting

**Can't login:**
- Check backend is running on port 5000
- Verify `REACT_APP_DISCORD_CLIENT_ID` matches Discord app
- Check redirect URI in Discord Developer Portal

**API calls failing:**
- Verify `REACT_APP_API_URL` is correct
- Check backend CORS settings
- Open browser console for errors

**Build errors:**
- Delete `node_modules` and run `npm install` again
- Clear cache: `npm cache clean --force`

**Port 3000 in use:**
- React will prompt to use different port
- Or stop other process using port 3000

## Deployment

For production deployment:

1. Update `.env` with production URLs
2. Build: `npm run build`
3. Serve `build/` folder with any static hosting
4. Configure backend CORS for production domain

Popular hosting options:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
