// commands/moderation/باند.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { addPunishment } = require('../../database/database');
const { errorEmbed, modEmbed } = require('../../utils/embeds');
const { hasAdminPermission, canModerate } = require('../../utils/permissions');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

const BAN_REASONS = [
  { label: 'تخريب السيرفر', value: 'تخريب السيرفر' },
  { label: 'سبام', value: 'سبام' },
  { label: 'نشر روابط ضارة', value: 'نشر روابط ضارة' },
  { label: 'حساب وهمي', value: 'حساب وهمي' },
  { label: 'إهانة الأعضاء', value: 'إهانة الأعضاء' },
  { label: 'سبب آخر', value: 'سبب آخر' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('باند')
    .setDescription('حظر عضو من السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('العضو').setDescription('العضو المراد حظره').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('مسح_الرسائل').setDescription('مسح رسائل آخر X أيام (0-7)').setMinValue(0).setMaxValue(7)
    ),

  async execute(interaction) {
    if (!hasAdminPermission(interaction.member) && !interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ embeds: [errorEmbed('لا صلاحية', 'ليس لديك صلاحية الحظر.')], ephemeral: true });
    }

    const target = interaction.options.getMember('العضو') || await interaction.guild.members.fetch(interaction.options.getUser('العضو').id).catch(() => null);
    const deleteMessages = interaction.options.getInteger('مسح_الرسائل') || 0;

    if (!target) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو غير موجود.')], ephemeral: true });
    if (target && !canModerate(interaction.member, target)) {
      return interaction.reply({ embeds: [errorEmbed('خطأ', 'لا يمكنك حظر هذا العضو.')], ephemeral: true });
    }

    const reasonMenu = new StringSelectMenuBuilder()
      .setCustomId(`ban_reason_${target.id}`)
      .setPlaceholder('📝 اختر سبب الحظر')
      .addOptions(BAN_REASONS.map(r => ({ label: r.label, value: r.value })));

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`ban_confirm_${target.id}_${deleteMessages}`)
      .setLabel('تأكيد الحظر')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔨');

    const cancelBtn = new ButtonBuilder()
      .setCustomId('ban_cancel')
      .setLabel('إلغاء')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row1 = new ActionRowBuilder().addComponents(reasonMenu);
    const row2 = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    const reply = await interaction.reply({
      embeds: [{
        color: 0xe74c3c,
        title: `🔨 حظر العضو: ${target.user.tag}`,
        description: 'اختر السبب ثم اضغط تأكيد',
        thumbnail: { url: target.user.displayAvatarURL() },
        timestamp: new Date().toISOString(),
      }],
      components: [row1, row2],
      ephemeral: true,
      fetchReply: true,
    });

    let reason = null;
    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'هذا ليس لك!', ephemeral: true });

      if (i.customId === 'ban_cancel') {
        collector.stop('cancel');
        return i.update({ embeds: [errorEmbed('إلغاء', 'تم إلغاء الحظر.')], components: [] });
      }

      if (i.customId.startsWith('ban_reason_')) { reason = i.values[0]; await i.deferUpdate(); }

      if (i.customId.startsWith('ban_confirm_')) {
        if (!reason) return i.reply({ content: '⚠️ اختر السبب أولاً', ephemeral: true });

        try {
          try {
            await target.user.send({
              embeds: [modEmbed('تم حظرك', `من سيرفر **${interaction.guild.name}**`, interaction.user.tag, reason)],
            });
          } catch {}

          await interaction.guild.members.ban(target.id, { reason, deleteMessageSeconds: deleteMessages * 86400 });

          addPunishment({
            guildId: interaction.guildId,
            userId: target.id,
            moderatorId: interaction.user.id,
            type: 'ban',
            reason,
          });

          const embed = modEmbed('حظر', target.user.tag, interaction.user.tag, reason);
          await i.update({ embeds: [embed], components: [] });

          await sendLog(interaction.client, interaction.guildId, 'log_ban', '🔨 حظر عضو', Colors.ERROR, [
            { name: 'العضو', value: `${target.user.tag} (${target.id})`, inline: true },
            { name: 'المشرف', value: interaction.user.tag, inline: true },
            { name: 'السبب', value: reason },
          ]);

          collector.stop('done');
        } catch (err) {
          await i.update({ embeds: [errorEmbed('خطأ', err.message)], components: [] });
        }
      }
    });
  },
};
