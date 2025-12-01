const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set channel slowmode')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode duration in seconds (0-21600)')
                .setMinValue(0)
                .setMaxValue(21600)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        // Defer immediately to prevent timeout
        await interaction.deferReply({ flags: 64 });
        
        const seconds = interaction.options.getInteger('seconds');
        
        try {
            await interaction.channel.setRateLimitPerUser(seconds);
            
            if (seconds === 0) {
                await interaction.editReply({
                    content: '✅ Slowmode disabled!'
                });
            } else {
                await interaction.editReply({
                    content: `✅ Slowmode set to ${seconds} second(s)!`
                });
            }
            
        } catch (error) {
            console.error('Error executing slowmode command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while setting slowmode.'
            });
        }
    }
};