const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
  channelId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  remindAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  sentAt: Date,
  type: {
    type: String,
    enum: ['personal', 'server'],
    default: 'personal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  bufferCommands: false,
  autoCreate: false
});

reminderSchema.index({ guildId: 1, status: 1, remindAt: 1 });
reminderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
