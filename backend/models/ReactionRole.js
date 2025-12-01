const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({
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
  roles: [{
    emoji: String,
    roleId: String,
    roleName: String
  }],
  mode: {
    type: String,
    enum: ['normal', 'unique', 'verify'],
    default: 'normal'
  },
  title: String,
  description: String,
  color: String,
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

reactionRoleSchema.index({ guildId: 1, messageId: 1 });

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);
