const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config');

module.exports = (client) => {
    const commands = [];
    
    // Load moderation commands
    const moderationPath = path.join(__dirname, '../commands/moderation');
    const moderationFiles = fs.readdirSync(moderationPath).filter(file => file.endsWith('.js'));
    
    for (const file of moderationFiles) {
        const command = require(path.join(moderationPath, file));
        client.commands.set(command.data.name, command);
        commands.push(command. data.toJSON());
    }
    
    // Load utility commands
    const utilityPath = path.join(__dirname, '../commands/utility');
    if (fs.existsSync(utilityPath)) {
        const utilityFiles = fs.readdirSync(utilityPath).filter(file => file.endsWith('.js'));
        
        for (const file of utilityFiles) {
            const command = require(path.join(utilityPath, file));
            client. commands.set(command.data. name, command);
            commands. push(command.data.toJSON());
        }
    }
    
    // Register slash commands
    const rest = new REST({ version: '10' }). setToken(config.token);
    
    client.once('ready', async () => {
        try {
            console.log('🔄 Started refreshing application (/) commands.');
            
            await rest.put(
                Routes. applicationCommands(config.clientId),
                { body: commands },
            );
            
            console.log('✅ Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('❌ Error registering commands:', error);
        }
    });
};