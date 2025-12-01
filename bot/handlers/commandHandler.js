const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);
    
    console.log('📂 Loading commands from folders:', commandFolders.join(', '));
    
    let commandCount = 0;
    
    // Load commands from all folders
    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // Skip if not a directory
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commandCount++;
                    console.log(`✅ Loaded command: ${command.data.name} (${folder}/${file})`);
                } else {
                    console.log(`⚠️ Skipping ${folder}/${file} - missing data or execute`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${folder}/${file}:`, error.message);
            }
        }
    }
    
    console.log(`✅ Loaded ${commandCount} commands total`);
};