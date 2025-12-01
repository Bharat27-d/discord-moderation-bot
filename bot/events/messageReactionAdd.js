const { Events } = require('discord.js');
const ReactionRole = require('../models/ReactionRole');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // Ignore bot reactions
        if (user.bot) return;

        // Fetch partial messages
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('[REACTION ADD] Failed to fetch reaction:', error);
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

            console.log(`[REACTION ADD] ${user.tag} reacted ${reaction.emoji} for role ${roleConfig.roleName}`);

            const member = await reaction.message.guild.members.fetch(user.id);
            const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);

            if (!role) {
                console.error('[REACTION ADD] Role not found:', roleConfig.roleId);
                return;
            }

            // Handle unique mode - remove other roles
            if (reactionRole.mode === 'unique') {
                for (const otherRole of reactionRole.roles) {
                    if (otherRole.roleId !== roleConfig.roleId) {
                        const otherRoleObj = reaction.message.guild.roles.cache.get(otherRole.roleId);
                        if (otherRoleObj && member.roles.cache.has(otherRole.roleId)) {
                            await member.roles.remove(otherRoleObj);
                            console.log(`[REACTION ADD] Removed ${otherRoleObj.name} (unique mode)`);
                        }
                    }
                }

                // Remove other reactions
                for (const [emoji, reactionObj] of reaction.message.reactions.cache) {
                    if (emoji !== reaction.emoji.toString() && emoji !== reaction.emoji.id) {
                        await reactionObj.users.remove(user.id).catch(() => {});
                    }
                }
            }

            // Add role
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                console.log(`[REACTION ADD] Added role ${role.name} to ${user.tag}`);
            }

        } catch (error) {
            console.error('[REACTION ADD] Error:', error);
        }
    }
};
