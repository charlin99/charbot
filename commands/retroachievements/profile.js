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
                const memberSinceDate = new Date(userProfile.memberSince);
                const formattedDate = new Intl.DateTimeFormat('pt-BR').format(memberSinceDate);    
                const profilePicUrl = `https://media.retroachievements.org${userProfile.userPic}`
                const embed = new EmbedBuilder()
                    .setTitle(`${userProfile.user}`)
                    .setURL(`https://retroachievements.org/user/${userProfile.user}`)
                    .setAuthor({ name: 'Perfil do RetroAchievements', iconURL: 'https://static.retroachievements.org/assets/images/ra-icon.webp', url: 'https://retroachievements.org/' })
                    .setDescription(`*${userProfile.motto}*`)
                    .setThumbnail(profilePicUrl) // Aqui exibimos a imagem do perfil
                    .addFields(
                        { name: `**Pontuação**`, value: `${userProfile.totalPoints} (${userProfile.totalTruePoints})`, inline: true },
                        { name: `**Membro desde**`, value: `${formattedDate}`, inline: true },
                    )
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply('Não foi possível obter o perfil.');
            }
        }
    }
}