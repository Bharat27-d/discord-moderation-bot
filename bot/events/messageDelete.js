const MessageLog = require('../models/MessageLog');
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

      // Save to database
      const logEntry = new MessageLog({
        guildId: message.guild.id,
        messageId: message.id,
        channelId: message.channel.id,
        channelName: message.channel.name,
        authorId: message.author?.id || 'Unknown',
        authorTag: message.author?.tag || 'Unknown',
        authorAvatar: message.author?.displayAvatarURL({ dynamic: true }),
        content: message.content || '',
        attachments: message.attachments.map(att => ({
          id: att.id,
          name: att.name,
          url: att.url,
          proxyUrl: att.proxyURL,
          size: att.size,
          contentType: att.contentType
        })),
        embeds: message.embeds.map(embed => ({
          title: embed.title,
          description: embed.description,
          url: embed.url,
          color: embed.color
        })),
        action: 'deleted',
        timestamp: new Date()
      });

      await logEntry.save();
      console.log(`[MESSAGE DELETE] Logged to database: ${message.id}`);

      // Send to log channel if configured
      if (settings.logChannelId) {
        const logChannel = message.guild.channels.cache.get(settings.logChannelId);
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
