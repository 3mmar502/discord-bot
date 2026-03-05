// commands/moderation/قفل.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/logger');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('قفل')
    .setDescription('قفل الشات')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const scopeMenu = new StringSelectMenuBuilder()
      .setCustomId('lock_scope')
      .setPlaceholder('🔒 اختر نطاق القفل')
      .addOptions([
        { label: 'قفل هذا الروم فقط', value: 'this', emoji: '🔒' },
        { label: 'قفل الشات العام', value: 'general', emoji: '📢' },
        { label: 'قفل كل الشاتات', value: 'all', emoji: '🔐' },
      ]);

    const durationMenu = new StringSelectMenuBuilder()
      .setCustomId('lock_duration')
      .setPlaceholder('⏱️ مدة القفل (اختياري)')
      .addOptions([
        { label: 'دائم (حتى الفتح)', value: '0', emoji: '♾️' },
        { label: '10 دقائق', value: '600000', emoji: '⏱️' },
        { label: '30 دقيقة', value: '1800000', emoji: '⏱️' },
        { label: '60 دقيقة', value: '3600000', emoji: '⏱️' },
        { label: 'يوم', value: '86400000', emoji: '📅' },
      ]);

    const confirmBtn = new ButtonBuilder()
      .setCustomId('lock_confirm')
      .setLabel('تأكيد القفل')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    const cancelBtn = new ButtonBuilder()
      .setCustomId('lock_cancel')
      .setLabel('إلغاء')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌');

    const row1 = new ActionRowBuilder().addComponents(scopeMenu);
    const row2 = new ActionRowBuilder().addComponents(durationMenu);
    const row3 = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

    const reply = await interaction.reply({
      embeds: [{
        color: 0xe74c3c,
        title: '🔒 قفل الشات',
        description: 'اختر نطاق القفل والمدة',
        timestamp: new Date().toISOString(),
      }],
      components: [row1, row2, row3],
      ephemeral: true,
      fetchReply: true,
    });

    const state = { scope: null, duration: '0' };
    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'هذا ليس لك!', ephemeral: true });

      if (i.customId === 'lock_cancel') {
        collector.stop();
        return i.update({ embeds: [errorEmbed('إلغاء', 'تم الإلغاء.')], components: [] });
      }

      if (i.customId === 'lock_scope') { state.scope = i.values[0]; await i.deferUpdate(); }
      if (i.customId === 'lock_duration') { state.duration = i.values[0]; await i.deferUpdate(); }

      if (i.customId === 'lock_confirm') {
        if (!state.scope) return i.reply({ content: '⚠️ اختر نطاق القفل أولاً', ephemeral: true });

        const everyone = interaction.guild.roles.everyone;
        const channels = [];

        if (state.scope === 'this') {
          channels.push(interaction.channel);
        } else if (state.scope === 'general') {
          const general = interaction.guild.channels.cache.find(c =>
            (c.name.includes('عام') || c.name.includes('general')) && c.type === ChannelType.GuildText
          );
          if (general) channels.push(general);
        } else if (state.scope === 'all') {
          interaction.guild.channels.cache
            .filter(c => c.type === ChannelType.GuildText)
            .forEach(c => channels.push(c));
        }

        let lockedCount = 0;
        for (const ch of channels) {
          try {
            await ch.permissionOverwrites.edit(everyone, { SendMessages: false });
            lockedCount++;
          } catch {}
        }

        await i.update({
          embeds: [successEmbed('تم القفل', `تم قفل **${lockedCount}** روم بنجاح.`)],
          components: [],
        });

        await sendLog(interaction.client, interaction.guildId, 'log_channels', '🔒 قفل الشات', Colors.WARNING, [
          { name: 'المشرف', value: interaction.user.tag, inline: true },
          { name: 'النطاق', value: state.scope, inline: true },
          { name: 'عدد الرومات', value: String(lockedCount), inline: true },
        ]);

        if (state.duration !== '0') {
          const dur = parseInt(state.duration);
          setTimeout(async () => {
            for (const ch of channels) {
              try { await ch.permissionOverwrites.edit(everyone, { SendMessages: null }); } catch {}
            }
          }, dur);
        }

        collector.stop('done');
      }
    });
  },
};
