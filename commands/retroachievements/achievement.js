const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { username, webApiKey } = require("../../config.json");

const {
  buildAuthorization,
  getGameExtended,
  getAchievementUnlocks
} = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

const data = new SlashCommandBuilder()
  .setName("achievement")
  .setDescription("Get RA achievement!")
  .addStringOption(option =>
    option.setName("conquista")
          .setDescription("ID do achievement")
          .setRequired(true));

async function execute(interaction) {
  try {
    const achievementId =  interaction.options.getString("conquista");
    const achievementUnlocks = await getAchievementUnlocks(authorization, {
      achievementId
    });
    const gameId = achievementUnlocks.game.id;
    const gameExtended = await getGameExtended(authorization, {
      gameId
    });

    if (!achievementUnlocks) {
      throw new Error("Failed to retrieve achievement information");
    }
    const achievementPic = `https://media.retroachievements.org/Badge/${gameExtended.achievements[achievementId].badgeName}.png`;
    
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${gameExtended.achievements[achievementId].title}`)
      .setURL(`https://retroachievements.org/achievement/${achievementId}`)
      .setAuthor({
        name: "Conquista do RetroAchievements",
        iconURL:
          "https://static.retroachievements.org/assets/images/ra-icon.webp",
        url: "https://retroachievements.org/",
      })
      .setDescription(`*${gameExtended.achievements[achievementId].description}*`)
      .setThumbnail(achievementPic)
      .addFields(
        {
          name: "**Pontos**",
          value: `${gameExtended.achievements[achievementId].points} (${gameExtended.achievements[achievementId].trueRatio})`,
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