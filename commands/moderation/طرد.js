// commands/moderation/طرد.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addPunishment } = require('../../database/database');
const { errorEmbed, modEmbed } = require('../../utils/embeds');
const { canModerate } = require('../../utils/permissions');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('طرد')
    .setDescription('طرد عضو من السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('العضو').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب الطرد').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب');

    if (!target) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو غير موجود.')], ephemeral: true });
    if (!canModerate(interaction.member, target)) return interaction.reply({ embeds: [errorEmbed('خطأ', 'لا يمكنك طرد هذا العضو.')], ephemeral: true });

    try {
      try { await target.user.send({ embeds: [modEmbed('تم طردك', `من سيرفر **${interaction.guild.name}**`, interaction.user.tag, reason)] }); } catch {}
      await target.kick(reason);
      addPunishment({ guildId: interaction.guildId, userId: target.id, moderatorId: interaction.user.id, type: 'kick', reason });
      await interaction.reply({ embeds: [modEmbed('طرد', target.user.tag, interaction.user.tag, reason)] });
      await sendLog(interaction.client, interaction.guildId, 'log_kick', '👢 طرد عضو', Colors.WARNING, [
        { name: 'العضو', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'المشرف', value: interaction.user.tag, inline: true },
        { name: 'السبب', value: reason },
      ]);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('خطأ', err.message)], ephemeral: true });
    }
  },
};
