const MemberLog = require('../models/MemberLog');
const RoleLog = require('../models/RoleLog');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    try {
      if (!newMember.guild) return;
      if (newMember.user.bot) return;

      console.log(`[MEMBER UPDATE] ${newMember.user.tag} updated in ${newMember.guild.name}`);

      // Get guild settings
      const settings = await GuildSettings.findOne({ guildId: newMember.guild.id });
      if (!settings) return;

      // Check for nickname change
      if (oldMember.nickname !== newMember.nickname) {
        const logEntry = new MemberLog({
          guildId: newMember.guild.id,
          userId: newMember.id,
          userTag: newMember.user.tag,
          userAvatar: newMember.user.displayAvatarURL({ dynamic: true }),
          action: 'nickname_change',
          oldValue: oldMember.nickname || 'None',
          newValue: newMember.nickname || 'None',
          timestamp: new Date()
        });

        await logEntry.save();
        console.log(`[MEMBER UPDATE] Logged nickname change to database`);

        // Send to log channel
        if (settings.logChannelId) {
          const logChannel = newMember.guild.channels.cache.get(settings.logChannelId);
          if (logChannel) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
              .setTitle('✏️ Nickname Changed')
              .setColor('#ffaa00')
              .setDescription(`**User:** ${newMember.user.tag}`)
              .addFields(
                { name: 'Before', value: oldMember.nickname || 'None', inline: true },
                { name: 'After', value: newMember.nickname || 'None', inline: true }
              )
              .setTimestamp()
              .setFooter({ text: `User ID: ${newMember.id}` })
              .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));

            await logChannel.send({ embeds: [embed] }).catch(err => {
              console.error('[MEMBER UPDATE] Failed to send nickname log:', err);
            });
          }
        }
      }

      // Check for role changes
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      // Roles added
      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      for (const [roleId, role] of addedRoles) {
        if (roleId === newMember.guild.id) continue; // Skip @everyone

        const roleLogEntry = new RoleLog({
          guildId: newMember.guild.id,
          userId: newMember.id,
          userTag: newMember.user.tag,
          action: 'added',
          roleId: role.id,
          roleName: role.name,
          roleColor: role.hexColor,
          timestamp: new Date()
        });

        await roleLogEntry.save();
        console.log(`[MEMBER UPDATE] Logged role add to database: ${role.name}`);

        // Send to log channel
        if (settings.logChannelId) {
          const logChannel = newMember.guild.channels.cache.get(settings.logChannelId);
          if (logChannel) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
              .setTitle('➕ Role Added')
              .setColor('#44ff44')
              .setDescription(`**User:** ${newMember.user.tag}\n**Role:** ${role.name}`)
              .setTimestamp()
              .setFooter({ text: `User ID: ${newMember.id}` })
              .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));

            await logChannel.send({ embeds: [embed] }).catch(err => {
              console.error('[MEMBER UPDATE] Failed to send role add log:', err);
            });
          }
        }
      }

      // Roles removed
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
      for (const [roleId, role] of removedRoles) {
        if (roleId === newMember.guild.id) continue; // Skip @everyone

        const roleLogEntry = new RoleLog({
          guildId: newMember.guild.id,
          userId: newMember.id,
          userTag: newMember.user.tag,
          action: 'removed',
          roleId: role.id,
          roleName: role.name,
          roleColor: role.hexColor,
          timestamp: new Date()
        });

        await roleLogEntry.save();
        console.log(`[MEMBER UPDATE] Logged role remove to database: ${role.name}`);

        // Send to log channel
        if (settings.logChannelId) {
          const logChannel = newMember.guild.channels.cache.get(settings.logChannelId);
          if (logChannel) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
              .setTitle('➖ Role Removed')
              .setColor('#ff4444')
              .setDescription(`**User:** ${newMember.user.tag}\n**Role:** ${role.name}`)
              .setTimestamp()
              .setFooter({ text: `User ID: ${newMember.id}` })
              .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));

            await logChannel.send({ embeds: [embed] }).catch(err => {
              console.error('[MEMBER UPDATE] Failed to send role remove log:', err);
            });
          }
        }
      }
    } catch (error) {
      console.error('[MEMBER UPDATE] Error:', error);
    }
  }
};
