const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

// Discord API helper with retry logic
async function discordAPI(endpoint, retries = 3, delay = 500) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🌐 Attempting API call: ${endpoint} (attempt ${i + 1}/${retries})`);
            const response = await axios.get(`https://discord.com/api/v10${endpoint}`, {
                headers: {
                    'Authorization': `Bot ${config.botToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ API call successful: ${endpoint}`);
            return response.data;
        } catch (error) {
            console.log(`❌ API call failed: ${endpoint}`);
            console.log(`   Error status: ${error.response?.status}`);
            console.log(`   Error data type: ${typeof error.response?.data}`);
            console.log(`   First 100 chars of error:`, JSON.stringify(error.response?.data)?.substring(0, 100));
            // Debug logging for guild endpoints
            if (endpoint.includes('/guilds/') && endpoint.includes('with_counts')) {
                console.log(`🔍 API Error for ${endpoint}:`);
                console.log(`   Status: ${error.response?.status}`);
                console.log(`   Data type: ${typeof error.response?.data}`);
                console.log(`   Is HTML: ${typeof error.response?.data === 'string' && error.response?.data?.includes('<html')}`);
                if (typeof error.response?.data === 'object') {
                    console.log(`   Error code: ${error.response?.data?.code}`);
                    console.log(`   Error message: ${error.response?.data?.message}`);
                }
            }
            
            // Silent fail for expected errors (Unknown Guild, Cloudflare, HTML responses, etc.)
            const isHTMLResponse = typeof error.response?.data === 'string' && error.response.data.includes('<html');
            const isExpectedError = error.response?.status === 404 || 
                                   error.response?.status === 400 ||
                                   error.response?.data?.code === 10004 ||
                                   isHTMLResponse;
            
            if (isExpectedError) {
                console.log(`   ℹ️ Treating as expected error - returning null`);
                return null;
            }
            
            if (error.response?.status === 429) {
                // Rate limited - wait and retry
                const retryAfter = error.response.data?.retry_after || 1;
                const waitTime = (retryAfter * 1000) + delay;
                if (i === 0) {
                    console.log(`⏱️ Rate limited, waiting ${waitTime}ms...`);
                }
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            if (i === retries - 1) {
                console.error(`❌ Discord API error (${endpoint}):`, error.response?.status || error.message);
                return null;
            }
            
            // Wait before retrying on other errors
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    return null;
}

// Get user's manageable servers
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const servers = [];
        
        // Get list of guilds the bot is in with retry
        const botGuilds = await discordAPI('/users/@me/guilds');
        const botGuildIds = botGuilds ? botGuilds.map(g => g.id) : [];
        
        console.log(`👤 User has access to ${user.guilds.length} servers`);
        console.log(`🤖 Bot is in ${botGuildIds.length} servers`);
        console.log(`📋 Bot server IDs:`, botGuildIds);
        console.log(`📋 User server IDs:`, user.guilds);
        
        // Process guilds with rate limit consideration
        const guildPromises = user.guilds
            .filter(guildId => botGuildIds.includes(guildId))
            .map(async (guildId, index) => {
                // Add small delay between requests to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, index * 100));
                return discordAPI(`/guilds/${guildId}?with_counts=true`);
            });
        
        const guildsData = await Promise.all(guildPromises);
        
        for (const guild of guildsData) {
            if (guild) {
                servers.push({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon 
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                        : null,
                    memberCount: guild.approximate_member_count || 0,
                    ownerId: guild.owner_id
                });
            }
        }
        
        res.json({ servers });
        
    } catch (error) {
        console.error('Get servers error:', error);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

module.exports = router;