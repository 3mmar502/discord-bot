// events/guildAuditLogEntryCreate.js
const { AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../utils/logger');
const { Colors } = require('../utils/embeds');

// Anti-Raid: تتبع الإجراءات المتسارعة
const raidTracker = new Map(); // userId -> { count, firstAction }
const RAID_THRESHOLD = 3;
const RAID_WINDOW = 10000; // 10 ثوانٍ

async function checkRaid(client, guild, executorId, action) {
  const key = `${executorId}_${guild.id}`;
  const now = Date.now();
  const tracker = raidTracker.get(key) || { count: 0, firstAction: now };

  if (now - tracker.firstAction > RAID_WINDOW) {
    tracker.count = 1;
    tracker.firstAction = now;
  } else {
    tracker.count++;
  }
  raidTracker.set(key, tracker);

  if (tracker.count >= RAID_THRESHOLD) {
    raidTracker.delete(key);
    const member = await guild.members.fetch(executorId).catch(() => null);
    if (!member || guild.ownerId === executorId) return;

    // سحب جميع الرتب
    const roles = member.roles.cache.filter(r => r.id !== guild.id && r.managed === false);
    await member.roles.remove(roles, 'Anti-Raid: نشاط مشبوه').catch(() => {});

    await sendLog(client, guild.id, 'log_security', '🚨 تنبيه RAID!', Colors.ERROR, [
      { name: '⚠️ المشتبه به', value: `${member.user.tag} (${executorId})`, inline: true },
      { name: '🔨 الإجراء', value: action, inline: true },
      { name: '📊 عدد الإجراءات', value: `${tracker.count} في 10 ثوانٍ`, inline: true },
      { name: '✅ الاستجابة', value: 'تم سحب جميع الرتب', inline: false },
    ]);
  }
}

module.exports = {
  name: 'guildAuditLogEntryCreate',
  async execute(auditLog, guild) {
    const { action, executorId, targetId, changes } = auditLog;
    const client = guild.client;

    // حذف قناة
    if (action === AuditLogEvent.ChannelDelete) {
      await checkRaid(client, guild, executorId, 'حذف قناة');
      await sendLog(client, guild.id, 'log_channels', '📛 قناة محذوفة', Colors.ERROR, [
        { name: 'المنفذ', value: `<@${executorId}>`, inline: true },
        { name: 'القناة', value: auditLog.target?.name || targetId, inline: true },
      ]);
    }

    // حذف رتبة
    if (action === AuditLogEvent.RoleDelete) {
      await checkRaid(client, guild, executorId, 'حذف رتبة');
      await sendLog(client, guild.id, 'log_roles', '🎭 رتبة محذوفة', Colors.ERROR, [
        { name: 'المنفذ', value: `<@${executorId}>`, inline: true },
        { name: 'الرتبة', value: auditLog.target?.name || targetId, inline: true },
      ]);
    }

    // تغيير صلاحيات
    if (action === AuditLogEvent.ChannelOverwriteUpdate || action === AuditLogEvent.RoleUpdate) {
      await checkRaid(client, guild, executorId, 'تغيير صلاحيات');
      await sendLog(client, guild.id, 'log_security', '🔐 تغيير صلاحيات', Colors.WARNING, [
        { name: 'المنفذ', value: `<@${executorId}>`, inline: true },
        { name: 'الهدف', value: String(targetId), inline: true },
      ]);
    }

    // حظر عضو
    if (action === AuditLogEvent.MemberBanAdd) {
      await sendLog(client, guild.id, 'log_ban', '🔨 حظر عضو (AuditLog)', Colors.ERROR, [
        { name: 'العضو', value: `<@${targetId}>`, inline: true },
        { name: 'المشرف', value: `<@${executorId}>`, inline: true },
        { name: 'السبب', value: auditLog.reason || 'لم يُذكر سبب' },
      ]);
    }

    // طرد عضو
    if (action === AuditLogEvent.MemberKick) {
      await sendLog(client, guild.id, 'log_kick', '👢 طرد عضو (AuditLog)', Colors.WARNING, [
        { name: 'العضو', value: `<@${targetId}>`, inline: true },
        { name: 'المشرف', value: `<@${executorId}>`, inline: true },
        { name: 'السبب', value: auditLog.reason || 'لم يُذكر سبب' },
      ]);
    }

    // تغيير رتبة عضو
    if (action === AuditLogEvent.MemberRoleUpdate) {
      const added = changes?.find(c => c.key === '$add')?.new || [];
      const removed = changes?.find(c => c.key === '$remove')?.new || [];
      if (added.length || removed.length) {
        await sendLog(client, guild.id, 'log_roles', '🎭 تغيير رتبة عضو', Colors.INFO, [
          { name: 'العضو', value: `<@${targetId}>`, inline: true },
          { name: 'المنفذ', value: `<@${executorId}>`, inline: true },
          { name: '➕ أُضيف', value: added.map(r => r.name).join(', ') || '—', inline: true },
          { name: '➖ أُزيل', value: removed.map(r => r.name).join(', ') || '—', inline: true },
        ]);
      }
    }
  },
};
