const { Events } = require('discord.js');
const handleRegisterModal = require('../handlers/handleRegisterModal');
const handleSlashCommand = require('../handlers/handleSlashCommand');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Verifica se é um modal
    if (interaction.isModalSubmit()) {
      await handleRegisterModal(interaction);
      return;
    }

    // Verifica se é um comando de barra
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    }
  },
};
