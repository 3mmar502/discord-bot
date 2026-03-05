// commands/games/حجرة_ورقة_مقص.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { addCoins } = require('../../database/database');

const CHOICES = { حجرة: '🪨', ورقة: '📄', مقص: '✂️' };
const wins = { حجرة: 'مقص', ورقة: 'حجرة', مقص: 'ورقة' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('حجرة_ورقة_مقص')
    .setDescription('العب حجرة ورقة مقص ضد البوت')
    .addIntegerOption(o => o.setName('الرهان').setDescription('رهانك بالعملات').setMinValue(1)),

  async execute(interaction) {
    const bet = interaction.options.getInteger('الرهان') || 0;

    const row = new ActionRowBuilder().addComponents(
      Object.entries(CHOICES).map(([name, emoji]) =>
        new ButtonBuilder().setCustomId(`rps_${name}`).setLabel(name).setStyle(ButtonStyle.Primary).setEmoji(emoji)
      )
    );

    const reply = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(Colors.GAME).setTitle('🎮 حجرة ورقة مقص').setDescription('اختر!')],
      components: [row],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({ time: 30000, max: 1 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'هذا ليس لك!', ephemeral: true });

      const playerChoice = i.customId.replace('rps_', '');
      const botChoiceKey = Object.keys(CHOICES)[Math.floor(Math.random() * 3)];
      const botChoice = CHOICES[botChoiceKey];

      let result, color;
      if (playerChoice === botChoiceKey) {
        result = '🤝 تعادل!';
        color = Colors.INFO;
      } else if (wins[playerChoice] === botChoiceKey) {
        result = '🎉 فزت!';
        color = Colors.SUCCESS;
        if (bet > 0) addCoins(interaction.user.id, interaction.guildId, bet);
      } else {
        result = '😢 خسرت!';
        color = Colors.ERROR;
      }

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`🎮 حجرة ورقة مقص - ${result}`)
        .addFields(
          { name: 'اختيارك', value: `${CHOICES[playerChoice]} ${playerChoice}`, inline: true },
          { name: 'البوت اختار', value: `${botChoice} ${botChoiceKey}`, inline: true },
        );

      await i.update({ embeds: [embed], components: [] });
    });
  },
};
