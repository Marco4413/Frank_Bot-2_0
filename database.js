
const { Sequelize, DataTypes, Model } = require("sequelize");
const Logger = require("./logging.js");

const database = new Sequelize(process.env.db_name, process.env.db_username, process.env.db_password, {
    "dialect": "postgres",
    "host": process.env.db_host,
    "port": process.env.db_port,
    "logging": Logger.debug
});

exports.defaults = {
    "prefix": "!",
    "shortcuts": true,
    "language": "en-us"
}

class Guild extends Model {}
Guild.init({
    "id": {
        "primaryKey": true,
        "type": DataTypes.STRING,
        "allowNull": false
    },
    "prefix": {
        "type": DataTypes.STRING,
        "allowNull": false,
        "defaultValue": exports.defaults.prefix
    },
    "shortcuts": {
        "type": DataTypes.BOOLEAN,
        "allowNull": false,
        "defaultValue": exports.defaults.shortcuts
    },
    "language": {
        "type": DataTypes.STRING,
        "allowNull": false,
        "defaultValue": exports.defaults.language
    }
}, {
    "sequelize": database,
    "timestamps": true
});

exports.database = database;
exports.Guild = Guild;
