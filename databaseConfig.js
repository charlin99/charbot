const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const Usernames = sequelize.define('usernames', {
    discord: {
        type: Sequelize.STRING,
        unique: true
    },
    retroAchievements: {
        type: Sequelize.STRING
    },
    lastAchievementScan: {
        type: Sequelize.DATE
    }
});

module.exports = Usernames;