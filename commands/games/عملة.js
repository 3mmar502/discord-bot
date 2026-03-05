// commands/games/عملة.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { addCoins, removeCoins } = require('../../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('عملة')
    .setDescription('رمي العملة - صورة أو كتابة؟')
    .addIntegerOption(o => o.setName('الرهان').setDescription('الرهان').setMinValue(1)),

  async execute(interaction) {
    const bet = interaction.options.getInteger('الرهان') || 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('coin_heads').setLabel('صورة').setStyle(ButtonStyle.Primary).setEmoji('👑'),
      new ButtonBuilder().setCustomId('coin_tails').setLabel('كتابة').setStyle(ButtonStyle.Secondary).setEmoji('🔤'),
    );

    const reply = await interaction.reply({
      embeds: [new EmbedBuilder().setColor(Colors.GAME).setTitle('🪙 رمي العملة').setDescription('اختر: صورة أم كتابة؟')],
      components: [row],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({ time: 30000, max: 1 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'هذا ليس لك!', ephemeral: true });
      const choice = i.customId === 'coin_heads' ? 'heads' : 'tails';
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = choice === result;

      if (bet > 0) {
        if (won) addCoins(interaction.user.id, interaction.guildId, bet);
        else removeCoins(interaction.user.id, interaction.guildId, bet);
      }

      await i.update({
        embeds: [new EmbedBuilder()
          .setColor(won ? Colors.SUCCESS : Colors.ERROR)
          .setTitle(`🪙 ${won ? '🎉 فزت!' : '😢 خسرت!'}`)
          .addFields(
            { name: 'اخترت', value: choice === 'heads' ? '👑 صورة' : '🔤 كتابة', inline: true },
            { name: 'النتيجة', value: result === 'heads' ? '👑 صورة' : '🔤 كتابة', inline: true },
          )],
        components: [],
      });
    });
  },
};
