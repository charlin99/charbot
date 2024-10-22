const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { username, webApiKey } = require("../../config.json");

const {
  buildAuthorization,
  getGameExtended,
} = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

const data = new SlashCommandBuilder()
  .setName("achievement")
  .setDescription("Get RA achievement!")
  .addStringOption(option =>
    option.setName("nome-jogo")
          .setDescription("ID do jogo")
          .setRequired(true))
  .addStringOption(option =>
    option.setName("conquista")
          .setDescription("ID do achievement")
          .setRequired(true));
          

async function execute(interaction) {
  try {
    const gameId =  interaction.options.getString("nome-jogo");
    const cheevoId =  interaction.options.getString("conquista");
    const gameExtended = await getGameExtended(authorization, {
      gameId
    });

    if (!gameExtended) {
      throw new Error("Failed to retrieve game information");
    }
    const achievementPic = `https://media.retroachievements.org/Badge/${gameExtended.achievements[cheevoId].badgeName}.png`;
    
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${gameExtended.achievements[cheevoId].title}`)
      .setURL(`https://retroachievements.org/achievement/${cheevoId}`)
      .setAuthor({
        name: "Conquista do RetroAchievements",
        iconURL:
          "https://static.retroachievements.org/assets/images/ra-icon.webp",
        url: "https://retroachievements.org/",
      })
      .setDescription(`*${gameExtended.achievements[cheevoId].description}*`)
      .setThumbnail(achievementPic)
      .addFields(
        {
          name: "**Pontos**",
          value: `${gameExtended.achievements[cheevoId].points} (${gameExtended.achievements[cheevoId].trueRatio})`,
        },
        {
          name: "**Jogo**",
          value: `${gameExtended.title}`,
          inline: true
        },
        {
          name: "**Plataforma**",
          value: `${gameExtended.consoleName}`,
          inline: true
        })
      .setImage(`https://media.retroachievements.org${gameExtended.imageIcon}`);

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    await interaction.reply("Não foi possível obter a conquista.");
  }
}

module.exports = {
  data,
  execute
};