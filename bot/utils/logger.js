const { EmbedBuilder } = require('discord.js');
const ModerationCase = require('../models/ModerationCase');

async function moderationLog(guild, data, settings) {
    try {
        console.log(`📝 Creating moderation log for ${data.action} in ${guild.name}`);
        let caseId = Date.now() % 10000; // Default fallback
        
        // Try to create moderation case in database if connected
        const mongoose = require('mongoose');
        console.log('🔌 MongoDB connection state:', mongoose.connection.readyState);
        
        if (mongoose.connection.readyState === 1) {
            try {
                const lastCase = await ModerationCase.findOne({ guildId: guild.id })
                    .sort({ caseId: -1 })
                    .limit(1);
                
                caseId = lastCase ? lastCase.caseId + 1 : 1;
                console.log('✅ Case ID assigned:', caseId);
                
                const modCase = new ModerationCase({
                    guildId: guild.id,
                    caseId,
                    userId: data.user.id,
                    moderatorId: data.moderator.id,
                    action: data.action,
                    reason: data.reason || 'No reason provided',
                    duration: data.duration || null,
                    timestamp: new Date(),
                    active: true
                });
                
                await modCase.save();
                console.log('✅ Moderation case saved to database');
            } catch (dbError) {
                console.error('❌ MongoDB error in moderationLog:', dbError.message);
                // Continue with fallback caseId
            }
        } else {
            console.log('⚠️ MongoDB not connected, using fallback case ID');
        }
        
        // Send log embed if channel is configured
        console.log('📢 Checking modLog channel:', settings?.modLog || 'None');
        
        if (settings && settings.modLog) {
            const channel = guild.channels.cache.get(settings.modLog);
            console.log('📍 Found modLog channel:', channel ? channel.name : 'Not found');
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`${data.action} | Case #${caseId}`)
                    .setColor(getActionColor(data.action))
                    .addFields(
                        { name: 'User', value: `${data.user.tag} (${data.user.id})`, inline: true },
                        { name: 'Moderator', value: `${data.moderator.tag}`, inline: true },
                        { name: 'Reason', value: data.reason || 'No reason provided' }
                    )
                    .setTimestamp()
                    .setFooter({ text: `Case ${caseId}` });
                
                if (data.duration) {
                    embed.addFields({ name: 'Duration', value: data.duration, inline: true });
                }
                
                await channel.send({ embeds: [embed] });
                console.log('✅ Log embed sent successfully');
            }
        } else {
            console.log('⚠️ No modLog channel configured');
        }
        
        return caseId;
    } catch (error) {
        console.error('Error creating moderation log:', error);
        return Date.now() % 10000; // Fallback case ID
    }
}

function getActionColor(action) {
    const colors = {
        'Warn': '#ffff00',
        'Mute': '#ff9900',
        'Kick': '#ff6600',
        'Ban': '#ff0000',
        'Unmute': '#00ff00',
        'Timeout': '#ff9900'
    };
    
    return colors[action] || '#ffffff';
}

module.exports = { moderationLog };