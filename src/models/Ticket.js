import mongoose from 'mongoose';
const { Schema } = mongoose;

const TicketSchema = new Schema({
  guildId:          { type: String, required: true },
  channelId:        { type: String, required: true },
  userId:           { type: String, required: true },
  claimedBy:        { type: String, default: null },
  panelId:          { type: String, default: null },
  ticketNumber:     { type: Number, required: true },
  topic:            { type: String, default: '' },
  description:      { type: String, default: '' },
  status:           { type: String, enum: ['open', 'closed', 'claimed'], default: 'open' },
  participants:     [String],
  transcriptUrl:    { type: String, default: null },
  closedBy:         { type: String, default: null },
  closedReason:     { type: String, default: null },
  firstResponseAt:  { type: Date, default: null },
  createdAt:        { type: Date, default: Date.now },
  closedAt:         { type: Date, default: null },
});

TicketSchema.index({ guildId: 1, ticketNumber: 1 });
TicketSchema.index({ guildId: 1, userId: 1, status: 1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
