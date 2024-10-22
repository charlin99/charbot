const { SlashCommandBuilder } = require('discord.js');
const { username, webApiKey } = require('../../config.json');

const { buildAuthorization, getUserProfile } = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

module.exports = {

	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Get RA profile!')
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Nome do perfil')
                .setRequired(true)),
	async execute(interaction) {
        const username = interaction.options.getString('nome');
        const userProfile = await getUserProfile(authorization, { username });

        if (userProfile) {
          await interaction.reply(`RetroAchievements de ${userProfile.user}:
                                    \nPontuação total: ${userProfile.totalPoints}
                                    \nRetroPoints: ${userProfile.totalTruePoints}`);
        } else {
          await interaction.reply('Não foi possível obter o perfil.');
        }        
	},
};