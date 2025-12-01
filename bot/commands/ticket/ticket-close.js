const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-close')
        .setDescription('Close a ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for closing the ticket')
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
        
        await interaction.deferReply();

        try {
            // Check if this is a ticket channel
            const ticket = await Ticket.findOne({
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                status: 'open'
            });

            if (!ticket) {
                await interaction.editReply({
                    content: '❌ This command can only be used in ticket channels!'
                });
                return;
            }

            const reason = interaction.options.getString('reason') || 'No reason provided';

            console.log(`[TICKET CLOSE] Closing ticket #${ticket.ticketNumber} in ${interaction.guild.name}`);

            // Create transcript
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages
                .reverse()
                .map(msg => `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}`)
                .join('\n');

            // Update ticket in database
            ticket.status = 'closed';
            ticket.closedBy = interaction.user.id;
            ticket.closedByTag = interaction.user.tag;
            ticket.closedAt = new Date();
            ticket.transcript = transcript;
            await ticket.save();

            console.log('[TICKET CLOSE] Updated ticket status in database');

            // Send closing message
            const embed = new EmbedBuilder()
                .setTitle('🔒 Ticket Closed')
                .setDescription(`This ticket has been closed by ${interaction.user.tag}`)
                .addFields({ name: 'Reason', value: reason })
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
                        .addFields(
                            { name: 'Closed by', value: interaction.user.tag, inline: true },
                            { name: 'Reason', value: reason, inline: true }
                        )
                        .setColor('#ff4444')
                        .setTimestamp();

                    await owner.send({ embeds: [dmEmbed] }).catch(() => {
                        console.log('[TICKET CLOSE] Could not DM ticket owner');
                    });
                }
            } catch (error) {
                console.log('[TICKET CLOSE] Failed to notify owner:', error.message);
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
                content: '❌ Failed to close ticket. Please try again.'
            }).catch(console.error);
        }
    }
};
