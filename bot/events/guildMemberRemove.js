const MemberLog = require('../models/MemberLog');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      console.log(`[MEMBER LEAVE] ${member.user.tag} left ${member.guild.name}`);

      // Get guild settings
      const settings = await GuildSettings.findOne({ guildId: member.guild.id });
      if (!settings) return;

      // Calculate account age
      const accountCreated = member.user.createdAt;
      const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)); // Days

      // Save to database
      const logEntry = new MemberLog({
        guildId: member.guild.id,
        userId: member.id,
        userTag: member.user.tag,
        userAvatar: member.user.displayAvatarURL({ dynamic: true }),
        action: 'leave',
        accountAge: accountAge,
        accountCreated: accountCreated,
        memberCount: member.guild.memberCount,
        timestamp: new Date()
      });

      await logEntry.save();
      console.log(`[MEMBER LEAVE] Logged to database`);

      // Send to log channel if configured
      if (settings.logChannelId) {
        const logChannel = member.guild.channels.cache.get(settings.logChannelId);
        if (logChannel) {
          const { EmbedBuilder } = require('discord.js');
          const embed = new EmbedBuilder()
            .setTitle('👋 Member Left')
            .setColor('#ff4444')
            .setDescription(`**User:** ${member.user.tag}\n**ID:** ${member.id}`)
            .addFields(
              { name: 'Account Created', value: `<t:${Math.floor(accountCreated.getTime() / 1000)}:R>`, inline: true },
              { name: 'Account Age', value: `${accountAge} days`, inline: true },
              { name: 'Member Count', value: member.guild.memberCount.toString(), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.id}` })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

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
