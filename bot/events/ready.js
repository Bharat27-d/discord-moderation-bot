const { REST, Routes, ActivityType } = require('discord.js');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers`);
        
        // Set bot activity
        client.user.setActivity('Moderating servers', { type: ActivityType.Watching });
        
        // Deploy commands to all guilds
        console.log('🚀 Deploying slash commands...');
        
        const commands = [];
        const foldersPath = path.join(__dirname, '../commands');
        const commandFolders = fs.readdirSync(foldersPath);

        // Load all commands
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            
            // Skip if not a directory
            if (!fs.statSync(commandsPath).isDirectory()) continue;
            
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                try {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    
                    if ('data' in command && 'execute' in command) {
                        commands.push(command.data.toJSON());
                    }
                } catch (error) {
                    console.error(`❌ Error loading ${folder}/${file}:`, error.message);
                }
            }
        }
        
        const rest = new REST().setToken(config.token);
        
        try {
            console.log(`📝 Loading ${commands.length} commands...`);
            
            // Deploy to all guilds for instant availability
            for (const [guildId, guild] of client.guilds.cache) {
                await rest.put(
                    Routes.applicationGuildCommands(config.clientId, guildId),
                    { body: commands },
                );
                console.log(`✅ Commands deployed to: ${guild.name}`);
            }
            
            console.log(`🎉 All commands deployed successfully!`);
        } catch (error) {
            console.error('❌ Error deploying commands:', error);
        }
    }
};