
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    try {
      // Ignore DMs
      if (!newMessage.guild) return;
      
      // Ignore bot messages
      if (newMessage.author?.bot) return;

      // Ignore if content didn't change (embeds auto-updating, etc)
      if (oldMessage.content === newMessage.content) return;

      // Ignore partial messages that weren't cached
      if (oldMessage.partial || !oldMessage.content) return;

      console.log(`[MESSAGE UPDATE] Message edited in ${newMessage.guild.name}: ${newMessage.id}`);

      // Get guild settings
      const settings = await GuildSettings.findOne({ guildId: newMessage.guild.id });
      if (!settings) return;

      // Send to log channel if configured
      const targetChannelId = settings.logging?.messageLogsChannel || settings.logChannelId;
      if (targetChannelId) {
        const logChannel = newMessage.guild.channels.cache.get(targetChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setAuthor({ name: newMessage.author.username, iconURL: newMessage.author.displayAvatarURL({ dynamic: true }) })
            .setTitle('Message Edited Log')
            .setColor('#2b2d31') // Default dark color to match image
            .setDescription(`Message sent by <@${newMessage.author.id}> edited in <#${newMessage.channel.id}>`)
            .setTimestamp()
            .setFooter({ text: `Author ID: ${newMessage.author.id} | Message ID: ${newMessage.id}`, iconURL: newMessage.client.user.displayAvatarURL() });

          if (oldMessage.content) {
            embed.addFields({ 
              name: 'Old message:', 
              value: oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content 
            });
          }

          if (newMessage.content) {
            embed.addFields({ 
              name: 'Edited message:', 
              value: newMessage.content.length > 1024 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content 
            });
          }

          await logChannel.send({ embeds: [embed] }).catch(err => {
            console.error('[MESSAGE UPDATE] Failed to send log:', err);
          });
        }
      }
    } catch (error) {
      console.error('[MESSAGE UPDATE] Error:', error);
    }
  }
};
