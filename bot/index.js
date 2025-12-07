const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const mongoose = require('mongoose');
const config = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
    ]
});

client.commands = new Collection();
client.mongoConnected = false;

// Connect to MongoDB FIRST before loading anything
async function connectMongoDB() {
    try {
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            bufferCommands: false,
        });
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        client.mongoConnected = true;
        
        // Load handlers AFTER MongoDB is connected
        require('./handlers/commandHandler')(client);
        require('./handlers/eventHandler')(client);
        
        // Start scheduler for announcements and reminders
        const { startScheduler } = require('./utils/scheduler');
        startScheduler(client);
        
        // Initialize analytics collector
        const AnalyticsCollector = require('./utils/analyticsCollector');
        const analyticsCollector = new AnalyticsCollector(client);
        await analyticsCollector.initialize();
        client.analyticsCollector = analyticsCollector;
        
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️ Retrying MongoDB connection in 5 seconds...');
        client.mongoConnected = false;
        // Retry connection after 5 seconds
        setTimeout(connectMongoDB, 5000);
    }
}

// Start MongoDB connection immediately
connectMongoDB();

// Monitor connection state
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
    client.mongoConnected = true;
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected - retrying...');
    client.mongoConnected = false;
    setTimeout(connectMongoDB, 5000);
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
    client.mongoConnected = false;
});

// Login to Discord
client.login(config.token)
    .then(() => console.log('✅ Bot logged in successfully'))
    .catch(err => console.error('❌ Bot login error:', err));

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

module.exports = client;