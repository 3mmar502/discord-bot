// commands/moderation/فك_الاسكات.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('فك_الاسكات')
    .setDescription('فك الإسكات الكتابي عن عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('العضو').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('السبب')),

  async execute(interaction) {
    const target = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب') || 'فك الإسكات';

    if (!target) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو غير موجود.')], ephemeral: true });

    try {
      await target.timeout(null, reason);
      await interaction.reply({ embeds: [successEmbed('فك الإسكات', `تم فك إسكات **${target.user.tag}** بنجاح.`)] });
      await sendLog(interaction.client, interaction.guildId, 'log_mute', '🔊 فك الإسكات الكتابي', Colors.SUCCESS, [
        { name: 'العضو', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'المشرف', value: interaction.user.tag, inline: true },
        { name: 'السبب', value: reason },
      ]);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('خطأ', err.message)], ephemeral: true });
    }
  },
};
