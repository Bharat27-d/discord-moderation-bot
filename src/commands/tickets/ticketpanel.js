import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import TicketPanel from '../../models/TicketPanel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Deploy a quick ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let panel = await TicketPanel.findOne({ guildId: interaction.guildId, name: 'Default Panel' });
    
    if (!panel) {
      panel = new TicketPanel({
        guildId: interaction.guildId,
        name: 'Default Panel',
        embed: {
          title: 'Open a Ticket',
          description: 'Click the button below to open a ticket.',
          color: '#5865F2'
        },
        buttons: [{
          label: 'Create Ticket',
          emoji: '🎫',
          style: 'primary'
        }]
      });
      await panel.save();
    }

    const embed = new EmbedBuilder()
      .setTitle(panel.embed.title)
      .setDescription(panel.embed.description)
      .setColor(panel.embed.color);

    const row = new ActionRowBuilder();
    panel.buttons.forEach(btn => {
      const styleMap = { primary: ButtonStyle.Primary, secondary: ButtonStyle.Secondary, success: ButtonStyle.Success, danger: ButtonStyle.Danger };
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_open_${btn._id}_${panel._id}`)
          .setLabel(btn.label)
          .setEmoji(btn.emoji || '🎫')
          .setStyle(styleMap[btn.style] || ButtonStyle.Primary)
      );
    });

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
    
    panel.channelId = interaction.channelId;
    panel.messageId = msg.id;
    panel.isDeployed = true;
    panel.deployedAt = new Date();
    await panel.save();

    await interaction.editReply('Ticket panel deployed.');
  }
};
