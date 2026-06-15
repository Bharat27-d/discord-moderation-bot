const GuildSettings = require('../models/GuildSettings');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roleDelete',
  async execute(role) {
    try {
      if (!role.guild) return;

      const settings = await GuildSettings.findOne({ guildId: role.guild.id });
      if (!settings) return;

      const targetChannelId = settings.logging?.roleLogsChannel || settings.logChannelId;
      if (!targetChannelId) return;

      const logChannel = role.guild.channels.cache.get(targetChannelId);
      if (!logChannel) return;

      let executor = null;
      if (role.guild.members.me.permissions.has('ViewAuditLog')) {
        try {
          const auditLogs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }); // 32 is ROLE_DELETE
          const entry = auditLogs.entries.first();
          if (entry && entry.target.id === role.id && Date.now() - entry.createdTimestamp < 5000) {
            executor = entry.executor;
          }
        } catch (e) {}
      }

      const embed = new EmbedBuilder()
        .setTitle('Role Deleted')
        .setColor('#ff0000')
        .setDescription(`**Role:** \`${role.name}\`\n**ID:** ${role.id}`)
        .setTimestamp()
        .setFooter({ text: `${role.guild.name}`, iconURL: role.guild.iconURL() });

      if (executor) {
        embed.addFields({ name: 'Deleted By', value: `${executor.username} (${executor.id})` });
      }

      await logChannel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
      console.error('[ROLE DELETE] Error:', error);
    }
  }
};
