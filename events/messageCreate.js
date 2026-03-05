// events/messageCreate.js
const { addXP, addCoins, getUser, updateUser } = require('../database/database');
const { sendLog } = require('../utils/logger');
const { Colors } = require('../utils/embeds');

const XP_COOLDOWN = 60000; // 60 ثانية بين كل XP
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // كشف الروابط
    if (URL_REGEX.test(message.content)) {
      await sendLog(message.client, message.guildId, 'log_links', '🔗 رابط مُرسل', Colors.WARNING, [
        { name: 'العضو', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: 'الروم', value: `${message.channel}`, inline: true },
        { name: 'الرابط', value: message.content.slice(0, 200) },
      ]);
    }

    // إضافة XP والعملات
    const user = getUser(message.author.id, message.guildId);
    const now = Date.now();
    const lastMsg = user.last_message ? new Date(user.last_message).getTime() : 0;

    if (now - lastMsg > XP_COOLDOWN) {
      const xpGain = Math.floor(Math.random() * 10) + 15;
      const coinsGain = Math.floor(Math.random() * 5) + 5;
      const { leveledUp, newLevel } = addXP(message.author.id, message.guildId, xpGain);
      addCoins(message.author.id, message.guildId, coinsGain);
      updateUser(message.author.id, message.guildId, { last_message: new Date().toISOString() });

      if (leveledUp) {
        message.channel.send(`🎉 مبروك ${message.author}! ارتقيت للمستوى **${newLevel}** ⭐`).catch(() => {});
      }
    }

    // لوق الرسائل المحذوفة (نحفظها مؤقتاً)
    // يتم التعامل معها في messageDelete
  },
};
