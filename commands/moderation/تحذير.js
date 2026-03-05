// commands/moderation/تحذير.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addPunishment } = require('../../database/database');
const { errorEmbed, modEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('تحذير')
    .setDescription('تحذير عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('العضو').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('سبب التحذير').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب');

    if (!target) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو غير موجود.')], ephemeral: true });

    addPunishment({ guildId: interaction.guildId, userId: target.id, moderatorId: interaction.user.id, type: 'warning', reason });

    try { await target.user.send({ embeds: [modEmbed('تحذير', `في سيرفر **${interaction.guild.name}**`, interaction.user.tag, reason)] }); } catch {}

    await interaction.reply({ embeds: [modEmbed('تحذير', target.user.tag, interaction.user.tag, reason)] });

    await sendLog(interaction.client, interaction.guildId, 'log_mute', '⚠️ تحذير', Colors.WARNING, [
      { name: 'العضو', value: `${target.user.tag} (${target.id})`, inline: true },
      { name: 'المشرف', value: interaction.user.tag, inline: true },
      { name: 'السبب', value: reason },
    ]);
  },
};
