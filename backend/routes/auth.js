const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// OAuth2 Login
router.get('/discord', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${encodeURIComponent(config.discordRedirectUri)}&response_type=code&scope=identify%20guilds`;
    res.redirect(authUrl);
});

router.get('/login', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.discordClientId}&redirect_uri=${encodeURIComponent(config.discordRedirectUri)}&response_type=code&scope=identify%20guilds`;
    res.redirect(authUrl);
});

// OAuth2 Callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect(`${config.frontendUrl}/login?error=no_code`);
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
            new URLSearchParams({
                client_id: config.discordClientId,
                client_secret: config.discordClientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: config.discordRedirectUri
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const discordUser = userResponse.data;
        
        // Get user guilds
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const guilds = guildsResponse.data
            .filter(guild => (guild.permissions & 0x20) === 0x20) // MANAGE_GUILD permission
            .map(guild => guild.id);
        
        // Save or update user
        let user = await User.findOne({ discordId: discordUser.id });
        
        if (user) {
            user.username = discordUser.username;
            user.discriminator = discordUser.discriminator;
            user.avatar = discordUser.avatar;
            user.accessToken = access_token;
            user.refreshToken = refresh_token;
            user.guilds = guilds;
            await user.save();
        } else {
            user = new User({
                discordId: discordUser.id,
                username: discordUser.username,
                discriminator: discordUser.discriminator,
                avatar: discordUser.avatar,
                accessToken: access_token,
                refreshToken: refresh_token,
                guilds: guilds
            });
            await user.save();
        }
        
        // Create JWT
        const jwtToken = jwt.sign(
            { userId: discordUser.id },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`${config.frontendUrl}/auth/callback?token=${jwtToken}`);
        
    } catch (error) {
        console.error('OAuth callback error:', error.response?.data || error.message);
        res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        
        res.json({
            id: user.discordId,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            avatarUrl: user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

module.exports = router;