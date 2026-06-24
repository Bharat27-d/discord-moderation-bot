import Redis from 'ioredis';
import Ticket from '../models/Ticket.js';

// Setup Redis Client
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Get ticket config for a guild.
 * @param {string} guildId 
 * @returns {Promise<Object>}
 */
export async function getGuildConfig(guildId) {
  // In a real system, you'd fetch this from a GuildSettings model.
  // We provide a fallback structure matching the prompt requirements.
  return {
    enabled: true,
    defaultCategoryId: null,
    defaultSupportRoles: [],
    logChannelId: null,
    maxOpenPerUser: 1,
    transcriptsEnabled: true,
    autoDeleteDelay: 10,
  };
}

/**
 * Rate limit check: max 3 per hour per user
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function checkRateLimit(userId) {
  const key = `ticket:ratelimit:${userId}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 3600);
  }
  return current <= 3;
}

/**
 * Invalidate Redis cache for guild stats
 * @param {string} guildId 
 */
export async function invalidateStatsCache(guildId) {
  await redis.del(`ticket:stats:${guildId}`);
}

/**
 * Get the next ticket number for a guild.
 * @param {string} guildId 
 * @returns {Promise<number>}
 */
export async function getTicketNumber(guildId) {
  const lastTicket = await Ticket.findOne({ guildId }).sort({ ticketNumber: -1 });
  return lastTicket && lastTicket.ticketNumber ? lastTicket.ticketNumber + 1 : 1;
}
