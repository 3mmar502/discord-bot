// utils/logger.js
const { getGuildSettings } = require('../database/database');
const { logEmbed, Colors } = require('./embeds');

async function sendLog(client, guildId, logType, title, color, fields) {
  try {
    const settings = getGuildSettings(guildId);
    const channelId = settings[logType];
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const embed = logEmbed(title, color, fields);
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(`خطأ في إرسال اللوق ${logType}:`, err.message);
  }
}

module.exports = { sendLog };
