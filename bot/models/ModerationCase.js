const mongoose = require('mongoose');

const moderationCaseSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    caseId: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    moderatorId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['Warn', 'Mute', 'Kick', 'Ban', 'Unmute', 'Timeout', 'Auto-Spam Detection', 'Auto-Link Detection', 'Auto-Mass Ping Detection', 'Auto-Word Filter']
    },
    reason: {
        type: String,
        default: 'No reason provided'
    },
    duration: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
moderationCaseSchema.index({ guildId: 1, caseId: 1 }, { unique: true });

module.exports = mongoose.model('ModerationCase', moderationCaseSchema);
