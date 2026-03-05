// commands/economy/يومي.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, updateUser, addCoins } = require('../../database/database');
const { errorEmbed } = require('../../utils/embeds');
const { Colors } = require('../../utils/embeds');

const DAILY_AMOUNT = 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('يومي')
    .setDescription('احصل على مكافأتك اليومية'),

  async execute(interaction) {
    const user = getUser(interaction.user.id, interaction.guildId);
    const now = new Date();

    if (user.last_daily) {
      const lastDaily = new Date(user.last_daily);
      const diff = now - lastDaily;
      const cooldown = 24 * 60 * 60 * 1000;

      if (diff < cooldown) {
        const remaining = cooldown - diff;
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({
          embeds: [errorEmbed('مكافأة مؤجلة', `يمكنك المطالبة بعد **${hours} ساعة و ${minutes} دقيقة** ⏳`)],
          ephemeral: true,
        });
      }
    }

    addCoins(interaction.user.id, interaction.guildId, DAILY_AMOUNT);
    updateUser(interaction.user.id, interaction.guildId, { last_daily: now.toISOString() });

    const updatedUser = getUser(interaction.user.id, interaction.guildId);

    const embed = new EmbedBuilder()
      .setColor(Colors.ECONOMY)
      .setTitle('🎁 مكافأة يومية!')
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`حصلت على **${DAILY_AMOUNT}** 🪙`)
      .addFields({ name: '💰 رصيدك الحالي', value: `**${updatedUser.coins.toLocaleString('ar')}** عملة` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
