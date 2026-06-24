import mongoose from 'mongoose';
const { Schema } = mongoose;

const PanelButtonSchema = new Schema({
  label:            { type: String, required: true },
  emoji:            { type: String, default: '🎫' },
  style:            { type: String, enum: ['primary','secondary','success','danger'], default: 'primary' },
  categoryId:       { type: String, default: null },
  supportRoles:     [String],
  namingFormat:     { type: String, default: 'ticket-{username}-{number}' },
  welcomeMessage:   { type: String, default: '' },
  modalFields: [{
    label:          String,
    placeholder:    String,
    style:          { type: String, enum: ['short', 'paragraph'], default: 'short' },
    required:       { type: Boolean, default: true },
  }],
}, { _id: true });

const TicketPanelSchema = new Schema({
  guildId:          { type: String, required: true },
  name:             { type: String, required: true },
  channelId:        { type: String, default: null },
  messageId:        { type: String, default: null },
  deployedAt:       { type: Date, default: null },
  isDeployed:       { type: Boolean, default: false },

  embed: {
    title:          { type: String, default: 'Open a Ticket' },
    description:    { type: String, default: 'Click a button below to open a support ticket.' },
    color:          { type: String, default: '#5865F2' },
    thumbnailUrl:   { type: String, default: '' },
    imageUrl:       { type: String, default: '' },
    footerText:     { type: String, default: '' },
    showTimestamp:  { type: Boolean, default: true },
  },

  buttons:          [PanelButtonSchema],
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: Date.now },
});

export default mongoose.models.TicketPanel || mongoose.model('TicketPanel', TicketPanelSchema);
