const { buildAuthorization, getUserRecentAchievements } = require("@retroachievements/api");
const { Usernames } = require('../databaseConfig.js');
const { raUsername, raApiKey, achievementChannelId } = require('../config.json');
const { EmbedBuilder } = require('discord.js');

const authorization = buildAuthorization({ username: raUsername, webApiKey: raApiKey });

async function checkNewAchievements(client) {
    console.log(`[${new Date().toLocaleString('pt-BR')}] Iniciando verificação de novas conquistas...`);

    try {
        const achievementChannel = await client.channels.fetch(achievementChannelId).catch(err => {
            console.error(`Erro ao buscar o canal de conquistas com ID ${achievementChannelId}:`, err);
            return null;
        });

        if (!achievementChannel) {
            console.error('O canal de conquistas não foi encontrado ou é inválido. Verifique o achievementChannelId no config.json.');
            return;
        }

        const users = await Usernames.findAll();

        for (const userEntry of users) {
            // Agora estamos usando discordUsername na descrição da embed
            const { retroAchievements, lastAchievementScan, discordUsername } = userEntry;
            // discordId não é mais necessário aqui, pois não estamos enviando DMs

            const sinceTimestamp = lastAchievementScan ? Math.floor(new Date(lastAchievementScan).getTime() / 1000) : undefined;

            try {
                const recentAchievements = await getUserRecentAchievements(authorization, {
                    username: retroAchievements,
                    since: sinceTimestamp
                });

                if (recentAchievements && recentAchievements.length > 0) {
                    console.log(`[Achievement Tracker] Novas conquistas para ${retroAchievements}: ${recentAchievements.length}`);

                    for (const achievement of recentAchievements) {
                        if (sinceTimestamp && new Date(achievement.date).getTime() / 1000 <= sinceTimestamp) {
                            continue;
                        }

                        const achievementEmbed = new EmbedBuilder()
                            .setTitle(`🏆 Nova Conquista: ${achievement.title}`)
                            .setURL(`https://retroachievements.org/achievement/${achievement.id}`)
                            // Usando discordUsername aqui para mostrar quem desbloqueou no Discord
                            .setDescription(`Desbloqueado por **${discordUsername || retroAchievements}** (${retroAchievements}) em ${achievement.gameTitle}!`)
                            .setThumbnail(`https://retroachievements.org/Badge/${achievement.badgeName}.png`)
                            .setColor('#FFD700')
                            .addFields(
                                { name: 'Jogo', value: achievement.gameTitle, inline: true },
                                { name: 'Pontos', value: `${achievement.points} (${achievement.truePoints})`, inline: true }
                            )
                            .setFooter({ text: `Desbloqueado em: ${new Date(achievement.date).toLocaleString('pt-BR')} (UTC)` });

                        await achievementChannel.send({ embeds: [achievementEmbed] }).catch(sendErr => {
                            console.error(`Erro ao enviar mensagem para o canal ${achievementChannelId}:`, sendErr);
                        });
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (apiError) {
                console.error(`[Achievement Tracker] Erro na API do RetroAchievements para ${retroAchievements}:`, apiError);
            }

            userEntry.lastAchievementScan = new Date();
            await userEntry.save().catch(saveErr => {
                console.error(`Erro ao salvar lastAchievementScan para ${retroAchievements}:`, saveErr);
            });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } catch (error) {
        console.error('[Achievement Tracker] Erro geral na verificação de conquistas:', error);
    }
    console.log(`[${new Date().toLocaleString('pt-BR')}] Verificação de conquistas concluída.`);
}

module.exports = { checkNewAchievements };