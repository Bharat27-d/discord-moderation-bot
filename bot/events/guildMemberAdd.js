const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            console.log(`👋 Member joined: ${member.user.tag} in ${member.guild.name}`);
            
            if (!client.mongoConnected) {
                console.log('⚠️ MongoDB not connected, skipping welcome message');
                return;
            }
            
            const settings = await GuildSettings.findOne({ guildId: member.guild.id });
            console.log('📊 Settings found:', settings ? 'Yes' : 'No');
            
            if (!settings) {
                console.log('❌ No settings found for guild:', member.guild.id);
                return;
            }
            
            console.log('✅ Welcome enabled:', settings.welcomeMessage.enabled);
            console.log('✅ Welcome channel ID:', settings.welcomeChannel);
            
            if (!settings.welcomeMessage.enabled || !settings.welcomeChannel) {
                console.log('⚠️ Welcome message disabled or no channel set');
                return;
            }
            
            const channel = member.guild.channels.cache.get(settings.welcomeChannel);
            if (!channel) {
                console.log('❌ Welcome channel not found:', settings.welcomeChannel);
                return;
            }
            
            console.log('✅ Sending welcome message to:', channel.name);
            
            const embed = new EmbedBuilder()
                .setTitle(settings.welcomeMessage.title || 'Welcome!')
                .setDescription(
                    (settings.welcomeMessage.description || 'Welcome to the server, {user}!')
                        .replace('{user}', `<@${member.id}>`)
                        .replace('{server}', member.guild.name)
                        .replace('{memberCount}', member.guild.memberCount.toString())
                )
                .setColor(settings.welcomeMessage.color || '#00ff00')
                .setTimestamp();
            
            if (settings.welcomeMessage.thumbnail) {
                embed.setThumbnail(settings.welcomeMessage.thumbnail);
            }
            
            if (settings.welcomeMessage.image) {
                embed.setImage(settings.welcomeMessage.image);
            }
            
            if (settings.welcomeMessage.footer) {
                embed.setFooter({ text: settings.welcomeMessage. footer });
            }
            
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    }
};