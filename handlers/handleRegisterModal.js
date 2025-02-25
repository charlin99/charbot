const { MessageFlags } = require('discord.js');
const Usernames = require('../databaseConfig');

module.exports = async function handleRegisterModal(interaction) {
  if (interaction.customId !== 'registerRaUsername') return;

  const resposta = interaction.fields.getTextInputValue('raUsernameInput');

  try {
    await Usernames.create({
      discord: interaction.user.username,
      retroachievements: resposta
    });

    console.log(`User [${interaction.user.username}] registered as: ${resposta}`);
    await interaction.reply({
      content: `Successfully registered as ${resposta}!`,
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      try {
        await Usernames.update(
          { retroachievements: resposta },
          { where: { discord: interaction.user.username } }
        );

        console.log(`User [${interaction.user.username}] updated to: ${resposta}`);
        await interaction.reply({
          content: `Updated your RetroAchievements username to ${resposta}!`,
          flags: MessageFlags.Ephemeral
        });
      } catch (updateError) {
        console.error(updateError);
        await interaction.reply({
          content: 'Error updating your username.',
          flags: MessageFlags.Ephemeral
        });
      }
    } else {
      console.error(error);
      await interaction.reply({
        content: 'Error processing registration.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
