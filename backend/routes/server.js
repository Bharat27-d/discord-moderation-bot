const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const GuildSettings = require('../models/GuildSettings');
const ModerationCase = require('../models/ModerationCase');
const config = require('../config');

// Discord API helper
async function discordAPI(endpoint, method = 'GET', data = null) {
    try {
        console.log(`🌐 [server.js discordAPI] Calling: ${endpoint}`);
        
        const config_axios = {
            headers: {
                'Authorization': `Bot ${config.botToken}`,
                'Content-Type': 'application/json'
            }
        };
        
        let response;
        if (method === 'GET') {
            response = await axios.get(`https://discord.com/api/v10${endpoint}`, config_axios);
        } else if (method === 'POST') {
            response = await axios.post(`https://discord.com/api/v10${endpoint}`, data, config_axios);
        } else if (method === 'PATCH') {
            response = await axios.patch(`https://discord.com/api/v10${endpoint}`, data, config_axios);
        } else if (method === 'DELETE') {
            response = await axios.delete(`https://discord.com/api/v10${endpoint}`, config_axios);
        } else {
            // Fallback to generic method
            response = await axios({
                method,
                url: `https://discord.com/api/v10${endpoint}`,
                headers: config_axios.headers,
                data
            });
        }
        
        console.log(`✅ [server.js discordAPI] Success: ${endpoint}`);
        return response.data;
    } catch (error) {
        console.log(`❌ [server.js discordAPI] Error on ${endpoint}:`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Data:`, error.response?.data);
        
        // Silent fail for expected errors (Unknown Guild, Cloudflare, HTML responses, etc.)
        const isHTMLResponse = typeof error.response?.data === 'string' && error.response.data.includes('<html');
        const isExpectedError = error.response?.status === 404 || 
                               error.response?.status === 400 ||
                               error.response?.data?.code === 10004 ||
                               isHTMLResponse;
        
        if (!isExpectedError) {
            console.error(`❌ Discord API error (${endpoint}):`, error.response?.status || error.message);
        }
        return null;
    }
}

// Middleware to check if user can manage server
async function canManageServer(req, res, next) {
    const { id } = req.params;
    const user = req.user;
    
    if (!user.guilds.includes(id)) {
        return res.status(403).json({ error: 'You do not have permission to manage this server' });
    }
    
    req.guildId = id;
    next();
}

// Get server details
router.get('/:id', authenticateToken, canManageServer, async (req, res) => {
    try {
        console.log(`📡 [server.js] Fetching server details for: ${req.guildId}`);
        const guild = await discordAPI(`/guilds/${req.guildId}?with_counts=true`);
        
        console.log(`🔍 [server.js] Guild response:`, guild ? `Success - ${guild.name}` : 'NULL');
        
        if (!guild) {
            console.log(`⚠️ [server.js] Server ${req.guildId} returned NULL from discordAPI`);
            return res.status(404).json({ 
                error: 'Server not found',
                message: 'The bot is not in this server or cannot access it. Please invite the bot first.' 
            });
        }
        
        console.log(`✅ Successfully fetched server: ${guild.name}`);
        res.json({
            id: guild.id,
            name: guild.name,
            icon: guild.icon 
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : null,
            memberCount: guild.approximate_member_count || 0,
            ownerId: guild.owner_id
        });
        
    } catch (error) {
        console.error('❌ Get server error:', error);
        res.status(500).json({ error: 'Failed to fetch server details' });
    }
});

// Get server channels
router.get('/:id/channels', authenticateToken, canManageServer, async (req, res) => {
    try {
        const channelsData = await discordAPI(`/guilds/${req.guildId}/channels`);
        
        if (!channelsData) {
            return res.status(404).json({ error: 'Channels not found' });
        }
        
        const channels = channelsData
            .filter(channel => channel.type === 0) // Text channels only
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position
            }))
            .sort((a, b) => a.position - b.position);
        
        res.json({ channels });
        
    } catch (error) {
        console.error('Get channels error:', error);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
});

// Get server roles
router.get('/:id/roles', authenticateToken, canManageServer, async (req, res) => {
    try {
        const rolesData = await discordAPI(`/guilds/${req.guildId}/roles`);
        
        if (!rolesData) {
            return res.status(404).json({ error: 'Roles not found' });
        }
        
        const roles = rolesData
            .filter(role => !role.managed && role.name !== '@everyone')
            .map(role => ({
                id: role.id,
                name: role.name,
                color: `#${role.color.toString(16).padStart(6, '0')}`,
                position: role.position
            }))
            .sort((a, b) => b.position - a.position);
        
        res.json({ roles });
        
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

