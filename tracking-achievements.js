const fs = require('fs');
const { username, webApiKey } = require("./config.json");

const {
  getUserRecentlyPlayedGames,
  getGameInfoAndUserProgress,
  buildAuthorization
} = require("@retroachievements/api");

const authorization = buildAuthorization({ username, webApiKey });

async function monitorAchievements(client) {
  const userList = JSON.parse(fs.readFileSync('userlist.json', 'utf8'));

  for (let user of userList) {
    // Verifique se o raUsername está definido
    if (!user.raUsername) {
      console.warn(`Usuário sem nome definido, pulando: ${JSON.stringify(user)}`);
      continue; // Pula para o próximo usuário
    }

    try {
      console.log(`Verificando conquistas para o usuário: ${user.raUsername}`);
      
      // 1. Obter os jogos jogados recentemente pelo usuário
      const recentGamesResponse = await getUserRecentlyPlayedGames(authorization, {
        username : user.raUsername
      });
      const recentGames = recentGamesResponse.data;

      // Adicione verificação para recentGames
      if (!Array.isArray(recentGames) || recentGames.length === 0) {
        console.error(`Erro: recentGames não é um array ou está vazio. Resposta da API:`, recentGamesResponse);
        continue; // Pula para o próximo usuário
      }

      for (let game of recentGames) {
        // 2. Verificar progresso do usuário nas conquistas do jogo
        const progressResponse = await getGameInfoAndUserProgress(authorization, {
            gameId : game.ID,
            username : user.raUsername
        });
        const progressData = progressResponse.data;

        // Obter conquistas previamente salvas para comparar
        const previousAchievements = user.achievements?.[game.gameId] || [];

        // 3. Filtrar novas conquistas
        const newAchievements = progressData.Achievements.filter(ach => ach.DateEarned && !previousAchievements.includes(ach.ID));

        if (newAchievements.length > 0) {
          const channel = client.channels.cache.get("1296639618963472426");

          // Notificar sobre cada nova conquista
          for (let achievement of newAchievements) {
            channel.send(`Parabéns, <@${user.discordId}>! Você conquistou '${achievement.Title}' no jogo '${game.title}'!`);
          }

          // Atualizar conquistas salvas do usuário para o jogo atual
          if (!user.achievements) user.achievements = {};
          user.achievements[game.gameId] = progressData.Achievements.filter(ach => ach.DateEarned).map(ach => ach.ID);
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar conquistas para ${user.raUsername}:`, error);
    }
  }

  // Salvar o estado atualizado dos usuários
  fs.writeFileSync('userlist.json', JSON.stringify(userList, null, 2));
}

module.exports = monitorAchievements;
