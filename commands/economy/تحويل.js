// commands/economy/تحويل.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, removeCoins, addCoins } = require('../../database/database');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('تحويل')
    .setDescription('تحويل عملات لعضو آخر')
    .addUserOption(o => o.setName('العضو').setDescription('المستلم').setRequired(true))
    .addIntegerOption(o => o.setName('المبلغ').setDescription('المبلغ').setRequired(true).setMinValue(1)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const amount = interaction.options.getInteger('المبلغ');

    if (target.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('خطأ', 'لا تستطيع التحويل لنفسك!')], ephemeral: true });
    if (target.bot) return interaction.reply({ embeds: [errorEmbed('خطأ', 'لا يمكن التحويل للبوتات.')], ephemeral: true });

    const success = removeCoins(interaction.user.id, interaction.guildId, amount);
    if (!success) return interaction.reply({ embeds: [errorEmbed('رصيد غير كافٍ', 'ليس لديك رصيد كافٍ لهذا التحويل.')], ephemeral: true });

    addCoins(target.id, interaction.guildId, amount);
    await interaction.reply({ embeds: [successEmbed('تحويل ناجح', `تم تحويل **${amount.toLocaleString('ar')}** 🪙 لـ ${target}`)] });
  },
};
