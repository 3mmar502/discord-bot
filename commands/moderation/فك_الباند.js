// commands/moderation/فك_الباند.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('فك_الباند')
    .setDescription('رفع الحظر عن عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(o => o.setName('معرف_العضو').setDescription('معرف العضو (ID)').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('السبب')),

  async execute(interaction) {
    const userId = interaction.options.getString('معرف_العضو');
    const reason = interaction.options.getString('السبب') || 'رفع الحظر';

    try {
      const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!ban) return interaction.reply({ embeds: [errorEmbed('خطأ', 'هذا العضو غير محظور.')], ephemeral: true });

      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({ embeds: [successEmbed('رفع الحظر', `تم رفع الحظر عن **${ban.user.tag}** بنجاح.`)] });

      await sendLog(interaction.client, interaction.guildId, 'log_ban', '✅ رفع الحظر', Colors.SUCCESS, [
        { name: 'العضو', value: `${ban.user.tag} (${userId})`, inline: true },
        { name: 'المشرف', value: interaction.user.tag, inline: true },
        { name: 'السبب', value: reason },
      ]);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('خطأ', err.message)], ephemeral: true });
    }
  },
};
