const GuildSettings = require('../models/GuildSettings');

class SettingsCache {
    constructor() {
        this.cache = new Map();
        // Clear cache every 30 minutes to prevent memory leaks and ensure freshness
        setInterval(() => this.cache.clear(), 30 * 60 * 1000);
    }

    async getSettings(guildId) {
        if (this.cache.has(guildId)) {
            return this.cache.get(guildId);
        }

        try {
            const settings = await GuildSettings.findOne({ guildId });
            if (settings) {
                this.cache.set(guildId, settings);
            }
            return settings;
        } catch (error) {
            console.error(`Error fetching settings for guild ${guildId}:`, error);
            return null;
        }
    }

    invalidate(guildId) {
        this.cache.delete(guildId);
    }

    update(guildId, newSettings) {
        this.cache.set(guildId, newSettings);
    }
}

module.exports = new SettingsCache();
