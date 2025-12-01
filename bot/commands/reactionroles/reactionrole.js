const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const ReactionRole = require('../../models/ReactionRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Manage reaction role messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new reaction role message')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send the message')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Title of the embed')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('description')
                        .setDescription('Description of the embed')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('mode')
                        .setDescription('Reaction role mode')
                        .addChoices(
                            { name: 'Normal (Multiple roles)', value: 'normal' },
                            { name: 'Unique (One role only)', value: 'unique' },
                            { name: 'Verification', value: 'verify' }
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a reaction role to an existing message')
                .addStringOption(option =>
                    option
                        .setName('message-id')
                        .setDescription('Message ID of the reaction role message')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Emoji to react with')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to assign')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a reaction role from a message')
                .addStringOption(option =>
                    option
                        .setName('message-id')
                        .setDescription('Message ID of the reaction role message')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Emoji to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all reaction role messages')
        ),
    
    async execute(interaction) {
        // Check MongoDB connection
        if (!interaction.client.mongoConnected) {
            return await interaction.reply({
                content: '❌ Database is not connected. Please try again in a moment.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'create') {
                await handleCreate(interaction);
            } else if (subcommand === 'add') {
                await handleAdd(interaction);
            } else if (subcommand === 'remove') {
                await handleRemove(interaction);
            } else if (subcommand === 'list') {
                await handleList(interaction);
            }
        } catch (error) {
            console.error('[REACTION ROLE] Error:', error);
            const errorMessage = error.message || 'An error occurred. Please try again.';
            await interaction.editReply({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            }).catch(console.error);
        }
    }
};

async function handleCreate(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const mode = interaction.options.getString('mode') || 'normal';

    console.log(`[REACTION ROLE] Creating reaction role message in ${interaction.guild.name}`);

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description + '\n\nReact below to get your roles!')
        .setColor('#00d9ff')
        .setFooter({ text: 'ModMatrix Reaction Roles' })
        .setTimestamp();

    const message = await channel.send({ embeds: [embed] });

    // Save to database
    const reactionRole = new ReactionRole({
        guildId: interaction.guild.id,
        messageId: message.id,
        channelId: channel.id,
        title,
        description,
        mode,
        roles: [],
        createdBy: interaction.user.id
    });

    await reactionRole.save();
    console.log('[REACTION ROLE] Saved to database');

    await interaction.editReply({
        content: `✅ Reaction role message created in ${channel}!\n\nMessage ID: \`${message.id}\`\n\nUse \`/reactionrole add\` to add reactions and roles to this message.`
    });
}

async function handleAdd(interaction) {
    const messageId = interaction.options.getString('message-id');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');

    console.log(`[REACTION ROLE] Adding ${emoji} -> ${role.name} to message ${messageId}`);

    // Find reaction role message
    const reactionRole = await ReactionRole.findOne({
        guildId: interaction.guild.id,
        messageId: messageId
    });

    if (!reactionRole) {
        await interaction.editReply({
            content: '❌ Reaction role message not found!'
        });
        return;
    }

    // Check if emoji already exists
    if (reactionRole.roles.find(r => r.emoji === emoji)) {
        await interaction.editReply({
            content: '❌ This emoji is already used for another role!'
        });
        return;
    }

    // Add role to array
    reactionRole.roles.push({
        emoji: emoji,
        roleId: role.id,
        roleName: role.name
    });

    await reactionRole.save();

    // Fetch message and add reaction
    try {
        const channel = await interaction.guild.channels.fetch(reactionRole.channelId);
        const message = await channel.messages.fetch(messageId);
        await message.react(emoji);
        console.log('[REACTION ROLE] Added reaction to message');
    } catch (error) {
        console.error('[REACTION ROLE] Failed to react:', error);
    }

    await interaction.editReply({
        content: `✅ Added ${emoji} for role ${role}!`
    });
}

async function handleRemove(interaction) {
    const messageId = interaction.options.getString('message-id');
    const emoji = interaction.options.getString('emoji');

    console.log(`[REACTION ROLE] Removing ${emoji} from message ${messageId}`);

    const reactionRole = await ReactionRole.findOne({
        guildId: interaction.guild.id,
        messageId: messageId
    });

    if (!reactionRole) {
        await interaction.editReply({
            content: '❌ Reaction role message not found!'
        });
        return;
    }

    // Remove role from array
    const index = reactionRole.roles.findIndex(r => r.emoji === emoji);
    if (index === -1) {
        await interaction.editReply({
            content: '❌ This emoji is not configured for any role!'
        });
        return;
    }

    reactionRole.roles.splice(index, 1);
    await reactionRole.save();

    // Remove reaction from message
    try {
        const channel = await interaction.guild.channels.fetch(reactionRole.channelId);
        const message = await channel.messages.fetch(messageId);
        await message.reactions.cache.get(emoji)?.remove();
        console.log('[REACTION ROLE] Removed reaction from message');
    } catch (error) {
        console.error('[REACTION ROLE] Failed to remove reaction:', error);
    }

    await interaction.editReply({
        content: `✅ Removed ${emoji} from reaction roles!`
    });
}

async function handleList(interaction) {
    const reactionRoles = await ReactionRole.find({ guildId: interaction.guild.id });

    if (reactionRoles.length === 0) {
        await interaction.editReply({
            content: '❌ No reaction role messages found!'
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('🎭 Reaction Role Messages')
        .setColor('#00d9ff')
        .setDescription('Here are all configured reaction role messages:')
        .setTimestamp();

    for (const rr of reactionRoles) {
        const rolesText = rr.roles.map(r => `${r.emoji} - ${r.roleName}`).join('\n') || 'No roles configured';
        embed.addFields({
            name: `Message ID: ${rr.messageId}`,
            value: `**Channel:** <#${rr.channelId}>\n**Mode:** ${rr.mode}\n**Roles:**\n${rolesText}`,
            inline: false
        });
    }

    await interaction.editReply({ embeds: [embed] });
}
