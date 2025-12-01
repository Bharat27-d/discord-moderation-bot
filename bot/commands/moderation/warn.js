const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const { moderationLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        // Check MongoDB connection
        if (!interaction.client.mongoConnected) {
            return await interaction.reply({
                content: '❌ Database is not connected. Please try again in a moment.',
                ephemeral: true
            });
        }
        
        // Defer immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });
        
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot warn yourself!' });
        }
        
        if (user.bot) {
            return interaction.editReply({ content: '❌ You cannot warn bots!' });
        }
        
        try {
            
            // Query MongoDB if connected
            let settings = null;
            if (interaction.client.mongoConnected) {
                try {
                    settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
                } catch (err) {
                    console.error('MongoDB error in warn command:', err.message);
                }
            }
            
            const caseId = await moderationLog(interaction.guild, {
                action: 'Warn',
                user: user,
                moderator: interaction.user,
                reason: reason
            }, settings);
            
            await interaction.editReply({
                content: `✅ Successfully warned ${user.tag} | Case #${caseId}`
            });
            
            // Try to DM the user
            try {
                await user.send(`⚠️ You have been warned in **${interaction.guild.name}**\nReason: ${reason}`);
            } catch (error) {
                console.log('Could not DM user');
            }
            
        } catch (error) {
            console.error('Error executing warn command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while warning the user.'
            });
        }
    }
};