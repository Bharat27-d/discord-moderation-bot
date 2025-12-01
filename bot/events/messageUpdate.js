const MessageLog = require('../models/MessageLog');
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

      // Save to database
      const logEntry = new MessageLog({
        guildId: newMessage.guild.id,
        messageId: newMessage.id,
        channelId: newMessage.channel.id,
        channelName: newMessage.channel.name,
        authorId: newMessage.author.id,
        authorTag: newMessage.author.tag,
        authorAvatar: newMessage.author.displayAvatarURL({ dynamic: true }),
        action: 'edited',
        oldContent: oldMessage.content || '',
        newContent: newMessage.content || '',
        timestamp: new Date()
      });

      await logEntry.save();
      console.log(`[MESSAGE UPDATE] Logged to database: ${newMessage.id}`);

      // Send to log channel if configured
      if (settings.logChannelId) {
        const logChannel = newMessage.guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setTitle('✏️ Message Edited')
            .setColor('#ffaa00')
            .setDescription(`**Author:** ${newMessage.author.tag}\n**Channel:** <#${newMessage.channel.id}>\n**Message ID:** ${newMessage.id}\n[Jump to Message](${newMessage.url})`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${newMessage.author.id}` })
            .setThumbnail(newMessage.author.displayAvatarURL({ dynamic: true }));

          if (oldMessage.content) {
            embed.addFields({ 
              name: 'Before', 
              value: oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content 
            });
          }

          if (newMessage.content) {
            embed.addFields({ 
              name: 'After', 
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
