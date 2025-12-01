const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Setup the ticket system for your server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send the ticket panel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('Category for ticket channels')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('support-role')
                .setDescription('Role that can view and manage tickets')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Title for the ticket panel embed')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Description for the ticket panel')
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
            const category = interaction.options.getChannel('category');
            const supportRole = interaction.options.getRole('support-role');
            const title = interaction.options.getString('title') || '🎫 Support Tickets';
            const description = interaction.options.getString('description') || 'Click the button below to create a support ticket. Our team will assist you shortly!';

            console.log(`[TICKET SETUP] Setting up tickets in ${interaction.guild.name}`);

            // Update guild settings
            let settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
            if (!settings) {
                settings = new GuildSettings({ guildId: interaction.guild.id });
            }

            settings.ticketSystem = {
                enabled: true,
                categoryId: category.id,
                supportRoleId: supportRole.id,
                panelChannelId: channel.id
            };

            await settings.save();
            console.log('[TICKET SETUP] Saved settings to database');

            // Create ticket panel embed
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor('#00d9ff')
                .addFields(
                    { name: '📋 How it works', value: '1. Click the "Create Ticket" button\n2. A private channel will be created\n3. Explain your issue\n4. Wait for support team response\n5. Close when resolved', inline: false }
                )
                .setFooter({ text: 'ModMatrix Ticket System' })
                .setTimestamp();

            // Create button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel('Create Ticket')
                        .setEmoji('🎫')
                        .setStyle(ButtonStyle.Primary)
                );

            // Send panel to channel
            const panelMessage = await channel.send({
                embeds: [embed],
                components: [row]
            });

            console.log('[TICKET SETUP] Panel sent to channel');

            await interaction.editReply({
                content: `✅ Ticket system has been set up!\n\n**Panel Channel:** ${channel}\n**Ticket Category:** ${category.name}\n**Support Role:** ${supportRole}\n\nUsers can now create tickets by clicking the button in ${channel}!`
            });

        } catch (error) {
            console.error('[TICKET SETUP] Error:', error);
            await interaction.editReply({
                content: '❌ Failed to setup ticket system. Please check my permissions and try again.'
            }).catch(console.error);
        }
    }
};
