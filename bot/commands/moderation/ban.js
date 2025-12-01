const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const { moderationLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete_days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        // Defer immediately to prevent timeout
        await interaction.deferReply({ flags: 64 });
        
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') || 0;
        
        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot ban yourself!' });
        }
        
        if (member && !member.bannable) {
            return interaction.editReply({ content: '❌ I cannot ban this user!' });
        }
        
        try {
            
            // Query MongoDB if connected
            let settings = null;
            if (interaction.client.mongoConnected) {
                try {
                    settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
                } catch (err) {
                    console.error('MongoDB error in ban command:', err.message);
                }
            }
            
            // Try to DM the user before banning
            try {
                await user.send(`🔨 You have been banned from **${interaction.guild.name}**\nReason: ${reason}`);
            } catch (error) {
                console.log('Could not DM user');
            }
            
            await interaction.guild.members.ban(user, {
                deleteMessageSeconds: deleteDays * 24 * 60 * 60,
                reason: reason
            });
            
            const caseId = await moderationLog(interaction.guild, {
                action: 'Ban',
                user: user,
                moderator: interaction.user,
                reason: reason
            }, settings);
            
            await interaction.editReply({
                content: `✅ Successfully banned ${user.tag} | Case #${caseId}`,
                flags: 64
            });
            
        } catch (error) {
            console.error('Error executing ban command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while banning the user.'
            });
        }
    }
};