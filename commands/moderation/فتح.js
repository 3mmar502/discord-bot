// commands/moderation/فتح.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('فتح')
    .setDescription('فتح الشات')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(o =>
      o.setName('النطاق')
       .setDescription('ما الذي تريد فتحه؟')
       .setRequired(false)
       .addChoices(
         { name: 'هذا الروم فقط', value: 'this' },
         { name: 'كل الشاتات', value: 'all' },
       )
    ),

  async execute(interaction) {
    const scope = interaction.options.getString('النطاق') || 'this';
    const everyone = interaction.guild.roles.everyone;
    const channels = [];

    if (scope === 'this') {
      channels.push(interaction.channel);
    } else {
      interaction.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText)
        .forEach(c => channels.push(c));
    }

    let count = 0;
    for (const ch of channels) {
      try {
        await ch.permissionOverwrites.edit(everyone, { SendMessages: null });
        count++;
      } catch {}
    }

    await interaction.reply({ embeds: [successEmbed('تم الفتح', `تم فتح **${count}** روم بنجاح. 🔓`)] });
  },
};
