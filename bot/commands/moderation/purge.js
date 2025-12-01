const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        // Defer immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });
        
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');
        
        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
            
            let toDelete = messages;
            
            if (targetUser) {
                toDelete = messages.filter(msg => msg.author.id === targetUser.id);
            }
            
            const deleted = await interaction.channel.bulkDelete(toDelete, true);
            
            await interaction.editReply({
                content: `✅ Successfully deleted ${deleted.size} message(s)! `
            });
            
        } catch (error) {
            console.error('Error executing purge command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while deleting messages.  Note: Messages older than 14 days cannot be bulk deleted.'
            });
        }
    }
};