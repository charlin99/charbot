const { ActionRowBuilder, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your RetroAchievements username to track your achievements in the bot.'),

	async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('registerRaUsernameModal')
            .setTitle('Register username');

        const usernameInput = new TextInputBuilder()
            .setCustomId('raUsernameInput')
            .setLabel("What's your RetroAchievements username?")
            .setPlaceholder("Enter your RetroAchievements username here.")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
        modal.addComponents(firstActionRow);
		await interaction.showModal(modal);
	},
};