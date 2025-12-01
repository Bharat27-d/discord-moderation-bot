const mongoose = require('mongoose');

const roleLogSchema = new mongoose.Schema({
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
  action: {
    type: String,
    enum: ['added', 'removed'],
    required: true
  },
  roleId: {
    type: String,
    required: true
  },
  roleName: String,
  roleColor: String,
  moderatorId: String,
  moderatorTag: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
roleLogSchema.index({ guildId: 1, timestamp: -1 });
roleLogSchema.index({ guildId: 1, userId: 1 });
roleLogSchema.index({ guildId: 1, roleId: 1 });

module.exports = mongoose.model('RoleLog', roleLogSchema);
