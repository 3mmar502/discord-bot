// events/interactionCreate.js
const { ticketHandler } = require('../handlers/ticketHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    const client = interaction.client;

    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`خطأ في الأمر ${interaction.commandName}:`, err);
        const msg = { content: '❌ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg).catch(() => {});
        } else {
          await interaction.reply(msg).catch(() => {});
        }
      }
    }

    // Button Interactions
    if (interaction.isButton()) {
      // أزرار التذاكر
      if (['ticket_close', 'ticket_claim', 'ticket_transfer'].includes(interaction.customId)) {
        const ticketCmd = require('../commands/tickets/تذكرة');
        await ticketCmd.handleButton(interaction).catch(err => {
          console.error('خطأ في زر التذكرة:', err);
        });
      }
    }

    // Select Menu Interactions (معالجة في الأوامر نفسها)
    if (interaction.isStringSelectMenu()) {
      // معالجة في الأوامر المعنية
    }
  },
};
