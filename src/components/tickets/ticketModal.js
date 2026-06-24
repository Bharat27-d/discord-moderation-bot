import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from 'discord.js';

/**
 * Builds the modal for opening a ticket based on the panel button config.
 * @param {Object} panelButton 
 * @param {string} panelId 
 * @returns {ModalBuilder}
 */
export function buildTicketModal(panelButton, panelId) {
  const modal = new ModalBuilder()
    .setCustomId(`ticket_modal_${panelButton._id}`)
    .setTitle(`Open Ticket: ${panelButton.label.substring(0, 30)}`);

  const fields = panelButton.modalFields && panelButton.modalFields.length > 0
    ? panelButton.modalFields
    : [{ label: 'Reason', placeholder: 'Why do you need support?', style: 'paragraph', required: true }];

  fields.slice(0, 5).forEach((field, idx) => {
    const textInput = new TextInputBuilder()
      .setCustomId(`field_${idx}`)
      .setLabel(field.label.substring(0, 45))
      .setPlaceholder((field.placeholder || '').substring(0, 100))
      .setStyle(field.style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setRequired(field.required !== false);
    
    modal.addComponents(new ActionRowBuilder().addComponents(textInput));
  });

  return modal;
}
