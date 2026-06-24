import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import Ticket from '../../models/Ticket.js';
import { getGuildConfig, invalidateStatsCache } from '../../utils/ticketUtils.js';
import { generateTranscript } from './transcriptTicket.js';
import fs from 'fs';

/**
 * Handle closing a ticket.
 * @param {import('discord.js').ButtonInteraction} interaction 
 * @param {string} panelButtonId 
 * @param {string} ticketId 
 * @param {boolean} confirm 
 */
export async function closeTicket(interaction, panelButtonId, ticketId, confirm = false) {
  if (!confirm) {
    const embed = new EmbedBuilder()
      .setTitle('Close Ticket')
      .setDescription('Are you sure you want to close this ticket?')
      .setColor('#ED4245');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_close_confirm_${panelButtonId}_${ticketId}`)
        .setLabel('Yes, Close')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_close_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  await interaction.deferUpdate();

  const guildId = interaction.guildId;
  const config = await getGuildConfig(guildId);
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return interaction.followUp({ content: 'Ticket not found in DB.', ephemeral: true });
  }

  try {
    await interaction.channel.permissionOverwrites.edit(ticket.userId, {
      SendMessages: false,
      ViewChannel: false
    });
  } catch(e) {}

  await interaction.channel.send('Ticket is being closed. Generating transcript...');

  let transcriptUrl = null;
  if (config.transcriptsEnabled) {
    const tmpPath = await generateTranscript(interaction.channel, ticket);
    if (config.logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
      if (logChannel) {
        const attachment = new AttachmentBuilder(tmpPath, { name: `transcript-${ticket.ticketNumber}.html` });
        const logMsg = await logChannel.send({ 
          content: `Transcript for Ticket #${ticket.ticketNumber} (Closed by <@${interaction.user.id}>)`,
          files: [attachment] 
        });
        transcriptUrl = logMsg.attachments.first().url;
      }
    }
    fs.unlinkSync(tmpPath);
  }

  ticket.status = 'closed';
  ticket.closedAt = new Date();
  ticket.closedBy = interaction.user.id;
  ticket.transcriptUrl = transcriptUrl;
  await ticket.save();
  await invalidateStatsCache(guildId);

  const delay = config.autoDeleteDelay * 1000;
  await interaction.channel.send(`Channel will be deleted in ${config.autoDeleteDelay} seconds...`);
  
  setTimeout(async () => {
    try {
      await interaction.channel.delete();
    } catch(e) {}
  }, delay);
}
