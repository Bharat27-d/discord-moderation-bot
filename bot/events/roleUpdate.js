const GuildSettings = require('../models/GuildSettings');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roleUpdate',
  async execute(oldRole, newRole) {
    try {
      if (!newRole.guild) return;
      if (oldRole.name === newRole.name && oldRole.hexColor === newRole.hexColor) return;

      const settings = await GuildSettings.findOne({ guildId: newRole.guild.id });
      if (!settings) return;

      const targetChannelId = settings.logging?.roleLogsChannel || settings.logChannelId;
      if (!targetChannelId) return;

      const logChannel = newRole.guild.channels.cache.get(targetChannelId);
      if (!logChannel) return;

      let executor = null;
      if (newRole.guild.members.me.permissions.has('ViewAuditLog')) {
        try {
          const auditLogs = await newRole.guild.fetchAuditLogs({ type: 31, limit: 1 }); // 31 is ROLE_UPDATE
          const entry = auditLogs.entries.first();
          if (entry && entry.target.id === newRole.id && Date.now() - entry.createdTimestamp < 5000) {
            executor = entry.executor;
          }
        } catch (e) {}
      }

      const embed = new EmbedBuilder()
        .setTitle('Role Updated')
        .setColor('#ffff00')
        .setDescription(`**Role:** ${newRole} (\`${newRole.name}\`)\n**ID:** ${newRole.id}`)
        .setTimestamp()
        .setFooter({ text: `${newRole.guild.name}`, iconURL: newRole.guild.iconURL() });

      if (oldRole.name !== newRole.name) {
        embed.addFields({ name: 'Name Changed', value: `\`${oldRole.name}\` -> \`${newRole.name}\`` });
      }
      if (oldRole.hexColor !== newRole.hexColor) {
        embed.addFields({ name: 'Color Changed', value: `\`${oldRole.hexColor}\` -> \`${newRole.hexColor}\`` });
      }

      if (executor) {
        embed.addFields({ name: 'Updated By', value: `${executor.username} (${executor.id})` });
      }

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      console.error('[ROLE UPDATE] Error:', error);
    }
  }
};
