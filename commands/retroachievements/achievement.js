const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { username, webApiKey } = require('../../config.json');

const { buildAuthorization, getGameExtended } = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

module.exports = {

	data: new SlashCommandBuilder()
		.setName('achievement')
		.setDescription('Get RA achievement!'),
	async execute(interaction) {
        const gameExtended = await getGameExtended(authorization, {
            gameId: 11279,
        });
        if (gameExtended) {
            const achievementPic = `https://media.retroachievements.org/Badge/${gameExtended.achievements[284533].badgeName}.png`;
            const embed = new EmbedBuilder()                    
                .setTitle(`🏆 ${gameExtended.achievements[284533].title}`)
                .setURL(`https://retroachievements.org/achievement/284533`)
                .setAuthor({ name: 'Conquista do RetroAchievements', iconURL: 'https://static.retroachievements.org/assets/images/ra-icon.webp', url: 'https://retroachievements.org/' })
                .setDescription(`*${gameExtended.achievements[284533].description}*`)
                .setThumbnail(achievementPic) // Aqui exibimos a imagem da conquista
                .addFields(
                    { name: '**Pontos**', value: `${gameExtended.achievements[284533].points} (${gameExtended.achievements[284533].trueRatio})` },
                    { name: '**Jogo**', value: `${gameExtended.title}` }
                )
                .setImage(`https://media.retroachievements.org${gameExtended.imageIcon}`)
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('Não foi possível obter a conquista.');
        }
    }
}