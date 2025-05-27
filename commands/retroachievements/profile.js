const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Usernames } = require('../../databaseConfig');
const { raUsername, raApiKey } = require('../../config.json');
const { buildAuthorization, getUserProfile } = require("@retroachievements/api");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Display your RetroAchievements profile on the channel.'),

    async execute(interaction) {
        const authorization = buildAuthorization({ username: raUsername, webApiKey: raApiKey });

        const userInDatabase = await Usernames.findOne({ where: { discordId: interaction.user.id } });

        if (!userInDatabase) {
            await interaction.reply({ content: 'Você não tem um usuário do RetroAchievements registrado. Use `/register` para registrar!', ephemeral: true });
            return;
        }

        try {
            const userProfile = await getUserProfile(authorization, {
                username: userInDatabase.retroAchievements,
            });

            const memberSinceDate = new Date(userProfile.memberSince);
            const day = String(memberSinceDate.getDate()).padStart(2, '0');
            const month = String(memberSinceDate.getMonth() + 1).padStart(2, '0');
            const year = memberSinceDate.getFullYear();
            const hours = String(memberSinceDate.getHours()).padStart(2, '0');
            const minutes = String(memberSinceDate.getMinutes()).padStart(2, '0');
            const seconds = String(memberSinceDate.getSeconds()).padStart(2, '0');

            const formattedMemberSince = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} (UTC+0)`;

            const profileEmbed = new EmbedBuilder()
                .setTitle(userProfile.user)
                .setDescription(userProfile.motto)
                .setURL("https://retroachievements.org/user/" + userProfile.user)
                .setThumbnail("https://media.retroachievements.org/UserPic/" + userProfile.user + ".png")
                .setAuthor({name: "RetroAchievements profile", iconURL: "https://static.retroachievements.org/assets/images/ra-icon.webp"})
                .addFields(
                    { name: 'Member since', value: formattedMemberSince },
                    { name: 'Points 🏆', value: userProfile.totalPoints + " (" + userProfile.totalTruePoints + ")" }
                )

            await interaction.reply({ embeds: [profileEmbed]});
        } catch (error) {
            console.error('Erro ao buscar perfil do RetroAchievements:', error);
            await interaction.reply({ content: 'Não foi possível buscar seu perfil do RetroAchievements. Verifique se o nome de usuário está correto ou tente novamente mais tarde.', ephemeral: true });
        }
    }
};