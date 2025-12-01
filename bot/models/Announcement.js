const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  channelId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  embed: {
    enabled: Boolean,
    title: String,
    description: String,
    color: String,
    thumbnail: String,
    image: String,
    footer: String
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  sentAt: Date,
  sentMessageId: String,
  createdBy: String,
  createdByTag: String,
  mentionRoles: [String], // Role IDs to mention
  mentionEveryone: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
announcementSchema.index({ guildId: 1, status: 1, scheduledFor: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
