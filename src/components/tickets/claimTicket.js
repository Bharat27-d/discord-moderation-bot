import { EmbedBuilder } from 'discord.js';
import Ticket from '../../models/Ticket.js';
import { getGuildConfig, invalidateStatsCache } from '../../utils/ticketUtils.js';

/**
 * Handle claiming a ticket.
 * @param {import('discord.js').ButtonInteraction} interaction 
 * @param {string} panelButtonId 
 * @param {string} ticketId 
 */
export async function claimTicket(interaction, panelButtonId, ticketId) {
  const guildId = interaction.guildId;
  const config = await getGuildConfig(guildId);
  
  const hasRole = config.defaultSupportRoles.some(roleId => interaction.member.roles.cache.has(roleId));
  if (!hasRole && !interaction.member.permissions.has('ManageChannels')) {
    return interaction.reply({ content: 'You do not have permission to claim this ticket.', ephemeral: true });
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return interaction.reply({ content: 'Ticket not found in database.', ephemeral: true });

  if (ticket.status === 'claimed') {
    return interaction.reply({ content: `Ticket already claimed by <@${ticket.claimedBy}>.`, ephemeral: true });
  }

  ticket.status = 'claimed';
  ticket.claimedBy = interaction.user.id;
  if (!ticket.firstResponseAt) {
    ticket.firstResponseAt = new Date();
  }
  await ticket.save();
  await invalidateStatsCache(guildId);

  try {
    await interaction.channel.setTopic(`Claimed by ${interaction.user.username}`);
  } catch(e) {}

  const embed = new EmbedBuilder()
    .setDescription(`This ticket has been claimed by <@${interaction.user.id}>.`)
    .setColor('#FEE75C');

  const message = interaction.message;
  if (message.embeds.length > 0) {
    const originalEmbed = EmbedBuilder.from(message.embeds[0]);
    originalEmbed.setFooter({ text: `Claimed by ${interaction.user.username}` });
    await interaction.update({ embeds: [originalEmbed], components: message.components });
  } else {
    await interaction.deferUpdate();
  }
  
  await interaction.channel.send({ embeds: [embed] });
}
