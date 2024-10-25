const fs = require("node:fs");
const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("registrar")
    .setDescription("Registre seu usuário do RetroAchievements")
    .addStringOption(option =>
        option.setName("usuário")
            .setDescription("Digite o nome de usuário ou deixe vazio para removê-lo"));

async function execute(interaction) {
    const discordUserId = interaction.user.id;
    const raUsername = interaction.options.getString("usuário");
    
    let userlist;

    // Lê o arquivo 'userlist.json' para obter a lista atual
    fs.readFile("userlist.json", (readError, data) => {
        if (readError) {
            if (readError.code === "ENOENT") {
                // Se o arquivo não existe, começa com uma lista vazia
                data = "[]";
            } else {
                interaction.reply("Erro ao ler o arquivo.");
                return;
            }
        }

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
                interaction.reply(`Usuário **${userlist.raUsername}** removido com sucesso.`);
            } else {
                interaction.reply("**ERRO:** Impossível remover um usuário não registrado.");
            }
        } else {
            // Se o usuário já estiver registrado, atualiza o RA
            if (existingUserIndex !== -1) {
                userlist[existingUserIndex].raUsername = raUsername;
                interaction.reply(`Seu usuário do RetroAchievements foi atualizado para: **${raUsername}**.`);
            } else {
                // Se o usuário não estiver registrado, cria um novo registro
                userlist.push({
                    discordId: discordUserId,
                    raUsername: raUsername
                });
                interaction.reply(`Usuário **${raUsername}** registrado com sucesso!`);
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
