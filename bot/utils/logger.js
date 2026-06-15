const { EmbedBuilder } = require('discord.js');


async function moderationLog(guild, data, settings) {
    try {
        console.log(`📝 Creating moderation log for ${data.action} in ${guild.name}`);
        let caseId = Date.now() % 10000; // Default fallback
        
        // Remove database saving, just use fallback caseId
        console.log('Using fallback case ID since database logging is disabled');
        
        // Send log embed if channel is configured
        const targetChannelId = settings?.logging?.modLogsChannel || settings?.modLog;
        console.log('📢 Checking modLog channel:', targetChannelId || 'None');
        
        if (targetChannelId) {
            const channel = guild.channels.cache.get(targetChannelId);
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