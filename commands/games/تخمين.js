// commands/games/تخمين.js
const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { addCoins } = require('../../database/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('تخمين')
    .setDescription('تخمين رقم من 1 إلى 100 (5 محاولات)'),

  async execute(interaction) {
    const secret = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    const maxAttempts = 5;

    const embed = new EmbedBuilder()
      .setColor(Colors.GAME)
      .setTitle('🔢 تخمين الرقم')
      .setDescription(`خمّن رقماً من 1 إلى 100!\nلديك **${maxAttempts}** محاولات. استخدم /تخمين_رقم`)
      .addFields({ name: '💡 تلميح', value: 'بعد كل محاولة ستعرف إن كان الرقم أكبر أو أصغر' })
      .setFooter({ text: `${maxAttempts} محاولات متبقية` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);
    const collector = interaction.channel.createMessageCollector({ filter, time: 120000, max: maxAttempts });

    collector.on('collect', async msg => {
      attempts++;
      const guess = parseInt(msg.content);

      if (guess < 1 || guess > 100) {
        return msg.reply('⚠️ الرقم يجب أن يكون بين 1 و 100!');
      }

      if (guess === secret) {
        const coins = Math.max(10, 50 - (attempts - 1) * 8);
        addCoins(interaction.user.id, interaction.guildId, coins);
        await msg.reply({
          embeds: [new EmbedBuilder()
            .setColor(Colors.SUCCESS)
            .setTitle('🎉 صحيح!')
            .setDescription(`الرقم كان **${secret}** وجدته في **${attempts}** محاولة!\nربحت **${coins}** 🪙`)],
        });
        return collector.stop('won');
      }

      const remaining = maxAttempts - attempts;
      if (remaining === 0) {
        await msg.reply({ embeds: [new EmbedBuilder().setColor(Colors.ERROR).setTitle('😢 انتهت المحاولات!').setDescription(`الرقم كان **${secret}**`)] });
        return collector.stop('lost');
      }

      const hint = guess < secret ? '⬆️ أكبر' : '⬇️ أصغر';
      await msg.reply(`${hint} | المحاولات المتبقية: **${remaining}**`);
    });
  },
};
