const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const { moderationLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unmuting')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        // Defer immediately to prevent timeout
        await interaction.deferReply({ flags: 64 });
        
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return interaction.editReply({ content: '❌ User not found in this server!' });
        }
        
        if (!member.isCommunicationDisabled()) {
            return interaction.editReply({ content: '❌ This user is not muted!' });
        }
        
        try {
            
            // Query MongoDB if connected
            let settings = null;
            if (interaction.client.mongoConnected) {
                try {
                    settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
                } catch (err) {
                    console.error('MongoDB error in unmute command:', err.message);
                }
            }
            
            await member.timeout(null, reason);
            
            const caseId = await moderationLog(interaction.guild, {
                action: 'Unmute',
                user: user,
                moderator: interaction.user,
                reason: reason
            }, settings);
            
            await interaction.editReply({
                content: `✅ Successfully unmuted ${user.tag} | Case #${caseId}`,
                flags: 64
            });
            
            // Try to DM the user
            try {
                await user.send(`🔊 You have been unmuted in **${interaction.guild.name}**\nReason: ${reason}`);
            } catch (error) {
                console.log('Could not DM user');
            }
            
        } catch (error) {
            console.error('Error executing unmute command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while unmuting the user.'
            });
        }
    }
};