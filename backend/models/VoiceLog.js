const mongoose = require('mongoose');

const voiceLogSchema = new mongoose.Schema({
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
    enum: ['join', 'leave', 'move', 'mute', 'unmute', 'deafen', 'undeafen', 'stream_start', 'stream_stop'],
    required: true
  },
  oldChannelId: String,
  oldChannelName: String,
  newChannelId: String,
  newChannelName: String,
  duration: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  bufferCommands: false,
  autoCreate: false
});

voiceLogSchema.index({ guildId: 1, timestamp: -1 });
voiceLogSchema.index({ guildId: 1, userId: 1 });

module.exports = mongoose.model('VoiceLog', voiceLogSchema);
