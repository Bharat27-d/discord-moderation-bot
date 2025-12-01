const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const Announcement = require('../../models/Announcement');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Schedule an announcement')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send announcement')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Announcement message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('When to send (e.g., "5m", "1h", "2d", or "now")')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Embed title')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName('mention-everyone')
                .setDescription('Mention @everyone?')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        // Check MongoDB connection
        if (!interaction.client.mongoConnected) {
            return await interaction.reply({
                content: '❌ Database is not connected. Please try again in a moment.',
                ephemeral: true
            });
        }
        
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');
            const timeString = interaction.options.getString('time');
            const title = interaction.options.getString('title');
            const mentionEveryone = interaction.options.getBoolean('mention-everyone') || false;

            console.log(`[ANNOUNCE] Scheduling announcement in ${interaction.guild.name}`);

            let scheduledFor;
            if (timeString.toLowerCase() === 'now') {
                scheduledFor = new Date();
            } else {
                const delay = ms(timeString);
                if (!delay) {
                    await interaction.editReply({
                        content: '❌ Invalid time format! Use formats like: 5m, 1h, 2d'
                    });
                    return;
                }
                scheduledFor = new Date(Date.now() + delay);
            }

            // Create announcement
            const announcement = new Announcement({
                guildId: interaction.guild.id,
                channelId: channel.id,
                message: message,
                embed: {
                    enabled: true,
                    title: title || 'Announcement',
                    description: message,
                    color: '#00d9ff'
                },
                scheduledFor: scheduledFor,
                mentionEveryone: mentionEveryone,
                createdBy: interaction.user.id,
                createdByTag: interaction.user.tag
            });

            await announcement.save();
            console.log('[ANNOUNCE] Saved to database');

            // If "now", send immediately
            if (timeString.toLowerCase() === 'now') {
                await sendAnnouncement(announcement, interaction.client);
            }

            await interaction.editReply({
                content: `✅ Announcement scheduled!\n\n**Channel:** ${channel}\n**When:** ${scheduledFor.toLocaleString()}\n**Message:** ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
            });

        } catch (error) {
            console.error('[ANNOUNCE] Error:', error);
            await interaction.editReply({
                content: '❌ Failed to schedule announcement.'
            }).catch(console.error);
        }
    }
};

async function sendAnnouncement(announcement, client) {
    try {
        const guild = client.guilds.cache.get(announcement.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(announcement.channelId);
        if (!channel) {
            announcement.status = 'failed';
            await announcement.save();
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(announcement.embed.title || 'Announcement')
            .setDescription(announcement.embed.description)
            .setColor(announcement.embed.color || '#00d9ff')
            .setFooter({ text: `Announced by ${announcement.createdByTag}` })
            .setTimestamp();

        let content = '';
        if (announcement.mentionEveryone) {
            content = '@everyone';
        }
        if (announcement.mentionRoles && announcement.mentionRoles.length > 0) {
            content = announcement.mentionRoles.map(roleId => `<@&${roleId}>`).join(' ');
        }

        const sentMessage = await channel.send({
            content: content || undefined,
            embeds: [embed]
        });

        announcement.status = 'sent';
        announcement.sentAt = new Date();
        announcement.sentMessageId = sentMessage.id;
        await announcement.save();

        console.log('[ANNOUNCE] Sent announcement:', sentMessage.id);

    } catch (error) {
        console.error('[ANNOUNCE] Failed to send:', error);
        announcement.status = 'failed';
        await announcement.save();
    }
}
