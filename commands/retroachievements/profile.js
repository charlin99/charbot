const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
            if (userProfile) {
                const profilePicUrl = `https://media.retroachievements.org${userProfile.userPic}`
                const embed = new EmbedBuilder()
                    .setTitle(`RetroAchievements de ${userProfile.user}`)
                    .setDescription(`*${userProfile.motto}*
                                    \nPontuação: ${userProfile.totalPoints} (${userProfile.totalTruePoints})
                                    \nMembro desde: ${userProfile.memberSince}`)
                    .setImage(profilePicUrl) // Aqui exibimos a imagem do perfil
                    .setColor('#00FF00'); // Cor opcional
    
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply('Não foi possível obter o perfil.');
            }
        }
    }
}