
const { Sequelize, DataTypes } = require("sequelize");
const Logger = require("./logging.js");

const database = new Sequelize(process.env.db_name, process.env.db_username, process.env.db_password, {
    "dialect": "postgres",
    "host": process.env.db_host,
    "port": process.env.db_port,
    "logging": Logger.debug
});

const Guild = database.define("Guild", {
    "id": {
        "primaryKey": true,
        "type": DataTypes.STRING,
        "allowNull": false
    },
    "prefix": {
        "type": DataTypes.STRING,
        "allowNull": false,
        "defaultValue": "!"
    }
}, { "timestamps": true });

exports.database = database;
exports.Guild = Guild;
