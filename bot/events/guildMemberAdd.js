const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const MemberLog = require('../models/MemberLog');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            console.log(`👋 Member joined: ${member.user.tag} in ${member.guild.name}`);
            
            if (!client.mongoConnected) {
                console.log('⚠️ MongoDB not connected, skipping welcome message and logging');
                return;
            }
            
            // Track member join in analytics
            if (client.analyticsCollector) {
                client.analyticsCollector.trackMemberChange(member, 'join');
            }
            
            // Log member join
            const accountCreated = member.user.createdAt;
            const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)); // Days

            const memberLogEntry = new MemberLog({
                guildId: member.guild.id,
                userId: member.id,
                userTag: member.user.tag,
                userAvatar: member.user.displayAvatarURL({ dynamic: true }),
                action: 'join',
                accountAge: accountAge,
                accountCreated: accountCreated,
                memberCount: member.guild.memberCount,
                timestamp: new Date()
            });

            await memberLogEntry.save();
            console.log('[MEMBER JOIN] Logged to database');
            
            const settings = await GuildSettings.findOne({ guildId: member.guild.id });
            console.log('📊 Settings found:', settings ? 'Yes' : 'No');
            
            if (!settings) {
                console.log('❌ No settings found for guild:', member.guild.id);
                return;
            }

            // Log to log channel if configured
            if (settings.logChannelId) {
                const logChannel = member.guild.channels.cache.get(settings.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('👋 Member Joined')
                        .setColor('#44ff44')
                        .setDescription(`**User:** ${member.user.tag}\n**ID:** ${member.id}`)
                        .addFields(
                            { name: 'Account Created', value: `<t:${Math.floor(accountCreated.getTime() / 1000)}:R>`, inline: true },
                            { name: 'Account Age', value: `${accountAge} days`, inline: true },
                            { name: 'Member Count', value: member.guild.memberCount.toString(), inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: `User ID: ${member.id}` })
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

                    // Warn about young accounts
                    if (accountAge < 7) {
                        logEmbed.addFields({ name: '⚠️ Warning', value: 'Account is less than 7 days old!' });
                    }

                    await logChannel.send({ embeds: [logEmbed] }).catch(err => {
                        console.error('[MEMBER JOIN] Failed to send log:', err);
                    });
                }
            }
            
            console.log('✅ Welcome enabled:', settings.welcomeMessage.enabled);
            console.log('✅ Welcome channel ID:', settings.welcomeChannel);
            
            if (!settings.welcomeMessage.enabled || !settings.welcomeChannel) {
                console.log('⚠️ Welcome message disabled or no channel set');
                return;
            }
            
            const channel = member.guild.channels.cache.get(settings.welcomeChannel);
            if (!channel) {
                console.log('❌ Welcome channel not found:', settings.welcomeChannel);
                return;
            }
            
            console.log('✅ Sending welcome message to:', channel.name);
            
            const embed = new EmbedBuilder()
                .setTitle(settings.welcomeMessage.title || 'Welcome!')
                .setDescription(
                    (settings.welcomeMessage.description || 'Welcome to the server, {user}!')
                        .replace('{user}', `<@${member.id}>`)
                        .replace('{server}', member.guild.name)
                        .replace('{memberCount}', member.guild.memberCount.toString())
                )
                .setColor(settings.welcomeMessage.color || '#00ff00')
                .setTimestamp();
            
            if (settings.welcomeMessage.thumbnail) {
                embed.setThumbnail(settings.welcomeMessage.thumbnail);
            }
            
            if (settings.welcomeMessage.image) {
                embed.setImage(settings.welcomeMessage.image);
            }
            
            if (settings.welcomeMessage.footer) {
                embed.setFooter({ text: settings.welcomeMessage. footer });
            }
            
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    }
};