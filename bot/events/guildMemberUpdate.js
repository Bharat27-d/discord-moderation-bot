
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
        // Send to log channel
        const targetChannelId = settings.logging?.memberLogsChannel || settings.logChannelId;
        if (targetChannelId) {
          const logChannel = newMember.guild.channels.cache.get(targetChannelId);
          if (logChannel) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
              .setTitle('Nickname Changed')
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
      
      const fs = require('fs');
      const debugLog = `[DEBUG MEMBER UPDATE] User: ${newMember.user.tag}, oldRoles size: ${oldRoles.size}, newRoles size: ${newRoles.size}\n`;
      console.log(debugLog);
      fs.appendFileSync('debug_roles.txt', debugLog);

      // Roles added
      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id) && role.id !== newMember.guild.id);
      if (addedRoles.size > 0) {
        fs.appendFileSync('debug_roles.txt', `Added Roles detected: ${addedRoles.size}\n`);
        const targetChannelId = settings.logging?.roleLogsChannel || settings.logChannelId;
        if (targetChannelId) {
          const logChannel = newMember.guild.channels.cache.get(targetChannelId);
          if (logChannel) {
            const roleNames = addedRoles.map(role => `\`${role.name}\``).join(', ');
            const { EmbedBuilder } = require('discord.js');
            
            let executor = null;
            if (newMember.guild.members.me.permissions.has('ViewAuditLog')) {
              try {
                const auditLogs = await Promise.race([
                  newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Audit log timeout')), 2000))
                ]);
                const entry = auditLogs.entries.first();
                if (entry && (entry.target?.id === newMember.id || entry.targetId === newMember.id) && Date.now() - entry.createdTimestamp < 5000) {
                  executor = entry.executor;
                }
              } catch (e) {
                console.error('Could not fetch audit log:', e);
                fs.appendFileSync('debug_roles.txt', `Audit Log Error: ${e.message}\n`);
              }
            }

            const embed = new EmbedBuilder()
              .setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
              .setTitle('Role Added Log')
              .setColor('#0099ff')
              .setDescription(`The role(s) ${roleNames} were added to ${newMember.user.username}`)
              .setTimestamp()
              .setFooter({ text: `${newMember.guild.name}`, iconURL: newMember.guild.iconURL() });
              
            if (executor) {
              embed.addFields({ name: 'Added By', value: `${executor.username} (${executor.id})` });
            }

            await logChannel.send({ embeds: [embed] }).then(() => {
              fs.appendFileSync('debug_roles.txt', `Successfully sent to ${targetChannelId}!\n`);
            }).catch(err => {
              console.error('[MEMBER UPDATE] Failed to send role add log:', err);
              fs.appendFileSync('debug_roles.txt', `Send Embed Error (Added): ${err.message}\n`);
            });
          } else {
            fs.appendFileSync('debug_roles.txt', `Log Channel not found in cache for ID: ${targetChannelId}\n`);
          }
        } else {
           fs.appendFileSync('debug_roles.txt', `No targetChannelId configured!\n`);
        }
      }

      // Roles removed
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id) && role.id !== newMember.guild.id);
      if (removedRoles.size > 0) {
        fs.appendFileSync('debug_roles.txt', `Removed Roles detected: ${removedRoles.size}\n`);
        const targetChannelId = settings.logging?.roleLogsChannel || settings.logChannelId;
        if (targetChannelId) {
          const logChannel = newMember.guild.channels.cache.get(targetChannelId);
          if (logChannel) {
            const roleNames = removedRoles.map(role => `\`${role.name}\``).join(', ');
            const { EmbedBuilder } = require('discord.js');
            
            let executor = null;
            if (newMember.guild.members.me.permissions.has('ViewAuditLog')) {
              try {
                const auditLogs = await Promise.race([
                  newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Audit log timeout')), 2000))
                ]);
                const entry = auditLogs.entries.first();
                if (entry && (entry.target?.id === newMember.id || entry.targetId === newMember.id) && Date.now() - entry.createdTimestamp < 5000) {
                  executor = entry.executor;
                }
              } catch (e) {}
            }

            const embed = new EmbedBuilder()
              .setAuthor({ name: newMember.user.username, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
              .setTitle('Role Removed Log')
              .setColor('#ff4444')
              .setDescription(`The role(s) ${roleNames} were removed from ${newMember.user.username}`)
              .setTimestamp()
              .setFooter({ text: `${newMember.guild.name}`, iconURL: newMember.guild.iconURL() });
              
            if (executor) {
              embed.addFields({ name: 'Removed By', value: `${executor.username} (${executor.id})` });
            }

            await logChannel.send({ embeds: [embed] }).then(() => {
              fs.appendFileSync('debug_roles.txt', `Successfully sent removal log to ${targetChannelId}!\n`);
            }).catch(err => {
              console.error('[MEMBER UPDATE] Failed to send role remove log:', err);
              fs.appendFileSync('debug_roles.txt', `Send Embed Error (Removed): ${err.message}\n`);
            });
          } else {
             fs.appendFileSync('debug_roles.txt', `Log Channel not found in cache for ID: ${targetChannelId}\n`);
          }
        } else {
             fs.appendFileSync('debug_roles.txt', `No targetChannelId configured!\n`);
        }
      }
    } catch (error) {
      console.error('[MEMBER UPDATE] Error:', error);
      const fs = require('fs');
      fs.appendFileSync('debug_roles.txt', `Fatal Error: ${error.message}\n${error.stack}\n`);
    }
  }
};
