
const GuildSettings = require('../models/GuildSettings');

function formatDuration(ms) {
    if (!ms || ms < 0) return '0 seconds';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    let parts = [];
    if (days > 0) parts.push(`${days} days`);
    if (hours > 0) parts.push(`${hours} hours`);
    if (minutes > 0) parts.push(`${minutes} minutes`);
    if (seconds > 0) parts.push(`${seconds} seconds`);
    
    return parts.length > 0 ? parts.join(' ') : '0 seconds';
}

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    try {
      console.log(`[MEMBER LEAVE] ${member.user.tag} left ${member.guild.name}`);
      
      // Track member leave in analytics
      if (client && client.analyticsCollector) {
        client.analyticsCollector.trackMemberChange(member, 'leave');
      }

      // Get guild settings
      const settings = await GuildSettings.findOne({ guildId: member.guild.id });
      if (!settings) return;

      // Calculate account age and time spent
      const accountCreated = member.user.createdAt;
      const accountAgeStr = formatDuration(Date.now() - accountCreated.getTime());
      const timeSpentStr = member.joinedAt ? formatDuration(Date.now() - member.joinedAt.getTime()) : 'Unknown';

      // Send to log channel if configured
      const targetChannelId = settings.logging?.memberLogsChannel || settings.logChannelId;
      if (targetChannelId) {
        const logChannel = member.guild.channels.cache.get(targetChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${member.user.username} has left the server`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor('#ff4444')
            .addFields(
              { name: 'Account Creation Date', value: accountCreated.toUTCString(), inline: true },
              { name: 'Time Spent', value: timeSpentStr, inline: true },
              { name: 'Is Bot?', value: member.user.bot ? 'True' : 'False', inline: true },
              { name: 'Account Age', value: accountAgeStr, inline: false }
            )
            .setFooter({ text: `${client.user?.username || 'Moderation Bot'}`, iconURL: client.user?.displayAvatarURL() });

          // Add roles if they had any
          if (member.roles.cache.size > 1) { // More than @everyone
            const roles = member.roles.cache
              .filter(role => role.id !== member.guild.id)
              .map(role => role.name)
              .join(', ');
            if (roles) {
              embed.addFields({ name: 'Roles', value: roles.length > 1024 ? roles.substring(0, 1021) + '...' : roles });
            }
          }

          await logChannel.send({ embeds: [embed] }).catch(err => {
            console.error('[MEMBER LEAVE] Failed to send log:', err);
          });
        }
      }
    } catch (error) {
      console.error('[MEMBER LEAVE] Error:', error);
    }
  }
};
