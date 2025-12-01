const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Reminder = require('../../models/Reminder');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('When to remind (e.g., "5m", "1h", "2d")')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Reminder message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Reminder type')
                .addChoices(
                    { name: 'Personal (DM)', value: 'personal' },
                    { name: 'Server (This channel)', value: 'server' }
                )
                .setRequired(false)
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

        try {
            const timeString = interaction.options.getString('time');
            const message = interaction.options.getString('message');
            const type = interaction.options.getString('type') || 'personal';

            console.log(`[REMIND] Setting reminder for ${interaction.user.tag} in ${interaction.guild.name}`);

            const delay = ms(timeString);
            if (!delay) {
                await interaction.editReply({
                    content: '❌ Invalid time format! Use formats like: 5m, 1h, 2d'
                });
                return;
            }

            if (delay < 60000) { // Less than 1 minute
                await interaction.editReply({
                    content: '❌ Reminder time must be at least 1 minute!'
                });
                return;
            }

            const remindAt = new Date(Date.now() + delay);

            // Create reminder
            const reminder = new Reminder({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                userTag: interaction.user.tag,
                channelId: interaction.channel.id,
                message: message,
                remindAt: remindAt,
                type: type
            });

            await reminder.save();
            console.log('[REMIND] Saved to database');

            await interaction.editReply({
                content: `✅ Reminder set!\n\n**When:** ${remindAt.toLocaleString()}\n**Type:** ${type}\n**Message:** ${message}`
            });

        } catch (error) {
            console.error('[REMIND] Error:', error);
            await interaction.editReply({
                content: '❌ Failed to set reminder.'
            }).catch(console.error);
        }
    }
};
