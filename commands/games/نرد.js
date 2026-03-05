// commands/games/نرد.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { addCoins, removeCoins } = require('../../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('نرد')
    .setDescription('رمي النرد والرهان على النتيجة')
    .addIntegerOption(o => o.setName('تخمينك').setDescription('توقعك (1-6)').setRequired(true).setMinValue(1).setMaxValue(6))
    .addIntegerOption(o => o.setName('الرهان').setDescription('الرهان بالعملات').setMinValue(1)),

  async execute(interaction) {
    const guess = interaction.options.getInteger('تخمينك');
    const bet = interaction.options.getInteger('الرهان') || 0;
    const roll = Math.floor(Math.random() * 6) + 1;
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const won = guess === roll;

    if (bet > 0) {
      if (won) addCoins(interaction.user.id, interaction.guildId, bet * 2);
      else removeCoins(interaction.user.id, interaction.guildId, bet);
    }

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(won ? Colors.SUCCESS : Colors.ERROR)
        .setTitle(`🎲 النرد - ${won ? '🎉 فزت!' : '😢 خسرت!'}`)
        .addFields(
          { name: 'تخمينك', value: `${faces[guess - 1]} ${guess}`, inline: true },
          { name: 'نتيجة النرد', value: `${faces[roll - 1]} ${roll}`, inline: true },
          { name: bet > 0 ? (won ? '💰 ربحت' : '💸 خسرت') : '⚡', value: bet > 0 ? `${bet} عملة` : '—', inline: true },
        ).setTimestamp()],
    });
  },
};
