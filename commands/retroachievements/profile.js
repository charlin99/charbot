const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { username, webApiKey } = require("../../config.json");

const { 
    buildAuthorization,
    getUserProfile
} = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

const data = new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Get RA profile!")
    .addStringOption(option =>
        option.setName("nome")
                .setDescription("Nome do perfil")
                .setRequired(true));

async function execute(interaction) {
    try {
        const username = interaction.options.getString("nome");
        const userProfile = await getUserProfile(authorization, {
            username
        });

        if (!userProfile) {
            throw new Error("Failed to retrieve user information");
        }

        const profilePicUrl = `https://media.retroachievements.org${userProfile.userPic}`;

        const memberSinceDate = new Date(userProfile.memberSince);
        memberSinceDate.setHours(memberSinceDate.getHours() - 3); // Fuso horário UTC - 3
        const formattedDate = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(memberSinceDate); // Formata pro padrão brasileiro

        const embed = new EmbedBuilder()
                .setTitle(`${userProfile.user}`)
                .setURL(`https://retroachievements.org/user/${userProfile.user}`)
                .setAuthor({
                    name: "Perfil do RetroAchievements",
                    iconURL: "https://static.retroachievements.org/assets/images/ra-icon.webp",
                    url: "https://retroachievements.org/"
                })
                .setDescription(`*${userProfile.motto}*`)
                .setThumbnail(profilePicUrl) // Aqui exibimos a imagem do perfil
                .addFields({
                        name: "**Pontuação**",
                        value: `${userProfile.totalPoints} (${userProfile.totalTruePoints})`,
                        inline: true
                    },
                    {
                        name: "**Membro desde**",
                        value: `${formattedDate}`,
                        inline: true
                    });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply("Não foi possível obter o perfil.");
    }
}

module.exports = {
    data,
    execute
};