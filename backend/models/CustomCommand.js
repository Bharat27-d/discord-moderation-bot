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
  allowedRoles: [String],
  allowedChannels: [String],
  deleteCommand: Boolean,
  cooldown: Number,
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
  timestamps: true,
  bufferCommands: false,
  autoCreate: false
});

customCommandSchema.index({ guildId: 1, trigger: 1 });

module.exports = mongoose.model('CustomCommand', customCommandSchema);
