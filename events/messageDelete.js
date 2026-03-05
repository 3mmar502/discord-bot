// events/messageDelete.js
const { sendLog } = require('../utils/logger');
const { Colors } = require('../utils/embeds');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;
    if (!message.content && message.attachments.size === 0) return;

    await sendLog(message.client, message.guildId, 'log_messages', '🗑️ رسالة محذوفة', Colors.WARNING, [
      { name: 'الكاتب', value: message.author ? `${message.author.tag} (${message.author.id})` : 'مجهول', inline: true },
      { name: 'الروم', value: `${message.channel}`, inline: true },
      { name: 'المحتوى', value: message.content?.slice(0, 500) || '*(لا يوجد نص)*' },
    ]);
  },
};
