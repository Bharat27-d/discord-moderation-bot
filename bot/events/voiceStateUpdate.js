
const GuildSettings = require('../models/GuildSettings');

// Track voice session start times
const voiceSessions = new Map();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    try {
      if (!newState.guild) return;

      const member = newState.member;
      if (!member || member.user.bot) return;
      
      // Track voice state in analytics
      if (client && client.analyticsCollector) {
        client.analyticsCollector.trackVoiceStateUpdate(oldState, newState);
      }

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

      // Send to log channel if configured
      const targetChannelId = settings.logging?.voiceLogsChannel || settings.logChannelId;
      if (targetChannelId) {
        const logChannel = newState.guild.channels.cache.get(targetChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          
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
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(actionColors[action])
            .setTimestamp()
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

          let desc = '';
          if (action === 'leave') {
            desc = `📤 **Voice Channel Left**\n<@${member.id}> left the voice channel ${logData.oldChannelName}`;
          } else if (action === 'join') {
            desc = `📥 **Voice Channel Joined**\n<@${member.id}> joined the voice channel ${logData.newChannelName}`;
          } else if (action === 'move') {
            desc = `↔️ **Voice Channel Moved**\n<@${member.id}> moved from ${logData.oldChannelName} to ${logData.newChannelName}`;
          } else if (action === 'mute') {
            desc = `🔇 **Server Muted**\n<@${member.id}> was server muted`;
          } else if (action === 'unmute') {
            desc = `🔊 **Server Unmuted**\n<@${member.id}> was server unmuted`;
          } else if (action === 'deafen') {
            desc = `🔇 **Server Deafened**\n<@${member.id}> was server deafened`;
          } else if (action === 'undeafen') {
            desc = `🔊 **Server Undeafened**\n<@${member.id}> was server undeafened`;
          } else if (action === 'stream_start') {
            desc = `📹 **Stream Started**\n<@${member.id}> started streaming`;
          } else if (action === 'stream_stop') {
            desc = `📹 **Stream Stopped**\n<@${member.id}> stopped streaming`;
          }
          
          if (logData.duration && action === 'leave') {
            const hours = Math.floor(logData.duration / 3600);
            const minutes = Math.floor((logData.duration % 3600) / 60);
            const seconds = logData.duration % 60;
            const durationStr = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;
            desc += `\n**Duration:** ${durationStr}`;
          }

          embed.setDescription(desc);

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
