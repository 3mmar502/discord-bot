// events/voiceStateUpdate.js
const { sendLog } = require('../utils/logger');
const { updateUser, getUser } = require('../database/database');
const { Colors } = require('../utils/embeds');

const voiceSessions = new Map(); // userId -> joinTime

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const userId = member.id;
    const guildId = member.guild.id;

    // انضمام للفويس
    if (!oldState.channel && newState.channel) {
      voiceSessions.set(`${userId}_${guildId}`, Date.now());
      await sendLog(newState.client, guildId, 'log_voice', '🔊 دخل الفويس', Colors.SUCCESS, [
        { name: 'العضو', value: `${member.user.tag}`, inline: true },
        { name: 'الروم', value: newState.channel.name, inline: true },
      ]);
    }

    // مغادرة الفويس
    if (oldState.channel && !newState.channel) {
      const key = `${userId}_${guildId}`;
      const joinTime = voiceSessions.get(key);
      if (joinTime) {
        const duration = Math.floor((Date.now() - joinTime) / 1000);
        voiceSessions.delete(key);
        // تحديث وقت الفويس
        const user = getUser(userId, guildId);
        updateUser(userId, guildId, { voice_time: user.voice_time + duration });
      }
      await sendLog(newState.client, guildId, 'log_voice', '🔇 غادر الفويس', Colors.WARNING, [
        { name: 'العضو', value: `${member.user.tag}`, inline: true },
        { name: 'الروم', value: oldState.channel.name, inline: true },
      ]);
    }

    // كتم/فك كتم
    if (oldState.serverMute !== newState.serverMute) {
      await sendLog(newState.client, guildId, 'log_voice', newState.serverMute ? '🔕 تم كتم الصوت' : '🔊 فك كتم الصوت', Colors.INFO, [
        { name: 'العضو', value: `${member.user.tag}`, inline: true },
        { name: 'الروم', value: (newState.channel || oldState.channel)?.name || '—', inline: true },
      ]);
    }
  },
};
