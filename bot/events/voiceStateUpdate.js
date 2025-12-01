const VoiceLog = require('../models/VoiceLog');
const GuildSettings = require('../models/GuildSettings');

// Track voice session start times
const voiceSessions = new Map();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    try {
      if (!newState.guild) return;

      const member = newState.member;
      if (!member || member.user.bot) return;

      console.log(`[VOICE STATE] Voice state changed for ${member.user.tag} in ${newState.guild.name}`);

      // Get guild settings
      const settings = await GuildSettings.findOne({ guildId: newState.guild.id });
      if (!settings) return;

      let action = null;
      let logData = {
        guildId: newState.guild.id,
        userId: member.id,
        userTag: member.user.tag,
        userAvatar: member.user.displayAvatarURL({ dynamic: true }),
        timestamp: new Date()
      };

      // User joined a voice channel
      if (!oldState.channel && newState.channel) {
        action = 'join';
        logData.newChannelId = newState.channel.id;
        logData.newChannelName = newState.channel.name;
        logData.action = action;

        // Track session start time
        voiceSessions.set(`${newState.guild.id}-${member.id}`, Date.now());
      }
      // User left a voice channel
      else if (oldState.channel && !newState.channel) {
        action = 'leave';
        logData.oldChannelId = oldState.channel.id;
        logData.oldChannelName = oldState.channel.name;
        logData.action = action;

        // Calculate duration
        const sessionKey = `${newState.guild.id}-${member.id}`;
        const startTime = voiceSessions.get(sessionKey);
        if (startTime) {
          logData.duration = Math.floor((Date.now() - startTime) / 1000); // Duration in seconds
          voiceSessions.delete(sessionKey);
        }
      }
      // User moved channels
      else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        action = 'move';
        logData.oldChannelId = oldState.channel.id;
        logData.oldChannelName = oldState.channel.name;
        logData.newChannelId = newState.channel.id;
        logData.newChannelName = newState.channel.name;
        logData.action = action;

        // Update session tracking
        voiceSessions.set(`${newState.guild.id}-${member.id}`, Date.now());
      }
      // Server mute/unmute
      else if (oldState.serverMute !== newState.serverMute) {
        action = newState.serverMute ? 'mute' : 'unmute';
        logData.action = action;
        if (newState.channel) {
          logData.newChannelId = newState.channel.id;
          logData.newChannelName = newState.channel.name;
        }
      }
      // Server deafen/undeafen
      else if (oldState.serverDeaf !== newState.serverDeaf) {
        action = newState.serverDeaf ? 'deafen' : 'undeafen';
        logData.action = action;
        if (newState.channel) {
          logData.newChannelId = newState.channel.id;
          logData.newChannelName = newState.channel.name;
        }
      }
      // Streaming
      else if (oldState.streaming !== newState.streaming) {
        action = newState.streaming ? 'stream_start' : 'stream_stop';
        logData.action = action;
        if (newState.channel) {
          logData.newChannelId = newState.channel.id;
          logData.newChannelName = newState.channel.name;
        }
      }

      if (!action) return;

      // Save to database
      const logEntry = new VoiceLog(logData);
      await logEntry.save();
      console.log(`[VOICE STATE] Logged action "${action}" to database`);

      // Send to log channel if configured
      if (settings.logChannelId) {
        const logChannel = newState.guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          
          const actionEmojis = {
            join: '🔊',
            leave: '🔇',
            move: '↔️',
            mute: '🔇',
            unmute: '🔊',
            deafen: '🔇',
            undeafen: '🔊',
            stream_start: '📹',
            stream_stop: '📹'
          };

          const actionColors = {
            join: '#00ff00',
            leave: '#ff0000',
            move: '#ffaa00',
            mute: '#ff4444',
            unmute: '#44ff44',
            deafen: '#ff4444',
            undeafen: '#44ff44',
            stream_start: '#aa44ff',
            stream_stop: '#aa44ff'
          };

          const embed = new EmbedBuilder()
            .setTitle(`${actionEmojis[action]} Voice ${action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}`)
            .setColor(actionColors[action])
            .setDescription(`**User:** ${member.user.tag}`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.id}` })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

          if (logData.oldChannelName) {
            embed.addFields({ name: 'From', value: logData.oldChannelName, inline: true });
          }
          if (logData.newChannelName) {
            embed.addFields({ name: action === 'move' ? 'To' : 'Channel', value: logData.newChannelName, inline: true });
          }
          if (logData.duration) {
            const hours = Math.floor(logData.duration / 3600);
            const minutes = Math.floor((logData.duration % 3600) / 60);
            const seconds = logData.duration % 60;
            const durationStr = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
            embed.addFields({ name: 'Duration', value: durationStr, inline: true });
          }

          await logChannel.send({ embeds: [embed] }).catch(err => {
            console.error('[VOICE STATE] Failed to send log:', err);
          });
        }
      }
    } catch (error) {
      console.error('[VOICE STATE] Error:', error);
    }
  }
};
