const mongoose = require('mongoose');
const ServerAnalytics = require('../../backend/models/ServerAnalytics');
const UserActivity = require('../../backend/models/UserActivity');

class AnalyticsCollector {
    constructor(client) {
        this.client = client;
        this.messageCache = new Map(); // guildId -> count
        this.userActivityCache = new Map(); // guildId-userId -> activity
        this.voiceCache = new Map(); // userId -> { start, channelId }
    }

    async initialize() {
        console.log('📊 Initializing Analytics Collector...');
        
        // Save analytics every hour
        setInterval(() => this.saveAnalytics(), 60 * 60 * 1000);
        
        // Save at midnight for daily rollup
        this.scheduleMidnightSave();
        
        console.log('✅ Analytics Collector initialized');
    }

    scheduleMidnightSave() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = midnight - now;

        setTimeout(async () => {
            await this.saveDailyAnalytics();
            // Schedule next midnight save
            setInterval(() => this.saveDailyAnalytics(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    // Track message sent
    trackMessage(message) {
        if (message.author.bot) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const key = `${guildId}-${userId}`;

        // Update message cache
        if (!this.messageCache.has(guildId)) {
            this.messageCache.set(guildId, {
                total: 0,
                byHumans: 0,
                users: new Set()
            });
        }

        const guildCache = this.messageCache.get(guildId);
        guildCache.total++;
        guildCache.byHumans++;
        guildCache.users.add(userId);

        // Update user activity cache
        if (!this.userActivityCache.has(key)) {
            this.userActivityCache.set(key, {
                guildId,
                userId,
                username: message.author.username,
                messages: { sent: 0, characterCount: 0, wordCount: 0 },
                channels: new Map()
            });
        }

        const userCache = this.userActivityCache.get(key);
        userCache.messages.sent++;
        userCache.messages.characterCount += message.content.length;
        userCache.messages.wordCount += message.content.split(/\s+/).length;

        // Track channel activity
        const channelCount = userCache.channels.get(message.channel.id) || 0;
        userCache.channels.set(message.channel.id, channelCount + 1);
    }

    // Track voice state update
    trackVoiceStateUpdate(oldState, newState) {
        const userId = newState.member.id;
        const guildId = newState.guild.id;

        // User joined voice
        if (!oldState.channelId && newState.channelId) {
            this.voiceCache.set(userId, {
                start: Date.now(),
                channelId: newState.channelId,
                guildId
            });
        }

        // User left voice
        if (oldState.channelId && !newState.channelId) {
            const voiceData = this.voiceCache.get(userId);
            if (voiceData) {
                const duration = Math.floor((Date.now() - voiceData.start) / 1000 / 60); // minutes
                this.updateUserVoiceActivity(guildId, userId, newState.member.user.username, duration);
                this.voiceCache.delete(userId);
            }
        }
    }

    updateUserVoiceActivity(guildId, userId, username, minutes) {
        const key = `${guildId}-${userId}`;

        if (!this.userActivityCache.has(key)) {
            this.userActivityCache.set(key, {
                guildId,
                userId,
                username,
                messages: { sent: 0, characterCount: 0, wordCount: 0 },
                voice: { joins: 0, minutes: 0 },
                channels: new Map()
            });
        }

        const userCache = this.userActivityCache.get(key);
        if (!userCache.voice) {
            userCache.voice = { joins: 0, minutes: 0 };
        }
        userCache.voice.joins++;
        userCache.voice.minutes += minutes;
    }

    // Track member join/leave
    trackMemberChange(member, action) {
        const guildId = member.guild.id;
        
        if (!this.messageCache.has(guildId)) {
            this.messageCache.set(guildId, {
                total: 0,
                byHumans: 0,
                users: new Set(),
                joins: 0,
                leaves: 0
            });
        }

        const guildCache = this.messageCache.get(guildId);
        if (action === 'join') {
            guildCache.joins = (guildCache.joins || 0) + 1;
        } else if (action === 'leave') {
            guildCache.leaves = (guildCache.leaves || 0) + 1;
        }
    }

    // Save analytics to database
    async saveAnalytics() {
        console.log('💾 Saving analytics to database...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Save server analytics
            for (const [guildId, data] of this.messageCache.entries()) {
                await ServerAnalytics.findOneAndUpdate(
                    { guildId, date: today },
                    {
                        $inc: {
                            'messages.total': data.total,
                            'messages.byHumans': data.byHumans,
                            'members.joins': data.joins || 0,
                            'members.leaves': data.leaves || 0
                        },
                        $set: {
                            'engagement.activeUsers': data.users.size
                        }
                    },
                    { upsert: true, new: true }
                );
            }

            // Save user activities
            for (const [key, userData] of this.userActivityCache.entries()) {
                const channelsActive = Array.from(userData.channels.entries()).map(([channelId, count]) => ({
                    channelId,
                    messageCount: count
                }));

                await UserActivity.findOneAndUpdate(
                    { guildId: userData.guildId, userId: userData.userId, date: today },
                    {
                        $inc: {
                            'messages.sent': userData.messages.sent,
                            'messages.characterCount': userData.messages.characterCount,
                            'messages.wordCount': userData.messages.wordCount,
                            'voice.joins': userData.voice?.joins || 0,
                            'voice.minutes': userData.voice?.minutes || 0
                        },
                        $set: {
                            username: userData.username,
                            channelsActive
                        }
                    },
                    { upsert: true, new: true }
                );
            }

            console.log(`✅ Analytics saved (${this.messageCache.size} guilds, ${this.userActivityCache.size} users)`);

            // Clear caches after saving
            this.messageCache.clear();
            this.userActivityCache.clear();
        } catch (error) {
            console.error('❌ Error saving analytics:', error);
        }
    }

    // Save daily analytics with full server snapshot
    async saveDailyAnalytics() {
        console.log('📊 Creating daily analytics snapshot...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const guild of this.client.guilds.cache.values()) {
                const members = await guild.members.fetch();
                const channels = guild.channels.cache;
                
                const onlineMembers = members.filter(m => m.presence?.status !== 'offline').size;
                const botCount = members.filter(m => m.user.bot).size;
                const humanCount = members.size - botCount;

                await ServerAnalytics.findOneAndUpdate(
                    { guildId: guild.id, date: today },
                    {
                        $set: {
                            'memberCount.total': members.size,
                            'memberCount.online': onlineMembers,
                            'memberCount.bots': botCount,
                            'memberCount.humans': humanCount
                        }
                    },
                    { upsert: true }
                );
            }

            console.log('✅ Daily analytics snapshot created');
        } catch (error) {
            console.error('❌ Error creating daily snapshot:', error);
        }
    }

    // Calculate engagement score for users
    calculateEngagementScore(userData) {
        const messageScore = Math.min(userData.messages.sent * 2, 100);
        const voiceScore = Math.min(userData.voice.minutes * 0.5, 100);
        const channelDiversity = Math.min(userData.channelsActive.length * 10, 50);
        
        return (messageScore + voiceScore + channelDiversity) / 2.5;
    }
}

module.exports = AnalyticsCollector;
