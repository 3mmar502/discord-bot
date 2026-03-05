// commands/tickets/تذكرة.js
const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { createTicket, getTicket, updateTicket } = require('../../database/database');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('تذكرة')
    .setDescription('فتح تذكرة دعم')
    .addStringOption(o => o.setName('الموضوع').setDescription('موضوع التذكرة').setRequired(true)),

  async execute(interaction) {
    const topic = interaction.options.getString('الموضوع');
    const categoryId = process.env.TICKET_CATEGORY_ID;

    // التحقق من تذاكر مفتوحة
    const existing = interaction.guild.channels.cache.find(c =>
      c.name === `تذكرة-${interaction.user.username.toLowerCase().replace(/\s/g, '-')}` ||
      c.topic?.includes(interaction.user.id)
    );

    if (existing) {
      return interaction.reply({
        embeds: [errorEmbed('تذكرة موجودة', `لديك تذكرة مفتوحة بالفعل: ${existing}`)],
        ephemeral: true,
      });
    }

    try {
      const ticketChannel = await interaction.guild.channels.create({
        name: `تذكرة-${interaction.user.username.slice(0, 20)}`,
        type: ChannelType.GuildText,
        parent: categoryId || null,
        topic: `تذكرة ${interaction.user.id} - ${topic}`,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
        ],
      });

      createTicket(ticketChannel.id, interaction.guildId, interaction.user.id);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('إغلاق التذكرة').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim التذكرة').setStyle(ButtonStyle.Success).setEmoji('✋'),
        new ButtonBuilder().setCustomId('ticket_transfer').setLabel('نقل التذكرة').setStyle(ButtonStyle.Secondary).setEmoji('🔄'),
      );

      const embed = new EmbedBuilder()
        .setColor(Colors.TICKET)
        .setTitle('🎫 تذكرة دعم')
        .setDescription(`مرحباً ${interaction.user}!\n\n**الموضوع:** ${topic}\n\nسيتواصل معك أحد أعضاء الدعم قريباً.\nاضغط 🔒 لإغلاق التذكرة عند الانتهاء.`)
        .setTimestamp();

      await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
      await interaction.reply({ embeds: [successEmbed('تم فتح التذكرة', `تذكرتك: ${ticketChannel}`)], ephemeral: true });

    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('خطأ', `فشل إنشاء التذكرة: ${err.message}`)], ephemeral: true });
    }
  },

  // معالجة أزرار التذاكر
  async handleButton(interaction) {
    const ticket = getTicket(interaction.channelId);
    if (!ticket) return;

    if (interaction.customId === 'ticket_close') {
      await interaction.reply({ embeds: [{ color: Colors.ERROR, title: '🔒 إغلاق التذكرة', description: 'سيتم إغلاق هذه التذكرة خلال 5 ثوانٍ...' }] });
      updateTicket(interaction.channelId, { status: 'closed' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    if (interaction.customId === 'ticket_claim') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'ليس لديك صلاحية للمطالبة بالتذاكر.', ephemeral: true });
      }
      updateTicket(interaction.channelId, { claimed_by: interaction.user.id });
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      await interaction.reply({ embeds: [successEmbed('Claim', `تم Claim هذه التذكرة من قبل ${interaction.user}`)] });
    }

    if (interaction.customId === 'ticket_transfer') {
      await interaction.reply({ content: '⚙️ ميزة النقل قيد التطوير. يرجى استخدام الأوامر المناسبة.', ephemeral: true });
    }
  },
};
