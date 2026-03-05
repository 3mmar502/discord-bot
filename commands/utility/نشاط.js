// commands/utility/نشاط.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, getRank } = require('../../database/database');
const { Colors } = require('../../utils/embeds');

function xpForNextLevel(level) {
  return Math.pow((level) / 0.1, 2);
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds} ثانية`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ساعة`;
  return `${Math.floor(seconds / 86400)} يوم`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('نشاط')
    .setDescription('عرض نشاطك أو نشاط عضو')
    .addUserOption(o => o.setName('العضو').setDescription('العضو (اختياري)')),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو') || interaction.user;
    const userData = getUser(target.id, interaction.guildId);
    const rank = getRank(target.id, interaction.guildId);
    const nextLevelXp = xpForNextLevel(userData.level + 1);
    const progress = Math.min(100, Math.floor((userData.xp / nextLevelXp) * 100));
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

    const embed = new EmbedBuilder()
      .setColor(Colors.INFO)
      .setTitle(`📊 نشاط ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '⭐ المستوى', value: `**${userData.level}**`, inline: true },
        { name: '🏆 الترتيب', value: `**#${rank}**`, inline: true },
        { name: '✉️ الرسائل', value: `**${userData.messages.toLocaleString('ar')}**`, inline: true },
        { name: '🔥 XP', value: `**${userData.xp.toLocaleString('ar')}** / ${Math.floor(nextLevelXp).toLocaleString('ar')}`, inline: true },
        { name: '🎙️ وقت الفويس', value: `**${formatTime(userData.voice_time)}**`, inline: true },
        { name: '💰 العملات', value: `**${userData.coins.toLocaleString('ar')}** 🪙`, inline: true },
        { name: `📈 تقدم المستوى [${progress}%]`, value: `\`${progressBar}\`` },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
