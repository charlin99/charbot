const fs = require("node:fs");
const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName("registrar")
  .setDescription("Registrar ou remover usuário do RetroAchievements")
  .addStringOption(option =>
    option.setName("usuário")
          .setDescription("Digite o usuário do RetroAchievements ou deixe vazio para remover")
          .setRequired(false)); // Agora o username não é obrigatório

async function execute(interaction) {
    const discordUserId = interaction.user.id; // ID do usuário do Discord
    const raUsername = interaction.options.getString("usuário");

    // Lê o arquivo 'userlist.json' para obter a lista atual
    fs.readFile("userlist.json", (readError, data) => {
        if (readError) {
            if (readError.code === "ENOENT") {
                // Se o arquivo não existe, começamos com uma lista vazia
                data = '[]';
            } else {
                interaction.reply("Erro ao ler o arquivo.");
                return;
            }
        }

        let userlist;
        try {
            userlist = JSON.parse(data); // Transforma os dados JSON em um array
        } catch (parserError) {
            interaction.reply("Erro ao processar a lista de usuários.");
            return;
        }

        // Procura o registro do usuário do Discord
        const existingUserIndex = userlist.findIndex(user => user.discordId === discordUserId);

        if (!raUsername) {
            // Se o username não foi fornecido, remove o usuário da lista
            if (existingUserIndex !== -1) {
                userlist.splice(existingUserIndex, 1); // Remove o usuário
                interaction.reply(`Seu usuário foi removido com sucesso.`);
            } else {
                interaction.reply("Você não está registrado, portanto, nada foi removido.");
            }
        } else {
            // Se o usuário já estiver registrado, atualiza o RA username
            if (existingUserIndex !== -1) {
                userlist[existingUserIndex].raUsername = raUsername;
                interaction.reply(`Seu usuário do RetroAchievements foi atualizado para: ${raUsername}.`);
            } else {
                // Se o usuário não estiver registrado, cria um novo registro
                userlist.push({ discordId: discordUserId, raUsername: raUsername });
                interaction.reply(`Seu usuário do RetroAchievements (${raUsername}) foi registrado com sucesso!`);
            }
        }

        // Converte a lista de volta para JSON formatado
        const newData = JSON.stringify(userlist, null, 2);

        // Escreve a nova lista no arquivo
        fs.writeFile("userlist.json", newData, (writeError) => {
            if (writeError) {
                interaction.reply("Erro ao registrar o usuário.");
                throw writeError;
            }
        });
    });
}

module.exports = {
    data,
    execute
};
