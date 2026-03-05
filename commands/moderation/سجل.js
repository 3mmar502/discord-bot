// commands/moderation/سجل.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getPunishmentStats, getUserPunishments } = require('../../database/database');
const { errorEmbed } = require('../../utils/embeds');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('سجل')
    .setDescription('عرض سجل العقوبات لعضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('العضو').setDescription('العضو').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const stats = getPunishmentStats(target.id, interaction.guildId);
    const history = getUserPunishments(target.id, interaction.guildId).slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor(Colors.MODERATION)
      .setTitle(`📋 سجل العقوبات - ${target.tag}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '⚠️ التحذيرات', value: String(stats.warnings), inline: true },
        { name: '🔇 الإسكات', value: String(stats.timeouts), inline: true },
        { name: '🔕 الكتم', value: String(stats.mutes), inline: true },
        { name: '👢 الطرد', value: String(stats.kicks), inline: true },
        { name: '🔨 الحظر', value: String(stats.bans), inline: true },
        { name: '📊 المجموع', value: String(stats.warnings + stats.timeouts + stats.mutes + stats.kicks + stats.bans), inline: true },
      )
      .setTimestamp();

    if (history.length > 0) {
      const historyText = history.map((p, i) => {
        const typeEmoji = { warning: '⚠️', timeout: '🔇', mute: '🔕', kick: '👢', ban: '🔨' }[p.type] || '❓';
        const date = new Date(p.created_at).toLocaleDateString('ar-SA');
        return `\`${i + 1}.\` ${typeEmoji} **${p.type}** - ${p.reason} _(${date})_`;
      }).join('\n');
      embed.addFields({ name: '📜 آخر العقوبات', value: historyText.slice(0, 1024) });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
