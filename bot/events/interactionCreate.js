module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;
        
        const command = client.commands.get(interaction.commandName);
        
        if (!command) {
            console.log(`⚠️ Command not found: ${interaction.commandName}`);
            return;
        }
        
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error);
            
            // Try to respond if the interaction hasn't been replied to yet
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ An error occurred while executing this command.',
                        ephemeral: true
                    });
                } else if (interaction.deferred) {
                    await interaction.editReply({
                        content: '❌ An error occurred while executing this command.'
                    });
                }
            } catch (err) {
                console.error('Failed to send error message:', err);
            }
        }
    }
};