// Get server settings
router.get('/:id/settings', authenticateToken, canManageServer, async (req, res) => {
    try {
        let settings = await GuildSettings.findOne({ guildId: req.guildId });
        
        console.log('📖 Fetching settings for guild:', req.guildId);
        console.log('📊 Settings found:', settings ? 'Yes' : 'No');
        
        if (!settings) {
            console.log('➕ Creating new settings for guild:', req.guildId);
            settings = new GuildSettings({ guildId: req.guildId });
            await settings.save();
        } else {
            console.log('📊 modLog:', settings.modLog);
            console.log('📊 welcomeChannel:', settings.welcomeChannel);
        }
        
        res.json({ settings });
        
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update server settings
router.post('/:id/settings', authenticateToken, canManageServer, async (req, res) => {
    try {
        const { settings: newSettings } = req.body;
        
        let settings = await GuildSettings.findOne({ guildId: req.guildId });
        
        if (!settings) {
            settings = new GuildSettings({ guildId: req.guildId });
        }
        
        // List of fields that should be strings (channel/role IDs), not objects
        const stringFields = ['modLog', 'punishmentLog', 'welcomeChannel', 'leaveChannel', 'muteRole', 'appealLink'];
        
        // Update settings
        Object.keys(newSettings).forEach(key => {
            const value = newSettings[key];
            
            // Skip if value is undefined
            if (value === undefined) return;
            
            // Handle string fields - convert empty objects to null
            if (stringFields.includes(key)) {
                if (value === null) {
                    settings[key] = null;
                } else if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
                    settings[key] = null;
                } else if (typeof value === 'string') {
                    settings[key] = value || null;
                }
            }
            // Handle nested objects (welcomeMessage, leaveMessage, automod, punishments)
            else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                settings[key] = { ...settings[key]?.toObject?.() || settings[key] || {}, ...value };
            }
            // Handle arrays and primitives
            else {
                settings[key] = value;
            }
        });
        
        await settings.save();
        
        console.log('✅ Settings saved for guild:', req.guildId);
        console.log('📊 modLog:', settings.modLog);
        console.log('📊 welcomeChannel:', settings.welcomeChannel);
        console.log('📊 Welcome enabled:', settings.welcomeMessage?.enabled);
        
        res.json({ message: 'Settings updated successfully', settings });
        
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Get moderation logs
router.get('/:id/logs', authenticateToken, canManageServer, async (req, res) => {
    try {
        const { page = 1, limit = 50, action, userId, moderatorId } = req.query;
        
        const query = { guildId: req.guildId };
        
        if (action) query.action = action;
        if (userId) query.userId = userId;
        if (moderatorId) query.moderatorId = moderatorId;
        
        const logs = await ModerationCase.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await ModerationCase.countDocuments(query);
        
        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
        
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Send embed to channel
router.post('/:id/embed/send', authenticateToken, canManageServer, async (req, res) => {
    try {
        const { channelId, embed } = req.body;
        
        if (!channelId || !embed) {
            return res.status(400).json({ error: 'Missing channelId or embed data' });
        }
        
        const embedData = {
            embeds: [{
                title: embed.title,
                description: embed.description,
                color: embed.color ? parseInt(embed.color.replace('#', ''), 16) : null,
                thumbnail: embed.thumbnail ? { url: embed.thumbnail } : undefined,
                image: embed.image ? { url: embed.image } : undefined,
                footer: embed.footer ? { text: embed.footer } : undefined,
                author: embed.author ? { name: embed.author.name, icon_url: embed.author.iconURL } : undefined,
                fields: embed.fields || [],
                timestamp: new Date().toISOString()
            }]
        };
        
        const result = await discordAPI(`/channels/${channelId}/messages`, 'POST', embedData);
        
        if (!result) {
            return res.status(500).json({ error: 'Failed to send embed' });
        }
        
        res.json({ message: 'Embed sent successfully' });
        
    } catch (error) {
        console.error('Send embed error:', error);
        res.status(500).json({ error: 'Failed to send embed' });
    }
});

module.exports = router;