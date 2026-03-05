// events/guildMemberRemove.js
const { sendLog } = require('../utils/logger');
const { Colors } = require('../utils/embeds');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    if (member.user.bot) return;
    await sendLog(member.client, member.guild.id, 'log_join_leave', '📤 عضو غادر', Colors.WARNING, [
      { name: 'العضو', value: `${member.user.tag} (${member.id})`, inline: true },
      { name: 'الرتب', value: member.roles.cache.filter(r => r.id !== member.guild.id).map(r => r.name).join(', ') || 'لا يوجد', inline: false },
    ]);
  },
};
