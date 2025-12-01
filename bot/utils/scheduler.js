const Announcement = require('../models/Announcement');
const Reminder = require('../models/Reminder');
const { EmbedBuilder } = require('discord.js');

// Check every minute for pending announcements and reminders
async function startScheduler(client) {
    console.log('[SCHEDULER] Started announcement and reminder scheduler');

    setInterval(async () => {
        try {
            const now = new Date();

            // Check announcements
            const pendingAnnouncements = await Announcement.find({
                status: 'pending',
                scheduledFor: { $lte: now }
            });

            for (const announcement of pendingAnnouncements) {
                await sendAnnouncement(announcement, client);
            }

            // Check reminders
            const pendingReminders = await Reminder.find({
                status: 'pending',
                remindAt: { $lte: now }
            });

            for (const reminder of pendingReminders) {
                await sendReminder(reminder, client);
            }

        } catch (error) {
            console.error('[SCHEDULER] Error:', error);
        }
    }, 60000); // Check every minute
}

async function sendAnnouncement(announcement, client) {
    try {
        const guild = client.guilds.cache.get(announcement.guildId);
        if (!guild) {
            announcement.status = 'failed';
            await announcement.save();
            return;
        }

        const channel = guild.channels.cache.get(announcement.channelId);
        if (!channel) {
            announcement.status = 'failed';
            await announcement.save();
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(announcement.embed.title || 'Announcement')
            .setDescription(announcement.embed.description)
            .setColor(announcement.embed.color || '#00d9ff')
            .setFooter({ text: `Announced by ${announcement.createdByTag}` })
            .setTimestamp();

        let content = '';
        if (announcement.mentionEveryone) {
            content = '@everyone';
        }
        if (announcement.mentionRoles && announcement.mentionRoles.length > 0) {
            content = announcement.mentionRoles.map(roleId => `<@&${roleId}>`).join(' ');
        }

        const sentMessage = await channel.send({
            content: content || undefined,
            embeds: [embed]
        });

        announcement.status = 'sent';
        announcement.sentAt = new Date();
        announcement.sentMessageId = sentMessage.id;
        await announcement.save();

        console.log('[SCHEDULER] Sent announcement:', sentMessage.id);

    } catch (error) {
        console.error('[SCHEDULER] Failed to send announcement:', error);
        announcement.status = 'failed';
        await announcement.save();
    }
}

async function sendReminder(reminder, client) {
    try {
        const user = await client.users.fetch(reminder.userId);
        if (!user) {
            reminder.status = 'failed';
            await reminder.save();
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('⏰ Reminder!')
            .setDescription(reminder.message)
            .setColor('#00d9ff')
            .setFooter({ text: `Set on ${reminder.createdAt.toLocaleString()}` })
            .setTimestamp();

        if (reminder.type === 'personal') {
            // Send DM
            await user.send({ embeds: [embed] });
        } else {
            // Send to channel
            const guild = client.guilds.cache.get(reminder.guildId);
            if (guild) {
                const channel = guild.channels.cache.get(reminder.channelId);
                if (channel) {
                    await channel.send({
                        content: `<@${user.id}>`,
                        embeds: [embed]
                    });
                }
            }
        }

        reminder.status = 'sent';
        reminder.sentAt = new Date();
        await reminder.save();

        console.log('[SCHEDULER] Sent reminder to', user.tag);

    } catch (error) {
        console.error('[SCHEDULER] Failed to send reminder:', error);
        reminder.status = 'failed';
        await reminder.save();
    }
}

module.exports = { startScheduler };
