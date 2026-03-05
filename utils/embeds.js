// utils/embeds.js
const { EmbedBuilder } = require('discord.js');

const Colors = {
  SUCCESS: 0x2ecc71,
  ERROR: 0xe74c3c,
  WARNING: 0xf39c12,
  INFO: 0x3498db,
  MODERATION: 0xe67e22,
  ECONOMY: 0xf1c40f,
  GAME: 0x9b59b6,
  TICKET: 0x1abc9c,
  LOG: 0x95a5a6,
};

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.ERROR)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function warnEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.WARNING)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(Colors.INFO)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function modEmbed(action, target, moderator, reason, extra = {}) {
  const embed = new EmbedBuilder()
    .setColor(Colors.MODERATION)
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: '👤 العضو', value: `${target}`, inline: true },
      { name: '🛡️ المشرف', value: `${moderator}`, inline: true },
      { name: '📝 السبب', value: reason, inline: false },
    )
    .setTimestamp();

  if (extra.duration) embed.addFields({ name: '⏱️ المدة', value: extra.duration, inline: true });
  if (extra.channel) embed.addFields({ name: '📢 الروم', value: extra.channel, inline: true });

  return embed;
}

function logEmbed(title, color, fields) {
  const embed = new EmbedBuilder()
    .setColor(color || Colors.LOG)
    .setTitle(title)
    .setTimestamp();

  for (const field of fields) {
    embed.addFields({ name: field.name, value: String(field.value), inline: field.inline || false });
  }

  return embed;
}

module.exports = { successEmbed, errorEmbed, warnEmbed, infoEmbed, modEmbed, logEmbed, Colors };
