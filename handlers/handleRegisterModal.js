const { MessageFlags } = require('discord.js');
const { Usernames } = require('../databaseConfig');
const { raUsername, raApiKey } = require('../config.json');
const { buildAuthorization, getUserProfile } = require("@retroachievements/api");

module.exports = async function handleRegisterModal(interaction) {
  
    if (interaction.customId !== 'registerRaUsernameModal') return;

    const raUsernameInput = interaction.fields.getTextInputValue('raUsernameInput');

    const authorization = buildAuthorization({ username: raUsername, webApiKey: raApiKey });

    try {
        const userProfile = await getUserProfile(authorization, { username: raUsernameInput });

        try {
            const [user, created] = await Usernames.findOrCreate({
                where: { discordId: interaction.user.id },
                defaults: {
                    discordUsername: interaction.user.username,
                    retroAchievements: raUsernameInput,
                    lastAchievementScan: new Date()
                },
            });

            if (created) {
                console.log(`User [${interaction.user.username} (${interaction.user.id})] registered as RA: ${raUsernameInput}`);
                await interaction.reply({
                    content: `Seu usuário do RetroAchievements (**${raUsernameInput}**) foi registrado com sucesso!`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                if (user.retroAchievements === raUsernameInput) {
                    await interaction.reply({
                        content: `Seu usuário do RetroAchievements (**${raUsernameInput}**) já está registrado.`,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    user.retroAchievements = raUsernameInput;
                    user.discordUsername = interaction.user.username;
                    
                    await user.save();
                    console.log(`User [${interaction.user.username} (${interaction.user.id})] updated RA to: ${raUsernameInput}`);
                    await interaction.reply({
                        content: `Seu usuário do RetroAchievements foi atualizado para **${raUsernameInput}**!`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        } catch (dbError) {
            console.error('Erro ao processar registro/atualização no DB:', dbError);
            if (dbError.name === 'SequelizeUniqueConstraintError') {
                await interaction.reply({
                    content: 'Você já tem um usuário do RetroAchievements registrado! Se deseja mudar, use um comando de atualização (se houver).',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: 'Ocorreu um erro ao registrar seu usuário. Por favor, tente novamente mais tarde.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    } catch (apiError) {
        console.error('Erro ao buscar perfil do RetroAchievements (username inválido ou API):', apiError);
        await interaction.reply({
            content: 'Erro: Não foi possível encontrar este usuário no RetroAchievements. Por favor, verifique o nome de usuário e tente novamente.',
            flags: MessageFlags.Ephemeral
        });
    }
};