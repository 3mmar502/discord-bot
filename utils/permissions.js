// utils/permissions.js
const { PermissionFlagsBits } = require('discord.js');

// التسلسل الهرمي
const HIERARCHY = [
  'Owner',
  'نائب المالك',
  'المدير العام',
  'مدير الإدارة',
  'Senior Admin',
  'Security Lead',
  'Security',
  'Mod Lead',
  'Chat Moderator',
  'Voice Moderator',
  'Junior Moderator',
  'Support Lead',
  'Ticket Staff',
  'Bot Manager',
  'Developer',
  'Logs Manager',
  'Events Lead',
  'Event Host',
  'Designer',
  'Content Creator',
  'Partnership Manager',
  'Greeter',
  'VIP',
  'Member',
  'Visitor',
  'Muted',
];

function hasModPermission(member) {
  return member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    member.permissions.has(PermissionFlagsBits.BanMembers) ||
    member.permissions.has(PermissionFlagsBits.KickMembers) ||
    member.permissions.has(PermissionFlagsBits.Administrator);
}

function hasAdminPermission(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageGuild);
}

function canModerate(moderator, target) {
  if (moderator.guild.ownerId === moderator.id) return true;
  if (target.guild.ownerId === target.id) return false;
  return moderator.roles.highest.comparePositionTo(target.roles.highest) > 0;
}

module.exports = { HIERARCHY, hasModPermission, hasAdminPermission, canModerate };
