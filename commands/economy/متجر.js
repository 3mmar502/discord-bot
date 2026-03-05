// commands/economy/متجر.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { db, getUser, removeCoins } = require('../../database/database');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { Colors } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('متجر')
    .setDescription('عرض متجر السيرفر'),

  async execute(interaction) {
    const items = db.prepare('SELECT * FROM shop_items WHERE guild_id = ?').all(interaction.guildId);

    if (items.length === 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(Colors.ECONOMY)
          .setTitle('🛒 متجر السيرفر')
          .setDescription('المتجر فارغ حالياً. يمكن للمدير إضافة عناصر.')
          .setTimestamp()],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.ECONOMY)
      .setTitle('🛒 متجر السيرفر')
      .setDescription('اختر عنصراً لشرائه من القائمة أدناه')
      .setTimestamp();

    items.forEach((item, i) => {
      embed.addFields({ name: `${i + 1}. ${item.name}`, value: `${item.description}\n💰 **السعر:** ${item.price} عملة`, inline: true });
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('shop_buy')
      .setPlaceholder('🛍️ اختر ما تريد شراءه')
      .addOptions(items.map(item => ({
        label: item.name,
        description: `${item.price} عملة`,
        value: String(item.id),
        emoji: '🛒',
      })));

    const row = new ActionRowBuilder().addComponents(menu);
    const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: 'هذا ليس لك!', ephemeral: true });

      const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(parseInt(i.values[0]));
      if (!item) return i.reply({ embeds: [errorEmbed('خطأ', 'العنصر غير موجود.')], ephemeral: true });

      const success = removeCoins(interaction.user.id, interaction.guildId, item.price);
      if (!success) return i.reply({ embeds: [errorEmbed('رصيد غير كافٍ', `تحتاج ${item.price} عملة.`)], ephemeral: true });

      if (item.role_id) {
        try {
          await interaction.member.roles.add(item.role_id);
        } catch {}
      }

      await i.reply({ embeds: [successEmbed('شراء ناجح', `اشتريت **${item.name}** بـ ${item.price} 🪙 بنجاح!`)], ephemeral: true });
    });
  },
};
