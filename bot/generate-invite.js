const { PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;

// Generate bot invite URL with proper permissions
const permissions = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ViewAuditLog,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.DeafenMembers,
    PermissionFlagsBits.MoveMembers,
];

const permissionValue = permissions.reduce((a, b) => a | b, 0n);

const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${permissionValue}&scope=bot%20applications.commands`;

console.log('\n🔗 Bot Invite Link:');
console.log('='.repeat(80));
console.log(inviteUrl);
console.log('='.repeat(80));
console.log('\n⚠️  IMPORTANT: This link includes the "applications.commands" scope');
console.log('   which is REQUIRED for slash commands to work!\n');
console.log('📝 Steps:');
console.log('   1. Copy the link above');
console.log('   2. Paste it in your browser');
console.log('   3. Select your server');
console.log('   4. Click "Authorize"');
console.log('   5. Wait 1-2 minutes for commands to sync');
console.log('   6. Type "/" in Discord to see your commands!\n');
