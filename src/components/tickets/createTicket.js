import { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Ticket from '../../models/Ticket.js';
import { getGuildConfig, checkRateLimit, invalidateStatsCache, getTicketNumber } from '../../utils/ticketUtils.js';

/**
 * Handles the logic of creating a ticket channel and saving to DB.
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {Object} panelButton
 * @param {Object} panel
 */
export async function createTicket(interaction, panelButton, panel) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  const config = await getGuildConfig(guildId);
  if (!config.enabled) {
    return interaction.editReply({ content: 'Tickets are currently disabled in this server.' });
  }

  const isRateLimited = !(await checkRateLimit(userId));
  if (isRateLimited) {
    return interaction.editReply({ content: 'You are opening tickets too quickly. Please wait an hour.' });
  }

  const openTicketsCount = await Ticket.countDocuments({ guildId, userId, status: 'open' });
  if (openTicketsCount >= config.maxOpenPerUser) {
    return interaction.editReply({ content: `You can only have ${config.maxOpenPerUser} open ticket(s) at a time.` });
  }

  const ticketNumber = await getTicketNumber(guildId);
  const categoryId = panelButton.categoryId || config.defaultCategoryId;
  
  let channelName = panelButton.namingFormat || 'ticket-{username}-{number}';
  channelName = channelName
    .replace('{username}', interaction.user.username)
    .replace('{number}', ticketNumber.toString().padStart(4, '0'))
    .toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const supportRoles = panelButton.supportRoles && panelButton.supportRoles.length > 0 
    ? panelButton.supportRoles 
    : config.defaultSupportRoles;

  const permissionOverwrites = [
    {
      id: interaction.guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: userId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    },
    {
      id: interaction.client.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels],
    }
  ];

  supportRoles.forEach(roleId => {
    permissionOverwrites.push({
      id: roleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    });
  });

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryId || null,
    permissionOverwrites,
  });

  const fields = panelButton.modalFields && panelButton.modalFields.length > 0
    ? panelButton.modalFields
    : [{ label: 'Reason' }];
  
  let descriptionLines = [];
  for (let i = 0; i < fields.length; i++) {
    const answer = interaction.fields.getTextInputValue(`field_${i}`);
    descriptionLines.push(`**${fields[i].label}**\n${answer}`);
  }
  const fullDescription = descriptionLines.join('\n\n');

  const topicField = fields[0] ? interaction.fields.getTextInputValue('field_0') : 'General Support';

  const ticketDoc = new Ticket({
    guildId,
    channelId: channel.id,
    userId,
    panelId: panel ? panel._id : null,
    ticketNumber,
    topic: topicField.substring(0, 100),
    description: fullDescription,
    participants: [userId]
  });
  await ticketDoc.save();

  await invalidateStatsCache(guildId);

  const embed = new EmbedBuilder()
    .setTitle(`Ticket #${ticketNumber}`)
    .setDescription(`${panelButton.welcomeMessage || 'Welcome! Support will be with you shortly.'}\n\n${fullDescription}`)
    .setColor('#5865F2')
    .setFooter({ text: `${interaction.client.user.username} • ${new Date().toLocaleString()}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_close_${panelButton._id}_${ticketDoc._id}`)
      .setLabel('Close')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`ticket_claim_${panelButton._id}_${ticketDoc._id}`)
      .setLabel('Claim')
      .setEmoji('👋')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ content: `<@${userId}>`, embeds: [embed], components: [row] });

  await interaction.editReply({ content: `Your ticket has been created: <#${channel.id}>` });
}
