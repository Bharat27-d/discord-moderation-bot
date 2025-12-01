const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Your test guild ID (get it by right-clicking your server in Discord with Developer Mode enabled)
const GUILD_ID = process.argv[2]; // Pass guild ID as argument

if (!GUILD_ID) {
    console.log('\n❌ Please provide your Guild ID as an argument!');
    console.log('📝 Usage: node deploy-guild-commands.js YOUR_GUILD_ID');
    console.log('\n💡 To get your Guild ID:');
    console.log('   1. Enable Developer Mode in Discord Settings > Advanced');
    console.log('   2. Right-click your server name');
    console.log('   3. Click "Copy Server ID"\n');
    process.exit(1);
}

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Load all commands
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded command: ${command.data.name}`);
        }
    }
}

// Deploy to specific guild (instant update)
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`\n🚀 Deploying ${commands.length} commands to guild ${GUILD_ID}...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`✅ Successfully deployed ${data.length} commands to your server!`);
        console.log('\n📝 Commands deployed:');
        data.forEach(cmd => console.log(`   /${cmd.name}`));
        console.log('\n✨ Commands are now INSTANTLY available in your server!');
        console.log('💡 Type / in Discord to see them!\n');
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
