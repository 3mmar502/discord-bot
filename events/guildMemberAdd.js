// events/guildMemberAdd.js
const { isBotWhitelisted } = require('../database/database');
const { sendLog } = require('../utils/logger');
const { Colors } = require('../utils/embeds');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // كشف البوتات غير المُدرجة في Whitelist
    if (member.user.bot) {
      const whitelisted = isBotWhitelisted(member.id, member.guild.id);
      if (!whitelisted) {
        await sendLog(member.client, member.guild.id, 'log_bots', '🤖 بوت غير مُصرح دخل!', Colors.ERROR, [
          { name: 'البوت', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'الإجراء', value: '🚫 تم الطرد تلقائياً', inline: true },
        ]);
        await member.kick('بوت غير مُدرج في القائمة البيضاء').catch(() => {});
        return;
      }

      await sendLog(member.client, member.guild.id, 'log_bots', '🤖 بوت مُصرح دخل', Colors.INFO, [
        { name: 'البوت', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: 'الحالة', value: '✅ في القائمة البيضاء', inline: true },
      ]);
      return;
    }

    // لوق الانضمام
    await sendLog(member.client, member.guild.id, 'log_join_leave', '📥 عضو جديد', Colors.SUCCESS, [
      { name: 'العضو', value: `${member.user.tag} (${member.id})`, inline: true },
      { name: 'تاريخ الإنشاء', value: member.user.createdAt.toLocaleDateString('ar-SA'), inline: true },
      { name: 'عدد الأعضاء الكلي', value: String(member.guild.memberCount) },
    ]);
  },
};
