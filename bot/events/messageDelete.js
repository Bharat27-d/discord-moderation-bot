
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    try {
      // Ignore DMs
      if (!message.guild) return;
      
      // Ignore bot messages
      if (message.author?.bot) return;

      // Ignore empty messages
      if (!message.content && message.attachments.size === 0 && message.embeds.length === 0) return;

      console.log(`[MESSAGE DELETE] Message deleted in ${message.guild.name}: ${message.id}`);

      // Get guild settings
      const settings = await GuildSettings.findOne({ guildId: message.guild.id });
      if (!settings) return;

      // Send to log channel if configured
      const targetChannelId = settings.logging?.messageLogsChannel || settings.logChannelId;
      if (targetChannelId) {
        const logChannel = message.guild.channels.cache.get(targetChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setTitle('🗑️ Message Deleted')
            .setColor('#ff4444')
            .setDescription(`**Author:** ${message.author?.tag || 'Unknown'}\n**Channel:** <#${message.channel.id}>\n**Message ID:** ${message.id}`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${message.author?.id || 'Unknown'}` });

          if (message.content) {
            embed.addFields({ name: 'Content', value: message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content });
          }

          if (message.attachments.size > 0) {
            embed.addFields({ name: 'Attachments', value: message.attachments.map(att => `[${att.name}](${att.url})`).join('\n') });
          }

          if (message.author?.displayAvatarURL) {
            embed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
          }

          await logChannel.send({ embeds: [embed] }).catch(err => {
            console.error('[MESSAGE DELETE] Failed to send log:', err);
          });
        }
      }
    } catch (error) {
      console.error('[MESSAGE DELETE] Error:', error);
    }
  }
};
