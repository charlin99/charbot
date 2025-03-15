const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Usernames = require('../../databaseConfig');
const { raUsername, raApiKey } = require('../../config.json');
const { buildAuthorization, getUserProfile } = require("@retroachievements/api");

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

        const profileEmbed = new EmbedBuilder()
            .setTitle(userProfile.user)

        await interaction.reply({ embeds: [profileEmbed]})
    }
};