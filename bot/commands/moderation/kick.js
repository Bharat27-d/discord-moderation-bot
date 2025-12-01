const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const { moderationLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        // Defer immediately to prevent timeout
        await interaction.deferReply({ flags: 64 });
        
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        if (!member) {
            return interaction.editReply({ content: '❌ User not found in this server!' });
        }
        
        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot kick yourself!' });
        }
        
        if (!member.kickable) {
            return interaction.editReply({ content: '❌ I cannot kick this user!' });
        }
        
        try {
            console.log(`🦵 Kick command executed by ${interaction.user.tag}`);
            console.log(`   Target: ${user.tag}`);
            console.log(`   Reason: ${reason}`);
            
            // Query MongoDB if connected
            let settings = null;
            if (interaction.client.mongoConnected) {
                try {
                    settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
                } catch (err) {
                    console.error('MongoDB error in kick command:', err.message);
                }
            } else {
                console.warn('⚠️ MongoDB not connected when kick command was used');
            }
            
            // Try to DM the user before kicking
            try {
                await user.send(`👢 You have been kicked from **${interaction.guild.name}**\nReason: ${reason}`);
            } catch (error) {
                console.log('Could not DM user');
            }
            
            await member.kick(reason);
            console.log(`✅ User kicked successfully`);
            
            const caseId = await moderationLog(interaction.guild, {
                action: 'Kick',
                user: user,
                moderator: interaction.user,
                reason: reason
            }, settings);
            console.log(`📝 Kick logged with case ID: ${caseId}`);
            
            await interaction.editReply({
                content: `✅ Successfully kicked ${user.tag} | Case #${caseId}`,
                flags: 64
            });
            
        } catch (error) {
            console.error('Error executing kick command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while kicking the user.'
            });
        }
    }
};