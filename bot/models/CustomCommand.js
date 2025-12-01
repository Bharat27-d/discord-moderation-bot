const mongoose = require('mongoose');

const customCommandSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true
  },
  trigger: {
    type: String,
    required: true
  },
  response: {
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
  allowedRoles: [String], // Role IDs that can use this command
  allowedChannels: [String], // Channel IDs where command works
  deleteCommand: Boolean, // Delete the command message after use
  cooldown: Number, // Cooldown in seconds
  uses: {
    type: Number,
    default: 0
  },
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
customCommandSchema.index({ guildId: 1, trigger: 1 });

module.exports = mongoose.model('CustomCommand', customCommandSchema);
