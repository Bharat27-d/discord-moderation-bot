const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const { moderationLog } = require('../../utils/logger');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g., 10m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
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
        const member = interaction.guild.members.cache.get(user.id);
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return interaction.editReply({ content: '❌ User not found in this server!' });
        }
        
        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot timeout yourself!' });
        }
        
        const durationMs = ms(duration);
        if (!durationMs || durationMs > ms('28d')) {
            return interaction.editReply({
                content: '❌ Invalid duration! Use formats like: 10m, 1h, 1d (max 28 days)'
            });
        }
        
        try {
            
            // Query MongoDB if connected
            let settings = null;
            if (interaction.client.mongoConnected) {
                try {
                    settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
                } catch (err) {
                    console.error('MongoDB error in timeout command:', err.message);
                }
            }
            
            await member.timeout(durationMs, reason);
            
            const caseId = await moderationLog(interaction.guild, {
                action: 'Timeout',
                user: user,
                moderator: interaction.user,
                reason: reason,
                duration: duration
            }, settings);
            
            await interaction.editReply({
                content: `✅ Successfully timed out ${user.tag} for ${duration} | Case #${caseId}`
            });
            
            // Try to DM the user
            try {
                await user.send(`⏰ You have been timed out in **${interaction.guild.name}** for ${duration}\nReason: ${reason}`);
            } catch (error) {
                console.log('Could not DM user');
            }
            
        } catch (error) {
            console.error('Error executing timeout command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while timing out the user.'
            });
        }
    }
};