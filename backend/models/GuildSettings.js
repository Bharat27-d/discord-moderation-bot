const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    modLog: {
        type: String,
        default: null
    },
    punishmentLog: {
        type: String,
        default: null
    },
    welcomeChannel: {
        type: String,
        default: null
    },
    leaveChannel: {
        type: String,
        default: null
    },
    muteRole: {
        type: String,
        default: null
    },
    welcomeMessage: {
        enabled: { type: Boolean, default: false },
        title: { type: String, default: 'Welcome!' },
        description: { type: String, default: 'Welcome to {server}, {user}!' },
        color: { type: String, default: '#00ff00' },
        thumbnail: { type: String, default: '' },
        image: { type: String, default: '' },
        footer: { type: String, default: '' }
    },
    leaveMessage: {
        enabled: { type: Boolean, default: false },
        title: { type: String, default: 'Goodbye!' },
        description: { type: String, default: '{user} has left the server.' },
        color: { type: String, default: '#ff0000' },
        thumbnail: { type: String, default: '' },
        image: { type: String, default: '' },
        footer: { type: String, default: '' }
    },
    automod: {
        antiSpam: {
            enabled: { type: Boolean, default: false },
            maxMessages: { type: Number, default: 5 },
            timeWindow: { type: Number, default: 5000 }
        },
        antiLink: {
            enabled: { type: Boolean, default: false },
            whitelist: { type: [String], default: [] }
        },
        antiMassPing: {
            enabled: { type: Boolean, default: false },
            maxPings: { type: Number, default: 5 }
        },
        wordFilter: {
            enabled: { type: Boolean, default: false },
            words: { type: [String], default: [] }
        },
        ghostPing: {
            enabled: { type: Boolean, default: false }
        }
    },
    punishments: {
        warnThreshold: { type: Number, default: 3 },
        actions: [{
            warnings: { type: Number, required: true },
            action: { type: String, enum: ['mute', 'kick', 'ban'], required: true },
            duration: { type: Number, default: null }
        }]
    },
    appealLink: {
        type: String,
        default: ''
    },
    logChannelId: {
        type: String,
        default: null
    },
    ticketSystem: {
        enabled: { type: Boolean, default: false },
        categoryId: { type: String, default: null },
        supportRoleId: { type: String, default: null },
        panelChannelId: { type: String, default: null }
    }
}, {
    timestamps: true,
    bufferCommands: false,
    autoCreate: false
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);