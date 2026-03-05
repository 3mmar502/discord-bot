// commands/games/سؤال.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { addCoins } = require('../../database/database');

const QUESTIONS = [
  { q: 'ما عاصمة المملكة العربية السعودية؟', options: ['الرياض', 'جدة', 'مكة', 'الدمام'], answer: 0 },
  { q: 'كم عدد أيام السنة؟', options: ['364', '365', '366', '360'], answer: 1 },
  { q: 'ما أكبر كوكب في المجموعة الشمسية؟', options: ['الأرض', 'زحل', 'المشتري', 'أورانوس'], answer: 2 },
  { q: 'من كتب كتاب "ألف ليلة وليلة"؟', options: ['ابن سينا', 'مجهول', 'الجاحظ', 'ابن بطوطة'], answer: 1 },
  { q: 'ما أعمق بحيرة في العالم؟', options: ['بحيرة فكتوريا', 'بحيرة بايكال', 'بحيرة ميد', 'بحيرة تيتيكاكا'], answer: 1 },
  { q: 'كم عدد أضلاع المسدس؟', options: ['4', '5', '6', '7'], answer: 2 },
  { q: 'ما عملة اليابان؟', options: ['يوان', 'وون', 'ين', 'رينغيت'], answer: 2 },
  { q: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], answer: 2 },
  { q: 'ما أطول نهر في العالم؟', options: ['الأمازون', 'النيل', 'المسيسيبي', 'اليانغتسي'], answer: 1 },
  { q: 'في أي عام هبط الإنسان على القمر؟', options: ['1965', '1967', '1969', '1971'], answer: 2 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('سؤال')
    .setDescription('اختبر معلوماتك وربح عملات!'),

  async execute(interaction) {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    const letters = ['أ', 'ب', 'ج', 'د'];

    const row = new ActionRowBuilder().addComponents(
      q.options.map((opt, i) =>
        new ButtonBuilder()
          .setCustomId(`quiz_${i}`)
          .setLabel(`${letters[i]}) ${opt}`)
          .setStyle(ButtonStyle.Primary)
      )
    );

    const embed = new EmbedBuilder()
      .setColor(Colors.GAME)
      .setTitle('❓ سؤال عام')
      .setDescription(`**${q.q}**`)
      .setFooter({ text: '⏱️ لديك 30 ثانية للإجابة | الإجابة الصحيحة = 20 🪙' })
      .setTimestamp();

    const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = reply.createMessageComponentCollector({ time: 30000, max: 1 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'هذا ليس لك!', ephemeral: true });

      const choice = parseInt(i.customId.replace('quiz_', ''));
      const correct = choice === q.answer;

      if (correct) addCoins(interaction.user.id, interaction.guildId, 20);

      const updatedRow = new ActionRowBuilder().addComponents(
        q.options.map((opt, idx) => {
          const isCorrect = idx === q.answer;
          const isChosen = idx === choice;
          return new ButtonBuilder()
            .setCustomId(`quiz_done_${idx}`)
            .setLabel(`${letters[idx]}) ${opt}`)
            .setStyle(isCorrect ? ButtonStyle.Success : isChosen ? ButtonStyle.Danger : ButtonStyle.Secondary)
            .setDisabled(true);
        })
      );

      await i.update({
        embeds: [new EmbedBuilder()
          .setColor(correct ? Colors.SUCCESS : Colors.ERROR)
          .setTitle(correct ? '✅ إجابة صحيحة! +20 🪙' : '❌ إجابة خاطئة!')
          .setDescription(`**${q.q}**\n\nالإجابة الصحيحة: **${q.options[q.answer]}**`)],
        components: [updatedRow],
      });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') reply.edit({ components: [] }).catch(() => {});
    });
  },
};
