const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const CustomCommand = require('../../models/CustomCommand');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('customcommand')
        .setDescription('Manage custom commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new custom command')
                .addStringOption(option =>
                    option
                        .setName('trigger')
                        .setDescription('Command trigger (without prefix)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('response')
                        .setDescription('Command response')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('embed')
                        .setDescription('Send as embed?')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a custom command')
                .addStringOption(option =>
                    option
                        .setName('trigger')
                        .setDescription('Command trigger to delete')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit a custom command response')
                .addStringOption(option =>
                    option
                        .setName('trigger')
                        .setDescription('Command trigger to edit')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('response')
                        .setDescription('New response')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all custom commands')
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
            } else if (subcommand === 'delete') {
                await handleDelete(interaction);
            } else if (subcommand === 'edit') {
                await handleEdit(interaction);
            } else if (subcommand === 'list') {
                await handleList(interaction);
            }
        } catch (error) {
            console.error('[CUSTOM COMMAND] Error:', error);
            await interaction.editReply({
                content: '❌ An error occurred. Please try again.'
            }).catch(console.error);
        }
    }
};

async function handleCreate(interaction) {
    const trigger = interaction.options.getString('trigger').toLowerCase();
    const response = interaction.options.getString('response');
    const useEmbed = interaction.options.getBoolean('embed') || false;

    console.log(`[CUSTOM COMMAND] Creating command "${trigger}" in ${interaction.guild.name}`);

    // Check if command already exists
    const existing = await CustomCommand.findOne({
        guildId: interaction.guild.id,
        trigger: trigger
    });

    if (existing) {
        await interaction.editReply({
            content: `❌ A custom command with trigger \`${trigger}\` already exists!`
        });
        return;
    }

    // Create command
    const command = new CustomCommand({
        guildId: interaction.guild.id,
        trigger: trigger,
        response: response,
        embed: {
            enabled: useEmbed,
            description: useEmbed ? response : ''
        },
        createdBy: interaction.user.id
    });

    await command.save();
    console.log('[CUSTOM COMMAND] Saved to database');

    await interaction.editReply({
        content: `✅ Custom command created!\n\nTrigger: \`!${trigger}\`\nResponse: ${response}\n\nUsers can now use \`!${trigger}\` to trigger this command.`
    });
}

async function handleDelete(interaction) {
    const trigger = interaction.options.getString('trigger').toLowerCase();

    console.log(`[CUSTOM COMMAND] Deleting command "${trigger}" in ${interaction.guild.name}`);

    const result = await CustomCommand.deleteOne({
        guildId: interaction.guild.id,
        trigger: trigger
    });

    if (result.deletedCount === 0) {
        await interaction.editReply({
            content: `❌ Custom command \`${trigger}\` not found!`
        });
        return;
    }

    await interaction.editReply({
        content: `✅ Custom command \`${trigger}\` has been deleted!`
    });
}

async function handleEdit(interaction) {
    const trigger = interaction.options.getString('trigger').toLowerCase();
    const newResponse = interaction.options.getString('response');

    console.log(`[CUSTOM COMMAND] Editing command "${trigger}" in ${interaction.guild.name}`);

    const command = await CustomCommand.findOne({
        guildId: interaction.guild.id,
        trigger: trigger
    });

    if (!command) {
        await interaction.editReply({
            content: `❌ Custom command \`${trigger}\` not found!`
        });
        return;
    }

    command.response = newResponse;
    if (command.embed.enabled) {
        command.embed.description = newResponse;
    }
    await command.save();

    await interaction.editReply({
        content: `✅ Custom command \`${trigger}\` has been updated!`
    });
}

async function handleList(interaction) {
    const commands = await CustomCommand.find({ guildId: interaction.guild.id });

    if (commands.length === 0) {
        await interaction.editReply({
            content: '❌ No custom commands found!'
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('📝 Custom Commands')
        .setColor('#00d9ff')
        .setDescription(`Total: ${commands.length} commands`)
        .setTimestamp();

    for (const cmd of commands.slice(0, 10)) {
        embed.addFields({
            name: `!${cmd.trigger}`,
            value: `Response: ${cmd.response.substring(0, 100)}${cmd.response.length > 100 ? '...' : ''}\nUses: ${cmd.uses}`,
            inline: false
        });
    }

    if (commands.length > 10) {
        embed.setFooter({ text: `Showing 10 of ${commands.length} commands` });
    }

    await interaction.editReply({ embeds: [embed] });
}
