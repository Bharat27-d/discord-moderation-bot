const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  messageId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  channelName: String,
  authorId: {
    type: String,
    required: true
  },
  authorTag: String,
  authorAvatar: String,
  content: String,
  attachments: [{
    id: String,
    name: String,
    url: String,
    proxyUrl: String,
    size: Number,
    contentType: String
  }],
  embeds: [{
    title: String,
    description: String,
    url: String,
    color: Number
  }],
  action: {
    type: String,
    enum: ['deleted', 'edited'],
    required: true
  },
  oldContent: String, // For edited messages
  newContent: String, // For edited messages
  deletedBy: String, // User ID who deleted (if available)
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
messageLogSchema.index({ guildId: 1, timestamp: -1 });
messageLogSchema.index({ guildId: 1, authorId: 1 });
messageLogSchema.index({ guildId: 1, channelId: 1 });

module.exports = mongoose.model('MessageLog', messageLogSchema);
