const { Events, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const Ticket = require('../models/Ticket');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle button interactions for ticket system
        if (interaction.isButton()) {
            if (interaction.customId === 'create_ticket') {
                await handleCreateTicket(interaction);
            } else if (interaction.customId === 'close_ticket') {
                await handleCloseTicket(interaction);
            } else if (interaction.customId === 'claim_ticket') {
                await handleClaimTicket(interaction);
            }
        }
    }
};

async function handleCreateTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
        
        if (!settings || !settings.ticketSystem || !settings.ticketSystem.enabled) {
            await interaction.editReply({
                content: '❌ Ticket system is not configured for this server.',
                flags: 64
            });
            return;
        }

        // Check if user already has an open ticket
        const existingTicket = await Ticket.findOne({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            status: 'open'
        });

        if (existingTicket) {
            await interaction.editReply({
                content: `❌ You already have an open ticket: <#${existingTicket.channelId}>`,
                flags: 64
            });
            return;
        }

        console.log(`[TICKET CREATE] ${interaction.user.tag} creating ticket in ${interaction.guild.name}`);

        // Get next ticket number
        const lastTicket = await Ticket.findOne({ guildId: interaction.guild.id })
            .sort({ ticketNumber: -1 });
        const ticketNumber = (lastTicket?.ticketNumber || 0) + 1;

        // Create ticket channel
        const category = interaction.guild.channels.cache.get(settings.ticketSystem.categoryId);
        const supportRole = interaction.guild.roles.cache.get(settings.ticketSystem.supportRoleId);

        if (!category || !supportRole) {
            await interaction.editReply({
                content: '❌ Ticket system is misconfigured. Please contact an administrator.',
                flags: 64
            });
            return;
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${ticketNumber}`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: supportRole.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ]
        });

        console.log(`[TICKET CREATE] Created channel ${ticketChannel.name}`);

        // Save ticket to database
        const ticket = new Ticket({
            guildId: interaction.guild.id,
            ticketNumber: ticketNumber,
            channelId: ticketChannel.id,
            userId: interaction.user.id,
            userTag: interaction.user.tag,
            status: 'open'
        });

        await ticket.save();
        console.log('[TICKET CREATE] Saved ticket to database');

        // Send welcome message in ticket channel
        const embed = new EmbedBuilder()
            .setTitle(`🎫 Ticket #${ticketNumber}`)
            .setDescription(`Hello ${interaction.user}, welcome to your support ticket!\n\nPlease describe your issue in detail. A member of our support team will assist you shortly.`)
            .setColor('#00d9ff')
            .setFooter({ text: 'ModMatrix Ticket System' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('Claim Ticket')
                    .setEmoji('✋')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        await ticketChannel.send({
            content: `${interaction.user} | ${supportRole}`,
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply({
            content: `✅ Ticket created! Please check ${ticketChannel}`,
            flags: 64
        });

    } catch (error) {
        console.error('[TICKET CREATE] Error:', error);
        await interaction.editReply({
            content: '❌ Failed to create ticket. Please contact an administrator.',
            flags: 64
        }).catch(console.error);
    }
}

async function handleClaimTicket(interaction) {
    await interaction.deferReply();

    try {
        const ticket = await Ticket.findOne({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            status: 'open'
        });

        if (!ticket) {
            await interaction.editReply({
                content: '❌ This is not a valid ticket channel!',
                flags: 64
            });
            return;
        }

        if (ticket.claimedBy) {
            await interaction.editReply({
                content: `❌ This ticket has already been claimed by <@${ticket.claimedBy}>`,
                flags: 64
            });
            return;
        }

        ticket.claimedBy = interaction.user.id;
        ticket.claimedByTag = interaction.user.tag;
        await ticket.save();

        const embed = new EmbedBuilder()
            .setTitle('✋ Ticket Claimed')
            .setDescription(`This ticket has been claimed by ${interaction.user.tag}`)
            .setColor('#44ff44')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        console.log(`[TICKET CLAIM] Ticket #${ticket.ticketNumber} claimed by ${interaction.user.tag}`);

    } catch (error) {
        console.error('[TICKET CLAIM] Error:', error);
        await interaction.editReply({
            content: '❌ Failed to claim ticket.',
            flags: 64
        }).catch(console.error);
    }
}

async function handleCloseTicket(interaction) {
    await interaction.deferReply();

    try {
        const ticket = await Ticket.findOne({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            status: 'open'
        });

        if (!ticket) {
            await interaction.editReply({
                content: '❌ This is not a valid ticket channel!',
                flags: 64
            });
            return;
        }

        console.log(`[TICKET CLOSE] Closing ticket #${ticket.ticketNumber}`);

        // Create transcript
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages
            .reverse()
            .map(msg => `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}`)
            .join('\n');

        // Update ticket
        ticket.status = 'closed';
        ticket.closedBy = interaction.user.id;
        ticket.closedByTag = interaction.user.tag;
        ticket.closedAt = new Date();
        ticket.transcript = transcript;
        await ticket.save();

        const embed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(`This ticket has been closed by ${interaction.user.tag}`)
            .setColor('#ff4444')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Notify ticket owner
        try {
            const owner = await interaction.client.users.fetch(ticket.userId);
            if (owner) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔒 Your Ticket Has Been Closed')
                    .setDescription(`Your ticket #${ticket.ticketNumber} in **${interaction.guild.name}** has been closed.`)
                    .addFields({ name: 'Closed by', value: interaction.user.tag })
                    .setColor('#ff4444')
                    .setTimestamp();

                await owner.send({ embeds: [dmEmbed] }).catch(() => {
                    console.log('[TICKET CLOSE] Could not DM ticket owner');
                });
            }
        } catch (error) {
            console.log('[TICKET CLOSE] Failed to notify owner');
        }

        // Delete channel after 5 seconds
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
                console.log('[TICKET CLOSE] Deleted ticket channel');
            } catch (error) {
                console.error('[TICKET CLOSE] Failed to delete channel:', error);
            }
        }, 5000);

    } catch (error) {
        console.error('[TICKET CLOSE] Error:', error);
        await interaction.editReply({
            content: '❌ Failed to close ticket.',
            flags: 64
        }).catch(console.error);
    }
}
