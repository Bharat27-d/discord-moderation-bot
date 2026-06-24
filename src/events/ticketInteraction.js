import TicketPanel from '../models/TicketPanel.js';
import { buildTicketModal } from '../components/tickets/ticketModal.js';
import { createTicket } from '../components/tickets/createTicket.js';
import { claimTicket } from '../components/tickets/claimTicket.js';
import { closeTicket } from '../components/tickets/closeTicket.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      const { customId } = interaction;
      
      if (customId.startsWith('ticket_open_')) {
        const parts = customId.split('_');
        const panelButtonId = parts[2];
        const panelId = parts[3];
        
        const panel = await TicketPanel.findById(panelId);
        if (!panel) return interaction.reply({ content: 'Panel not found', ephemeral: true });
        
        const buttonConfig = panel.buttons.find(b => b._id.toString() === panelButtonId);
        if (!buttonConfig) return interaction.reply({ content: 'Button config not found', ephemeral: true });
        
        const modal = buildTicketModal(buttonConfig, panelId);
        await interaction.showModal(modal);
      }
      else if (customId.startsWith('ticket_close_confirm_')) {
        const parts = customId.split('_');
        await closeTicket(interaction, parts[3], parts[4], true);
      }
      else if (customId.startsWith('ticket_close_')) {
        const parts = customId.split('_');
        await closeTicket(interaction, parts[2], parts[3], false);
      }
      else if (customId.startsWith('ticket_claim_')) {
        const parts = customId.split('_');
        await claimTicket(interaction, parts[2], parts[3]);
      }
      else if (customId === 'ticket_close_cancel') {
        try {
          await interaction.message.delete();
        } catch(e) {}
      }
    }
    else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('ticket_modal_')) {
        const panelButtonId = interaction.customId.split('_')[2];
        const panel = await TicketPanel.findOne({ 'buttons._id': panelButtonId });
        if (!panel) {
          return interaction.reply({ content: 'Panel configuration not found.', ephemeral: true });
        }
        const buttonConfig = panel.buttons.find(b => b._id.toString() === panelButtonId);
        await createTicket(interaction, buttonConfig, panel);
      }
    }
  }
};
