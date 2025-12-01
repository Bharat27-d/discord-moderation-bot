const mongoose = require('mongoose');

const memberLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  userTag: String,
  userAvatar: String,
  action: {
    type: String,
    enum: ['join', 'leave', 'nickname_change', 'username_change', 'avatar_change'],
    required: true
  },
  accountAge: Number, // Account age in days
  accountCreated: Date,
  oldValue: String, // Old nickname/username
  newValue: String, // New nickname/username
  memberCount: Number, // Server member count at time of event
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
memberLogSchema.index({ guildId: 1, timestamp: -1 });
memberLogSchema.index({ guildId: 1, userId: 1 });

module.exports = mongoose.model('MemberLog', memberLogSchema);
