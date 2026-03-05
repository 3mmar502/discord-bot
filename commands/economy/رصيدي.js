// commands/economy/رصيدي.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../../database/database');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('رصيدي')
    .setDescription('عرض رصيدك من العملات')
    .addUserOption(o => o.setName('العضو').setDescription('عضو آخر (اختياري)')),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو') || interaction.user;
    const user = getUser(target.id, interaction.guildId);

    const embed = new EmbedBuilder()
      .setColor(Colors.ECONOMY)
      .setTitle(`💰 رصيد ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '🪙 العملات', value: `**${user.coins.toLocaleString('ar')}** عملة`, inline: true },
        { name: '⭐ المستوى', value: `**${user.level}**`, inline: true },
        { name: '🔥 XP', value: `**${user.xp.toLocaleString('ar')}**`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
