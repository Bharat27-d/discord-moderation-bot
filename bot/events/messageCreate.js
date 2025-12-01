const GuildSettings = require('../models/GuildSettings');
const { moderationLog } = require('../utils/logger');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;
        if (!client.mongoConnected) return;
        
        try {
            const settings = await GuildSettings.findOne({ guildId: message.guild.id });
            if (!settings) return;
            
            const { automod } = settings;
            
            // Anti-Spam
            if (automod. antiSpam. enabled) {
                await checkSpam(message, automod. antiSpam, settings);
            }
            
            // Anti-Link
            if (automod.antiLink.enabled) {
                await checkLinks(message, automod.antiLink, settings);
            }
            
            // Anti-Mass Ping
            if (automod.antiMassPing.enabled) {
                await checkMassPing(message, automod.antiMassPing, settings);
            }
            
            // Word Filter
            if (automod.wordFilter. enabled) {
                await checkWordFilter(message, automod.wordFilter, settings);
            }
            
        } catch (error) {
            console.error('Error in messageCreate event:', error);
        }
    }
};

// Spam detection map
const spamMap = new Map();

async function checkSpam(message, config, settings) {
    const userId = message.author.id;
    const now = Date.now();
    
    if (! spamMap.has(userId)) {
        spamMap.set(userId, []);
    }
    
    const userMessages = spamMap.get(userId);
    userMessages.push(now);
    
    // Remove old messages
    const filtered = userMessages.filter(time => now - time < (config.timeWindow || 5000));
    spamMap.set(userId, filtered);
    
    if (filtered.length > (config.maxMessages || 5)) {
        try {
            await message.delete();
            await message.channel.send(`⚠️ <@${userId}> Stop spamming! `). then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
            
            await moderationLog(message.guild, {
                action: 'Auto-Spam Detection',
                user: message.author,
                moderator: message.client.user,
                reason: 'Automatic spam detection'
            }, settings);
            
            spamMap.delete(userId);
        } catch (error) {
            console.error('Error handling spam:', error);
        }
    }
}

async function checkLinks(message, config, settings) {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkRegex);
    
    if (! links) return;
    
    const whitelist = config.whitelist || [];
    const hasWhitelisted = links.some(link => 
        whitelist.some(domain => link.includes(domain))
    );
    
    if (! hasWhitelisted) {
        try {
            await message.delete();
            await message.channel.send(`⚠️ <@${message.author.id}> Links are not allowed!`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
            
            await moderationLog(message.guild, {
                action: 'Auto-Link Detection',
                user: message.author,
                moderator: message. client.user,
                reason: 'Automatic link filtering'
            }, settings);
        } catch (error) {
            console.error('Error handling link:', error);
        }
    }
}

async function checkMassPing(message, config, settings) {
    const mentions = message.mentions.users.size;
    
    if (mentions > (config.maxPings || 5)) {
        try {
            await message.delete();
            await message.channel.send(`⚠️ <@${message. author.id}> Don't mass ping!`).then(msg => {
                setTimeout(() => msg. delete(), 5000);
            });
            
            await moderationLog(message.guild, {
                action: 'Auto-Mass Ping Detection',
                user: message.author,
                moderator: message.client.user,
                reason: 'Automatic mass ping detection'
            }, settings);
        } catch (error) {
            console.error('Error handling mass ping:', error);
        }
    }
}

async function checkWordFilter(message, config, settings) {
    const words = config.words || [];
    const content = message.content.toLowerCase();
    
    const hasBlocked = words.some(word => content.includes(word. toLowerCase()));
    
    if (hasBlocked) {
        try {
            await message.delete();
            await message.channel.send(`⚠️ <@${message.author.id}> Watch your language!`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
            
            await moderationLog(message.guild, {
                action: 'Auto-Word Filter',
                user: message.author,
                moderator: message.client.user,
                reason: 'Automatic word filtering'
            }, settings);
        } catch (error) {
            console.error('Error handling word filter:', error);
        }
    }
}