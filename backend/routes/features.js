const express = require('express');
const router = express.Router();
const MessageLog = require('../models/MessageLog');
const VoiceLog = require('../models/VoiceLog');
const MemberLog = require('../models/MemberLog');
const RoleLog = require('../models/RoleLog');
const Ticket = require('../models/Ticket');
const ReactionRole = require('../models/ReactionRole');
const CustomCommand = require('../models/CustomCommand');
const Announcement = require('../models/Announcement');
const Reminder = require('../models/Reminder');
const ModerationCase = require('../models/ModerationCase');

// Get message logs
router.get('/logs/messages/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { limit = 100, offset = 0, action, channelId, userId } = req.query;

        const query = { guildId };
        if (action) query.action = action;
        if (channelId) query.channelId = channelId;
        if (userId) query.authorId = userId;

        const logs = await MessageLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await MessageLog.countDocuments(query);

        res.json({ logs, total });
    } catch (error) {
        console.error('Error fetching message logs:', error);
        res.status(500).json({ error: 'Failed to fetch message logs' });
    }
});

// Get voice logs
router.get('/logs/voice/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { limit = 100, offset = 0, action, userId } = req.query;

        const query = { guildId };
        if (action) query.action = action;
        if (userId) query.userId = userId;

        const logs = await VoiceLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await VoiceLog.countDocuments(query);

        res.json({ logs, total });
    } catch (error) {
        console.error('Error fetching voice logs:', error);
        res.status(500).json({ error: 'Failed to fetch voice logs' });
    }
});

// Get member logs
router.get('/logs/members/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { limit = 100, offset = 0, action, userId } = req.query;

        const query = { guildId };
        if (action) query.action = action;
        if (userId) query.userId = userId;

        const logs = await MemberLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await MemberLog.countDocuments(query);

        res.json({ logs, total });
    } catch (error) {
        console.error('Error fetching member logs:', error);
        res.status(500).json({ error: 'Failed to fetch member logs' });
    }
});

// Get role logs
router.get('/logs/roles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { limit = 100, offset = 0, action, userId, roleId } = req.query;

        const query = { guildId };
        if (action) query.action = action;
        if (userId) query.userId = userId;
        if (roleId) query.roleId = roleId;

        const logs = await RoleLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await RoleLog.countDocuments(query);

        res.json({ logs, total });
    } catch (error) {
        console.error('Error fetching role logs:', error);
        res.status(500).json({ error: 'Failed to fetch role logs' });
    }
});

// Get analytics data
router.get('/analytics/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Moderation cases by type
        const casesByType = await ModerationCase.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$action', count: { $sum: 1 } } }
        ]);

        // Cases over time (daily)
        const casesOverTime = await ModerationCase.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top moderators
        const topModerators = await ModerationCase.aggregate([
            { $match: { guildId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$moderatorId', count: { $sum: 1 }, moderator: { $first: '$moderatorTag' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Message activity
        const messageActivity = await MessageLog.aggregate([
            { $match: { guildId, timestamp: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    deleted: { $sum: { $cond: [{ $eq: ['$action', 'deleted'] }, 1, 0] } },
                    edited: { $sum: { $cond: [{ $eq: ['$action', 'edited'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Member activity
        const memberJoins = await MemberLog.countDocuments({
            guildId,
            action: 'join',
            timestamp: { $gte: startDate }
        });

        const memberLeaves = await MemberLog.countDocuments({
            guildId,
            action: 'leave',
            timestamp: { $gte: startDate }
        });

        // Custom commands usage
        const commandsUsage = await CustomCommand.aggregate([
            { $match: { guildId } },
            { $sort: { uses: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            casesByType,
            casesOverTime,
            topModerators,
            messageActivity,
            memberStats: { joins: memberJoins, leaves: memberLeaves },
            commandsUsage
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get tickets
router.get('/tickets/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { status, userId } = req.query;

        const query = { guildId };
        if (status) query.status = status;
        if (userId) query.userId = userId;

        const tickets = await Ticket.find(query).sort({ createdAt: -1 });

        res.json({ tickets });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// Get reaction roles
router.get('/reactionroles/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;

        const reactionRoles = await ReactionRole.find({ guildId }).sort({ createdAt: -1 });

        res.json({ reactionRoles });
    } catch (error) {
        console.error('Error fetching reaction roles:', error);
        res.status(500).json({ error: 'Failed to fetch reaction roles' });
    }
});

// Get custom commands
router.get('/customcommands/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;

        const commands = await CustomCommand.find({ guildId }).sort({ uses: -1 });

        res.json({ commands });
    } catch (error) {
        console.error('Error fetching custom commands:', error);
        res.status(500).json({ error: 'Failed to fetch custom commands' });
    }
});

// Create custom command
router.post('/customcommands/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { trigger, response, embed } = req.body;

        const command = new CustomCommand({
            guildId,
            trigger,
            response,
            embed,
            createdBy: req.user?.id || 'dashboard'
        });

        await command.save();

        res.json({ success: true, command });
    } catch (error) {
        console.error('Error creating custom command:', error);
        res.status(500).json({ error: 'Failed to create custom command' });
    }
});

// Update custom command
router.put('/customcommands/:guildId/:commandId', async (req, res) => {
    try {
        const { guildId, commandId } = req.params;
        const updates = req.body;

        const command = await CustomCommand.findOneAndUpdate(
            { _id: commandId, guildId },
            updates,
            { new: true }
        );

        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }

        res.json({ success: true, command });
    } catch (error) {
        console.error('Error updating custom command:', error);
        res.status(500).json({ error: 'Failed to update custom command' });
    }
});

// Delete custom command
router.delete('/customcommands/:guildId/:commandId', async (req, res) => {
    try {
        const { guildId, commandId } = req.params;

        const result = await CustomCommand.deleteOne({ _id: commandId, guildId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Command not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting custom command:', error);
        res.status(500).json({ error: 'Failed to delete custom command' });
    }
});

// Get announcements
router.get('/announcements/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { status } = req.query;

        const query = { guildId };
        if (status) query.status = status;

        const announcements = await Announcement.find(query).sort({ scheduledFor: -1 });

        res.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Create announcement
router.post('/announcements/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { channelId, message, scheduledFor, embed } = req.body;

        const announcement = new Announcement({
            guildId,
            channelId,
            message,
            scheduledFor: new Date(scheduledFor),
            embed,
            createdBy: req.user?.id || 'dashboard',
            createdByTag: req.user?.tag || 'Dashboard'
        });

        await announcement.save();

        res.json({ success: true, announcement });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Cancel announcement
router.delete('/announcements/:guildId/:announcementId', async (req, res) => {
    try {
        const { guildId, announcementId } = req.params;

        const announcement = await Announcement.findOneAndUpdate(
            { _id: announcementId, guildId, status: 'pending' },
            { status: 'cancelled' },
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found or already sent' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error cancelling announcement:', error);
        res.status(500).json({ error: 'Failed to cancel announcement' });
    }
});

module.exports = router;
