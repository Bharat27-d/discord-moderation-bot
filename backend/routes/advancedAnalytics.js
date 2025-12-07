const express = require('express');
const router = express.Router();
const ServerAnalytics = require('../models/ServerAnalytics');
const UserActivity = require('../models/UserActivity');
const ModerationCase = require('../models/ModerationCase');
const MessageLog = require('../models/MessageLog');
const MemberLog = require('../models/MemberLog');
const VoiceLog = require('../models/VoiceLog');
const RoleLog = require('../models/RoleLog');

// Get comprehensive analytics for a server
router.get('/:guildId/comprehensive', async (req, res) => {
    try {
        const { guildId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Parallel data fetching
        const [
            dailyAnalytics,
            moderationStats,
            memberGrowth,
            voiceStats,
            messageStats,
            topUsers,
            channelActivity,
            hourlyActivity
        ] = await Promise.all([
            // Daily analytics summary
            ServerAnalytics.find({
                guildId,
                date: { $gte: startDate }
            }).sort({ date: 1 }),

            // Moderation statistics
            getModerationStats(guildId, startDate),

            // Member growth
            getMemberGrowth(guildId, startDate),

            // Voice statistics
            getVoiceStats(guildId, startDate),

            // Message statistics
            getMessageStats(guildId, startDate),

            // Top active users
            getTopUsers(guildId, startDate, 20),

            // Channel activity
            getChannelActivity(guildId, startDate),

            // Hourly activity pattern
            getHourlyActivity(guildId, startDate)
        ]);

        // Calculate engagement metrics
        const engagement = calculateEngagementMetrics(dailyAnalytics);

        // Calculate retention
        const retention = await calculateRetention(guildId, startDate);

        // Get current server snapshot
        const currentSnapshot = await getCurrentSnapshot(guildId);

        res.json({
            timeRange: days,
            startDate,
            endDate: new Date(),
            current: currentSnapshot,
            dailyAnalytics,
            moderation: moderationStats,
            growth: memberGrowth,
            voice: voiceStats,
            messages: messageStats,
            topUsers,
            channels: channelActivity,
            hourlyActivity,
            engagement,
            retention
        });
    } catch (error) {
        console.error('Error fetching comprehensive analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get real-time server statistics
router.get('/:guildId/realtime', async (req, res) => {
    try {
        const { guildId } = req.params;
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [
            recentMessages,
            recentJoins,
            recentLeaves,
            activeVoiceUsers,
            recentModerationActions
        ] = await Promise.all([
            MessageLog.countDocuments({
                guildId,
                timestamp: { $gte: last24Hours }
            }),
            MemberLog.countDocuments({
                guildId,
                action: 'join',
                timestamp: { $gte: last24Hours }
            }),
            MemberLog.countDocuments({
                guildId,
                action: 'leave',
                timestamp: { $gte: last24Hours }
            }),
            VoiceLog.distinct('userId', {
                guildId,
                timestamp: { $gte: last24Hours }
            }),
            ModerationCase.countDocuments({
                guildId,
                timestamp: { $gte: last24Hours }
            })
        ]);

        res.json({
            last24Hours: {
                messages: recentMessages,
                joins: recentJoins,
                leaves: recentLeaves,
                activeVoice: activeVoiceUsers.length,
                moderationActions: recentModerationActions
            },
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching realtime stats:', error);
        res.status(500).json({ error: 'Failed to fetch realtime stats' });
    }
});

// Get user leaderboards
router.get('/:guildId/leaderboard', async (req, res) => {
    try {
        const { guildId } = req.params;
        const type = req.query.type || 'messages';
        const days = parseInt(req.query.days) || 30;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let leaderboard;

        switch (type) {
            case 'messages':
                leaderboard = await UserActivity.aggregate([
                    {
                        $match: {
                            guildId,
                            date: { $gte: startDate }
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            username: { $first: '$username' },
                            totalMessages: { $sum: '$messages.sent' },
                            totalWords: { $sum: '$messages.wordCount' }
                        }
                    },
                    { $sort: { totalMessages: -1 } },
                    { $limit: limit }
                ]);
                break;

            case 'voice':
                leaderboard = await UserActivity.aggregate([
                    {
                        $match: {
                            guildId,
                            date: { $gte: startDate }
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            username: { $first: '$username' },
                            totalMinutes: { $sum: '$voice.minutes' },
                            totalSessions: { $sum: '$voice.joins' }
                        }
                    },
                    { $sort: { totalMinutes: -1 } },
                    { $limit: limit }
                ]);
                break;

            case 'engagement':
                leaderboard = await UserActivity.aggregate([
                    {
                        $match: {
                            guildId,
                            date: { $gte: startDate }
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            username: { $first: '$username' },
                            avgEngagement: { $avg: '$engagementScore' },
                            totalMessages: { $sum: '$messages.sent' },
                            totalVoice: { $sum: '$voice.minutes' }
                        }
                    },
                    { $sort: { avgEngagement: -1 } },
                    { $limit: limit }
                ]);
                break;

            default:
                return res.status(400).json({ error: 'Invalid leaderboard type' });
        }

        res.json({ type, days, leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get growth predictions
router.get('/:guildId/predictions', async (req, res) => {
    try {
        const { guildId } = req.params;
        const days = 90; // Use last 90 days for prediction
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dailyData = await ServerAnalytics.find({
            guildId,
            date: { $gte: startDate }
        }).sort({ date: 1 }).select('date memberCount.total members');

        if (dailyData.length < 7) {
            return res.json({ error: 'Not enough data for predictions' });
        }

        // Simple linear regression for member count prediction
        const predictions = calculateGrowthPrediction(dailyData);

        res.json({
            historical: dailyData,
            predictions,
            confidence: predictions.confidence,
            trend: predictions.trend
        });
    } catch (error) {
        console.error('Error calculating predictions:', error);
        res.status(500).json({ error: 'Failed to calculate predictions' });
    }
});

// Get comparison data (compare time periods)
router.get('/:guildId/compare', async (req, res) => {
    try {
        const { guildId } = req.params;
        const days = parseInt(req.query.days) || 30;

        const period1End = new Date();
        const period1Start = new Date();
        period1Start.setDate(period1Start.getDate() - days);

        const period2End = new Date(period1Start);
        const period2Start = new Date(period2End);
        period2Start.setDate(period2Start.getDate() - days);

        const [currentPeriod, previousPeriod] = await Promise.all([
            getAggregatedStats(guildId, period1Start, period1End),
            getAggregatedStats(guildId, period2Start, period2End)
        ]);

        const comparison = {
            current: currentPeriod,
            previous: previousPeriod,
            changes: calculateChanges(currentPeriod, previousPeriod)
        };

        res.json(comparison);
    } catch (error) {
        console.error('Error comparing periods:', error);
        res.status(500).json({ error: 'Failed to compare periods' });
    }
});

// Helper Functions

async function getModerationStats(guildId, startDate) {
    const stats = await ModerationCase.aggregate([
        {
            $match: {
                guildId,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        }
    ]);

    const moderators = await ModerationCase.aggregate([
        {
            $match: {
                guildId,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$moderatorId',
                actions: { $sum: 1 }
            }
        },
        { $sort: { actions: -1 } },
        { $limit: 10 }
    ]);

    return { byType: stats, topModerators: moderators };
}

async function getMemberGrowth(guildId, startDate) {
    return await MemberLog.aggregate([
        {
            $match: {
                guildId,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    action: '$action'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);
}

async function getVoiceStats(guildId, startDate) {
    return await VoiceLog.aggregate([
        {
            $match: {
                guildId,
                timestamp: { $gte: startDate },
                duration: { $exists: true }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                totalMinutes: { $sum: { $divide: ['$duration', 60] } },
                sessions: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                date: '$_id',
                totalMinutes: 1,
                sessions: 1,
                uniqueUsers: { $size: '$uniqueUsers' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
}

async function getMessageStats(guildId, startDate) {
    const [sent, edited, deleted] = await Promise.all([
        MessageLog.countDocuments({
            guildId,
            timestamp: { $gte: startDate }
        }),
        MessageLog.countDocuments({
            guildId,
            action: 'edited',
            timestamp: { $gte: startDate }
        }),
        MessageLog.countDocuments({
            guildId,
            action: 'deleted',
            timestamp: { $gte: startDate }
        })
    ]);

    return { sent, edited, deleted };
}

async function getTopUsers(guildId, startDate, limit) {
    return await UserActivity.aggregate([
        {
            $match: {
                guildId,
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$userId',
                username: { $first: '$username' },
                totalMessages: { $sum: '$messages.sent' },
                totalVoice: { $sum: '$voice.minutes' },
                avgEngagement: { $avg: '$engagementScore' }
            }
        },
        { $sort: { totalMessages: -1 } },
        { $limit: limit }
    ]);
}

async function getChannelActivity(guildId, startDate) {
    return await MessageLog.aggregate([
        {
            $match: {
                guildId,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$channelId',
                channelName: { $first: '$channelName' },
                messageCount: { $sum: 1 }
            }
        },
        { $sort: { messageCount: -1 } },
        { $limit: 10 }
    ]);
}

async function getHourlyActivity(guildId, startDate) {
    return await MessageLog.aggregate([
        {
            $match: {
                guildId,
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $hour: '$timestamp' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
}

function calculateEngagementMetrics(dailyAnalytics) {
    if (!dailyAnalytics || dailyAnalytics.length === 0) {
        return { avgEngagementRate: 0, trend: 'stable' };
    }

    const rates = dailyAnalytics
        .filter(d => d.engagement && d.engagement.engagementRate)
        .map(d => d.engagement.engagementRate);

    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;

    // Calculate trend
    const recentRate = rates.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, rates.length);
    const olderRate = rates.slice(0, 7).reduce((a, b) => a + b, 0) / Math.min(7, rates.length);
    
    let trend = 'stable';
    if (recentRate > olderRate * 1.1) trend = 'increasing';
    else if (recentRate < olderRate * 0.9) trend = 'decreasing';

    return { avgEngagementRate: avgRate, trend };
}

async function calculateRetention(guildId, startDate) {
    const joins = await MemberLog.find({
        guildId,
        action: 'join',
        timestamp: { $gte: startDate }
    }).select('userId timestamp');

    const leaves = await MemberLog.find({
        guildId,
        action: 'leave',
        timestamp: { $gte: startDate }
    }).select('userId timestamp');

    const leaveMap = new Map(leaves.map(l => [l.userId, l.timestamp]));
    
    let retained = 0;
    let left = 0;

    joins.forEach(join => {
        if (leaveMap.has(join.userId)) {
            left++;
        } else {
            retained++;
        }
    });

    const retentionRate = joins.length > 0 ? (retained / joins.length) * 100 : 0;

    return {
        newMembers: joins.length,
        retained,
        left,
        retentionRate: retentionRate.toFixed(2)
    };
}

async function getCurrentSnapshot(guildId) {
    const latest = await ServerAnalytics.findOne({ guildId }).sort({ date: -1 });
    return latest || {};
}

function calculateGrowthPrediction(historicalData) {
    const n = historicalData.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = historicalData.map(d => d.memberCount?.total || 0);

    // Calculate linear regression
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 30 days
    const predictions = [];
    for (let i = 0; i < 30; i++) {
        const x = n + i;
        const predicted = Math.round(slope * x + intercept);
        predictions.push({
            day: i + 1,
            predictedMembers: Math.max(0, predicted)
        });
    }

    // Calculate confidence (R-squared)
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const ssRes = yValues.reduce((acc, y, i) => {
        const predicted = slope * xValues[i] + intercept;
        return acc + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssRes / ssTotal);

    return {
        predictions,
        confidence: (rSquared * 100).toFixed(2),
        trend: slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable',
        dailyGrowth: slope.toFixed(2)
    };
}

async function getAggregatedStats(guildId, startDate, endDate) {
    const analytics = await ServerAnalytics.find({
        guildId,
        date: { $gte: startDate, $lte: endDate }
    });

    if (analytics.length === 0) {
        return { messages: 0, joins: 0, leaves: 0, moderationActions: 0 };
    }

    return {
        messages: analytics.reduce((sum, a) => sum + (a.messages?.total || 0), 0),
        joins: analytics.reduce((sum, a) => sum + (a.members?.joins || 0), 0),
        leaves: analytics.reduce((sum, a) => sum + (a.members?.leaves || 0), 0),
        moderationActions: analytics.reduce((sum, a) => sum + (a.moderation?.total || 0), 0),
        voiceMinutes: analytics.reduce((sum, a) => sum + (a.voice?.totalMinutes || 0), 0)
    };
}

function calculateChanges(current, previous) {
    const changes = {};
    for (const key in current) {
        if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
            const change = current[key] - previous[key];
            const percentChange = previous[key] !== 0 
                ? ((change / previous[key]) * 100).toFixed(2)
                : 0;
            changes[key] = {
                absolute: change,
                percent: percentChange,
                direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
            };
        }
    }
    return changes;
}

module.exports = router;
