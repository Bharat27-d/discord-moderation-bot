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
    emoji: String, // Unicode emoji or custom emoji ID
    roleId: String,
    roleName: String
  }],
  mode: {
    type: String,
    enum: ['normal', 'unique', 'verify'], // normal: multiple roles, unique: one role only, verify: verification role
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
  timestamps: true
});

// Index for faster queries
reactionRoleSchema.index({ guildId: 1, messageId: 1 });

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);
