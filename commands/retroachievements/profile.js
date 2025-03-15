const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Usernames = require('../../databaseConfig');
const { raUsername, raApiKey } = require('../../config.json');
const { buildAuthorization, getUserProfile, getGame } = require("@retroachievements/api");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Display your RetroAchievements profile on the channel.'),

    async execute(interaction) {
        const authorization = buildAuthorization({ username: raUsername, webApiKey: raApiKey });
        const userInDatabase = await Usernames.findOne({ where: { discord: interaction.user.username } });

        const userProfile = await getUserProfile(authorization, {
            username: userInDatabase.retroAchievements,
          });

        const lastGame = await getGame(authorization, {
            gameId: userProfile.lastGameId
        });

        const profileEmbed = new EmbedBuilder()
            .setTitle(userProfile.user)
            .setDescription(userProfile.motto)
            .setURL("https://retroachievements.org/user/" + userProfile.user)
            .setThumbnail("https://media.retroachievements.org/UserPic/" + userProfile.user + ".png")
            .setAuthor({name: "RetroAchievements profile", iconURL: "https://static.retroachievements.org/assets/images/ra-icon.webp"})
            .addFields(
                { name: 'Member since', value: userProfile.memberSince },
                { name: 'Points 🏆', value: userProfile.totalPoints + " (" + userProfile.totalTruePoints + ")" }
            );

        await interaction.reply({ embeds: [profileEmbed]});
    }
};