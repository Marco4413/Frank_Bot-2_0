
const dotenv = require("dotenv");
const fs = require("fs");
if (fs.existsSync(".env")) {
    dotenv.config();
}

const Client = require("./discordClient.js");
const { localization } = require("./localization.js");
const { defaults, database, Guild } = require("./database.js");
const discord = require("discord.js");
const { CommandManager } = require("./commands.js");
const { formatString } = require("./utils.js");
const Logger = require("./logging.js");

let botMention = "<@!{0}>";
const OWNER_COMMANDS = "__FRANK_BOT__:";

async function main() {
    try {
        await database.authenticate();
        Logger.info("Database was succesfully authenticated!");
    } catch (err) {
        Logger.info("There was an error while authenticating database.");
        Logger.debug(err);
    }
    await database.sync({ "alter": true });
    Client.instance.login(process.env.token);
}

Client.addEventListener("ready", () => {
    Logger.info("Bot started at " + (new Date()).toLocaleString());
    botMention = formatString(botMention, Client.instance.user.id);
});

Client.addEventListener("guildCreate", async guild => {
    await Guild.findOrCreate({
        "where": {
            "id": guild.id
        },
        "defaults": {
            "id": guild.id
        }
    });
});

Client.addEventListener("guildDelete", async guild => {
    await Guild.destroy({
        "where": {
            "id": guild.id
        }
    });
});

Client.addEventListener("message", async msg => {
    if (msg.channel.type != "text" && !msg.author.bot) {
        return;
    }

    const isOwner = msg.member.id === msg.member.guild.ownerID;
    if (isOwner && msg.content.startsWith(OWNER_COMMANDS + "__REMOVE_GUILD_FROM_DATABASE__")) {
        const n = await Guild.destroy({ "where": { "id": msg.guild.id } });
        if (n > 0) {
            msg.reply("Your guild was succesfully removed from the database.");
        }
        return;
    }

    const guildEntry = await Guild.findByPk(msg.guild.id);
    if (guildEntry === null) {
        if (isOwner && msg.content.startsWith(OWNER_COMMANDS + "__ADD_GUILD_TO_DATABASE__")) {
            await Guild.create({ "id": msg.guild.id });
            msg.reply("Your guild was succesfully added to the database.");
        }
        return;
    }

    /**
     * @type {String}
     */
    const prefix = guildEntry.get("prefix");
    const startsWithPrefix = msg.content.startsWith(prefix);
    const startsWithMention = msg.content.startsWith(botMention);
    if (startsWithPrefix || startsWithMention) {
        /**
         * @type {String}
         */
        const language = guildEntry.get("language");
        let locale = localization[language];

        if (locale === undefined) {
            guildEntry.set("language", defaults.language);
            guildEntry.save();

            locale = localization[defaults.language];
        }

        const commandLocale = {
            /**
             * @type {Object<String, String>}
             */
            "command": locale,
            /**
             * @type {Object<String, String>}
             */
            "common": locale._common
        }

        const noKeyword = startsWithPrefix ? msg.content.substr(prefix.length) : msg.content.substr(botMention.length);
        const formattedMessageContent = noKeyword.trim().replace(/%s%s/g, " ");
        const commands = formattedMessageContent.split(" ");

        if (!await CommandManager.execute(commands, msg, commandLocale, guildEntry.get("shortcuts"))) {
            msg.reply(formatString(locale._common.unknownCommand, commands[0]));
        }
    }
});

main();
