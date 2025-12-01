const { Events } = require('discord.js');
const ReactionRole = require('../models/ReactionRole');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        // Ignore bot reactions
        if (user.bot) return;

        // Fetch partial messages
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('[REACTION REMOVE] Failed to fetch reaction:', error);
                return;
            }
        }

        try {
            // Find reaction role configuration
            const reactionRole = await ReactionRole.findOne({
                guildId: reaction.message.guild.id,
                messageId: reaction.message.id
            });

            if (!reactionRole) return;

            // Find matching role
            const roleConfig = reactionRole.roles.find(r => r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.id);
            if (!roleConfig) return;

            console.log(`[REACTION REMOVE] ${user.tag} removed reaction ${reaction.emoji} for role ${roleConfig.roleName}`);

            const member = await reaction.message.guild.members.fetch(user.id);
            const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);

            if (!role) {
                console.error('[REACTION REMOVE] Role not found:', roleConfig.roleId);
                return;
            }

            // Don't remove role if mode is verify
            if (reactionRole.mode === 'verify') {
                console.log('[REACTION REMOVE] Skipping role removal (verify mode)');
                return;
            }

            // Remove role
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                console.log(`[REACTION REMOVE] Removed role ${role.name} from ${user.tag}`);
            }

        } catch (error) {
            console.error('[REACTION REMOVE] Error:', error);
        }
    }
};
