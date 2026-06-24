import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import Ticket from '../../models/Ticket.js';
import { createTicket } from '../../components/tickets/createTicket.js';
import { closeTicket } from '../../components/tickets/closeTicket.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('open')
        .setDescription('Open a new ticket')
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for the ticket').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close the current ticket')
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for closing').setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a user to the ticket')
        .addUserOption(option =>
          option.setName('user').setDescription('The user to add').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a user from the ticket')
        .addUserOption(option =>
          option.setName('user').setDescription('The user to remove').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('rename')
        .setDescription('Rename the ticket channel')
        .addStringOption(option =>
          option.setName('name').setDescription('The new name').setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'open') {
      const reason = interaction.options.getString('reason');
      const fakeInteraction = {
        ...interaction,
        guildId: interaction.guildId,
        user: interaction.user,
        guild: interaction.guild,
        client: interaction.client,
        deferReply: () => interaction.deferReply({ ephemeral: true }),
        editReply: (opt) => interaction.editReply(opt),
        fields: {
          getTextInputValue: (id) => id === 'field_0' ? reason : ''
        }
      };
      
      const defaultButtonConfig = {
        _id: 'default',
        label: 'Open Ticket',
        categoryId: null,
        supportRoles: [],
        welcomeMessage: 'Welcome to your ticket.',
        modalFields: [{ label: 'Reason' }]
      };
      
      await createTicket(fakeInteraction, defaultButtonConfig, null);
    }
    else if (subcommand === 'close') {
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });
      if (!ticket) return interaction.reply({ content: 'This channel is not a valid ticket.', ephemeral: true });
      
      await closeTicket(interaction, 'default', ticket._id, false);
    }
    else if (subcommand === 'add') {
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });
      if (!ticket) return interaction.reply({ content: 'This channel is not a valid ticket.', ephemeral: true });
      
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to manage this ticket.', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
      
      if (!ticket.participants.includes(user.id)) {
        ticket.participants.push(user.id);
        await ticket.save();
      }

      await interaction.reply({ content: `Added <@${user.id}> to the ticket.` });
    }
    else if (subcommand === 'remove') {
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });
      if (!ticket) return interaction.reply({ content: 'This channel is not a valid ticket.', ephemeral: true });
      
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to manage this ticket.', ephemeral: true });
      }

      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false
      });
      
      ticket.participants = ticket.participants.filter(id => id !== user.id);
      await ticket.save();

      await interaction.reply({ content: `Removed <@${user.id}> from the ticket.` });
    }
    else if (subcommand === 'rename') {
      const ticket = await Ticket.findOne({ channelId: interaction.channelId });
      if (!ticket) return interaction.reply({ content: 'This channel is not a valid ticket.', ephemeral: true });
      
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to manage this ticket.', ephemeral: true });
      }

      const name = interaction.options.getString('name');
      await interaction.channel.setName(name);
      await interaction.reply({ content: `Ticket channel renamed to ${name}.` });
    }
  }
};
