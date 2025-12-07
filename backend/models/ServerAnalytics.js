const mongoose = require('mongoose');

const serverAnalyticsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    // Member Statistics
    memberCount: {
        total: { type: Number, default: 0 },
        online: { type: Number, default: 0 },
        bots: { type: Number, default: 0 },
        humans: { type: Number, default: 0 }
    },
    // Activity Statistics
    messages: {
        total: { type: Number, default: 0 },
        edited: { type: Number, default: 0 },
        deleted: { type: Number, default: 0 },
        byHumans: { type: Number, default: 0 },
        byBots: { type: Number, default: 0 }
    },
    // Voice Statistics
    voice: {
        joins: { type: Number, default: 0 },
        totalMinutes: { type: Number, default: 0 },
        uniqueUsers: { type: Number, default: 0 }
    },
    // Member Changes
    members: {
        joins: { type: Number, default: 0 },
        leaves: { type: Number, default: 0 },
        net: { type: Number, default: 0 }
    },
    // Moderation Actions
    moderation: {
        warns: { type: Number, default: 0 },
        mutes: { type: Number, default: 0 },
        kicks: { type: Number, default: 0 },
        bans: { type: Number, default: 0 },
        timeouts: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    // Channel Activity (top 10 channels by message count)
    topChannels: [{
        channelId: String,
        channelName: String,
        messageCount: Number
    }],
    // Active Users (top 20 by message count)
    topUsers: [{
        userId: String,
        username: String,
        messageCount: Number,
        voiceMinutes: Number
    }],
    // Role Changes
    roleChanges: {
        added: { type: Number, default: 0 },
        removed: { type: Number, default: 0 }
    },
    // Emoji Usage (top 10)
    topEmojis: [{
        emoji: String,
        count: Number
    }],
    // Commands Usage
    commandsUsed: {
        total: { type: Number, default: 0 },
        byType: [{
            command: String,
            count: Number
        }]
    },
    // Peak Activity
    peakActivity: {
        hour: Number, // 0-23
        messageCount: Number
    },
    // Engagement Metrics
    engagement: {
        activeUsers: { type: Number, default: 0 }, // Users who sent at least 1 message
        engagementRate: { type: Number, default: 0 }, // activeUsers / total members
        avgMessagesPerUser: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
serverAnalyticsSchema.index({ guildId: 1, date: -1 });

module.exports = mongoose.model('ServerAnalytics', serverAnalyticsSchema);
