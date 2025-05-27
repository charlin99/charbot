const { Usernames, sequelize } = require('./databaseConfig'); // Importe Usernames E sequelize
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');
const cron = require('node-cron'); // Importe o node-cron
const { checkNewAchievements } = require('./tasks/achievementTracker.js'); // O arquivo que criamos

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js'); // Adicione Partials

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages, // Necessário para enviar DMs
        GatewayIntentBits.MessageContent, // Se seu bot interage com conteúdo de mensagens (não parece ser o caso para slash commands)
    ],
    partials: [Partials.Channel], // Necessário para DMs
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    // Sua lógica de eventos aqui
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', async () => {
    console.log(`Pronto! Logado como ${client.user.tag}`);

    // Sincronize o banco de dados aqui no evento 'ready'
    // Em produção, use { force: false } para não apagar os dados a cada reinício
    await sequelize.sync({ force: false });
    console.log('Banco de dados sincronizado.');

    // Agendar a tarefa de verificação de conquistas a cada 1 hora
    cron.schedule('0 * * * *', () => { // "às 0 minutos de cada hora"
        console.log('Executando a verificação de conquistas agendada...');
        checkNewAchievements(client); // Passa o cliente do Discord para a função
    }, {
        timezone: "America/Sao_Paulo" // Defina seu fuso horário
    });

    // Opcional: Executar uma vez ao iniciar o bot para pegar conquistas recentes
    // Sem esperar a primeira hora completa.
    // checkNewAchievements(client);
});

// A lógica para 'interactionCreate' já está em seu arquivo de evento dedicado
// Você não precisa mais do client.on('interactionCreate', ...) aqui,
// já que você tem o events/interactionCreate.js fazendo isso.

client.login(token);