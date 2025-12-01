const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  ticketNumber: {
    type: Number,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userTag: String,
  category: {
    type: String,
    default: 'general'
  },
  subject: String,
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  claimedBy: String, // Staff member who claimed ticket
  claimedByTag: String,
  closedBy: String,
  closedByTag: String,
  closedAt: Date,
  messages: [{
    userId: String,
    userTag: String,
    content: String,
    timestamp: Date
  }],
  transcript: String, // URL to transcript
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ticketSchema.index({ guildId: 1, status: 1 });
ticketSchema.index({ guildId: 1, userId: 1 });
ticketSchema.index({ guildId: 1, ticketNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
