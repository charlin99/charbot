const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Usernames = sequelize.define('usernames', {
    discordId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    discordUsername: {
        type: Sequelize.STRING,
        allowNull: true
    },
    retroAchievements: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastAchievementScan: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
    }
});

module.exports = { Usernames, sequelize };