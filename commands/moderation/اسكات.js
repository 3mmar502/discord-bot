// commands/moderation/اسكات.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { addPunishment } = require('../../database/database');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { hasModPermission, canModerate } = require('../../utils/permissions');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

const DURATIONS = [
  { label: '10 دقائق', value: '600000' },
  { label: '15 دقيقة', value: '900000' },
  { label: '30 دقيقة', value: '1800000' },
  { label: '45 دقيقة', value: '2700000' },
  { label: '60 دقيقة', value: '3600000' },
  { label: 'ساعتين', value: '7200000' },
  { label: '6 ساعات', value: '21600000' },
  { label: '12 ساعة', value: '43200000' },
  { label: 'يوم', value: '86400000' },
  { label: 'أسبوع', value: '604800000' },
];

const REASONS = [
  { label: 'سبام', value: 'سبام' },
  { label: 'نشر روابط', value: 'نشر روابط' },
  { label: 'إزعاج', value: 'إزعاج' },
  { label: 'ألفاظ', value: 'ألفاظ' },
  { label: 'مخالفة القوانين', value: 'مخالفة القوانين' },
  { label: 'سبب آخر', value: 'سبب آخر' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('اسكات')
    .setDescription('إسكات كتابي لعضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('العضو').setDescription('العضو المراد إسكاته').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasModPermission(interaction.member)) {
      return interaction.reply({ embeds: [errorEmbed('لا صلاحية', 'ليس لديك صلاحية استخدام هذا الأمر.')], ephemeral: true });
    }

    const target = interaction.options.getMember('العضو');
    if (!target) return interaction.reply({ embeds: [errorEmbed('خطأ', 'العضو غير موجود.')], ephemeral: true });
    if (!canModerate(interaction.member, target)) {
      return interaction.reply({ embeds: [errorEmbed('خطأ', 'لا يمكنك إسكات هذا العضو.')], ephemeral: true });
    }

    const durationMenu = new StringSelectMenuBuilder()
      .setCustomId(`mute_duration_${target.id}`)
      .setPlaceholder('⏱️ اختر مدة الإسكات')
      .addOptions(DURATIONS.map(d => ({ label: d.label, value: d.value })));

    const reasonMenu = new StringSelectMenuBuilder()
      .setCustomId(`mute_reason_${target.id}`)
      .setPlaceholder('📝 اختر السبب')
      .addOptions(REASONS.map(r => ({ label: r.label, value: r.value })));

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`mute_confirm_${target.id}`)
      .setLabel('تأكيد الإسكات')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔇');

    const cancelBtn = new ButtonBuilder()
      .setCustomId('mute_cancel')
      .setLabel('إلغاء')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row1 = new ActionRowBuilder().addComponents(durationMenu);
    const row2 = new ActionRowBuilder().addComponents(reasonMenu);
    const row3 = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    const reply = await interaction.reply({
      embeds: [{
        color: 0xe67e22,
        title: `🔇 إسكات العضو: ${target.user.tag}`,
        description: 'اختر المدة والسبب ثم اضغط تأكيد',
        thumbnail: { url: target.user.displayAvatarURL() },
        timestamp: new Date().toISOString(),
      }],
      components: [row1, row2, row3],
      ephemeral: true,
      fetchReply: true,
    });

    const state = { duration: null, reason: null };

    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'هذا الأمر ليس لك!', ephemeral: true });
      }

      if (i.customId === 'mute_cancel') {
        collector.stop('cancel');
        return i.update({ embeds: [errorEmbed('إلغاء', 'تم إلغاء عملية الإسكات.')], components: [] });
      }

      if (i.customId.startsWith('mute_duration_')) {
        state.duration = i.values[0];
        await i.deferUpdate();
      }

      if (i.customId.startsWith('mute_reason_')) {
        state.reason = i.values[0];
        await i.deferUpdate();
      }

      if (i.customId.startsWith('mute_confirm_')) {
        if (!state.duration || !state.reason) {
          return i.reply({ content: '⚠️ يرجى اختيار المدة والسبب أولاً', ephemeral: true });
        }

        const duration = parseInt(state.duration);
        const durationLabel = DURATIONS.find(d => d.value === state.duration)?.label || '';

        try {
          await target.timeout(duration, state.reason);
          const expiresAt = new Date(Date.now() + duration).toISOString();

          addPunishment({
            guildId: interaction.guildId,
            userId: target.id,
            moderatorId: interaction.user.id,
            type: 'timeout',
            reason: state.reason,
            duration: duration,
            expiresAt,
          });

          const embed = modEmbed('إسكات كتابي', target.user.tag, interaction.user.tag, state.reason, { duration: durationLabel });
          await i.update({ embeds: [embed], components: [] });

          await sendLog(interaction.client, interaction.guildId, 'log_mute', '🔇 إسكات كتابي', Colors.MODERATION, [
            { name: 'العضو', value: `${target.user.tag} (${target.id})`, inline: true },
            { name: 'المشرف', value: `${interaction.user.tag}`, inline: true },
            { name: 'المدة', value: durationLabel, inline: true },
            { name: 'السبب', value: state.reason, inline: false },
          ]);

          try {
            await target.user.send({
              embeds: [modEmbed('تم إسكاتك', `في سيرفر **${interaction.guild.name}**`, interaction.user.tag, state.reason, { duration: durationLabel })],
            });
          } catch {}

          collector.stop('done');
        } catch (err) {
          await i.update({ embeds: [errorEmbed('خطأ', `فشل الإسكات: ${err.message}`)], components: [] });
        }
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        interaction.editReply({ embeds: [errorEmbed('انتهى الوقت', 'انتهى وقت التأكيد.')], components: [] }).catch(() => {});
      }
    });
  },
};
