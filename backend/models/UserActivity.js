const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    username: String,
    discriminator: String,
    // Daily Statistics
    date: {
        type: Date,
        required: true,
        index: true
    },
    // Message Activity
    messages: {
        sent: { type: Number, default: 0 },
        edited: { type: Number, default: 0 },
        deleted: { type: Number, default: 0 },
        characterCount: { type: Number, default: 0 },
        wordCount: { type: Number, default: 0 }
    },
    // Voice Activity
    voice: {
        joins: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 },
        muted: { type: Number, default: 0 },
        deafened: { type: Number, default: 0 }
    },
    // Reactions
    reactions: {
        given: { type: Number, default: 0 },
        received: { type: Number, default: 0 }
    },
    // Mentions
    mentions: {
        users: { type: Number, default: 0 },
        roles: { type: Number, default: 0 },
        everyone: { type: Number, default: 0 }
    },
    // Channel Activity
    channelsActive: [{
        channelId: String,
        messageCount: Number
    }],
    // Engagement Score (calculated)
    engagementScore: {
        type: Number,
        default: 0
    },
    // First and Last Activity Time
    firstActivity: Date,
    lastActivity: Date
}, {
    timestamps: true
});

// Compound indexes
userActivitySchema.index({ guildId: 1, userId: 1, date: -1 });
userActivitySchema.index({ guildId: 1, date: -1, 'messages.sent': -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
