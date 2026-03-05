// commands/moderation/فك_الميوت.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('فك_الميوت')
    .setDescription('فك الكتم الصوتي عن عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption(o => o.setName('العضو').setDescription('العضو').setRequired(true))
    .addStringOption(o => o.setName('السبب').setDescription('السبب')),

  async execute(interaction) {
    const target = interaction.options.getMember('العضو');
    const reason = interaction.options.getString('السبب') || 'فك الكتم';

    if (!target) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو غير موجود.')], ephemeral: true });
    if (!target.voice.channel) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو ليس في روم فويس.')], ephemeral: true });

    try {
      await target.voice.setMute(false, reason);
      await interaction.reply({ embeds: [successEmbed('فك الكتم', `تم فك كتم **${target.user.tag}** الصوتي.`)] });
      await sendLog(interaction.client, interaction.guildId, 'log_mute', '🔊 فك الكتم الصوتي', Colors.SUCCESS, [
        { name: 'العضو', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'المشرف', value: interaction.user.tag, inline: true },
        { name: 'السبب', value: reason },
      ]);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('خطأ', err.message)], ephemeral: true });
    }
  },
};
