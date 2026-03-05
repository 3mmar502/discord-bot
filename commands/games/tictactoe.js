// commands/games/tictactoe.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Colors } = require('../../utils/embeds');
const { addCoins } = require('../../database/database');

function checkWinner(board) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? 'draw' : null;
}

function buildBoard(board, disabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const val = board[idx];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${idx}`)
          .setLabel(val || '⬜')
          .setStyle(val === '❌' ? ButtonStyle.Danger : val === '⭕' ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(disabled || !!val)
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('العب XO مع شخص آخر')
    .addUserOption(o => o.setName('المنافس').setDescription('منافسك').setRequired(true)),

  async execute(interaction) {
    const opponent = interaction.options.getMember('المنافس');
    if (opponent.id === interaction.user.id || opponent.user.bot) {
      return interaction.reply({ content: 'اختر منافساً صالحاً!', ephemeral: true });
    }

    const board = Array(9).fill(null);
    let currentPlayer = interaction.user.id;
    const players = { [interaction.user.id]: '❌', [opponent.id]: '⭕' };

    const embed = new EmbedBuilder()
      .setColor(Colors.GAME)
      .setTitle('🎮 XO - Tic Tac Toe')
      .setDescription(`دور: ${interaction.user} (❌)`);

    const reply = await interaction.reply({
      embeds: [embed],
      components: buildBoard(board),
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({ time: 120000 });

    collector.on('collect', async i => {
      if (i.user.id !== currentPlayer) return i.reply({ content: 'ليس دورك!', ephemeral: true });

      const idx = parseInt(i.customId.replace('ttt_', ''));
      board[idx] = players[currentPlayer];

      const winner = checkWinner(board);
      if (winner) {
        const isDraw = winner === 'draw';
        const embed = new EmbedBuilder()
          .setColor(isDraw ? Colors.INFO : Colors.SUCCESS)
          .setTitle(isDraw ? '🤝 تعادل!' : `🏆 فاز ${players[currentPlayer] === '❌' ? interaction.user.username : opponent.user.username}!`);
        await i.update({ embeds: [embed], components: buildBoard(board, true) });
        if (!isDraw) addCoins(currentPlayer, interaction.guildId, 50);
        return collector.stop('done');
      }

      currentPlayer = currentPlayer === interaction.user.id ? opponent.id : interaction.user.id;
      const nextUser = currentPlayer === interaction.user.id ? interaction.user : opponent.user;
      embed.setDescription(`دور: ${nextUser} (${players[currentPlayer]})`);
      await i.update({ embeds: [embed], components: buildBoard(board) });
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'done') reply.edit({ components: buildBoard(board, true) }).catch(() => {});
    });
  },
};
