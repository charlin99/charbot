const fs = require("node:fs");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { username, webApiKey } = require("../../config.json");

const { 
    buildAuthorization,
    getUserProfile
} = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

const data = new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Veja seu perfil do RetroAchievements");

async function execute(interaction) {
    const discordUserId = interaction.user.id; // ID do usuário do Discord

    let userlist;

    // Lê o arquivo 'userlist.json' para obter a lista de usuários registrados
    fs.readFile("userlist.json", (readError, data) => {
        if (readError) {
            interaction.reply("Erro ao ler a lista de usuários.");
            return;
        }

        try {
            userlist = JSON.parse(data); // Transforma os dados JSON em um array
        } catch (parserError) {
            interaction.reply("Erro ao processar a lista de usuários.");
            return;
        }

        // Procura o usuário do RA associado ao ID do Discord
        const user = userlist.find(u => u.discordId === discordUserId);

        if (!user) {
            interaction.reply("Você ainda não registrou seu usuário do RetroAchievements. Use `/registrar [usuário]`.");
            return;
        }

        const raUsername = user.raUsername;

        // Chama a API do RetroAchievements para pegar o perfil do usuário
        getUserProfile(authorization, { username: raUsername })
            .then(userProfile => {
                if (!userProfile) {
                    throw new Error("Não foi possível obter as informações do usuário.");
                }

                const profilePicUrl = `https://media.retroachievements.org${userProfile.userPic}`;

                const memberSinceDate = new Date(userProfile.memberSince);
                memberSinceDate.setHours(memberSinceDate.getHours() - 3); // Fuso horário UTC -3
                const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).format(memberSinceDate); // Formata a data para o padrão brasileiro

                const embed = new EmbedBuilder()
                    .setTitle(`${userProfile.user}`)
                    .setURL(`https://retroachievements.org/user/${userProfile.user}`)
                    .setAuthor({
                        name: "Perfil do RetroAchievements",
                        iconURL: "https://static.retroachievements.org/assets/images/ra-icon.webp",
                        url: "https://retroachievements.org/"
                    })
                    .setDescription(`*${userProfile.motto}*`)
                    .setThumbnail(profilePicUrl)
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

                interaction.reply({ embeds: [embed] });
            })
            .catch(error => {
                interaction.reply("Erro ao buscar o perfil no RetroAchievements.");
        });
    });
}

module.exports = {
    data,
    execute
};
