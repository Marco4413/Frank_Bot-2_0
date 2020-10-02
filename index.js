
const dotenv = require("dotenv");
const fs = require("fs");
if (fs.existsSync(".env")) {
    dotenv.config();
}

const Client = require("./discordClient.js");
const { localization } = require("./localization.js");
const { defaults, database, Guild } = require("./database.js");
const discord = require("discord.js");
const { CommandManager } = require("./commands/commands.js");
const { formatString } = require("./utils.js");
const Logger = require("./logging.js");

let botMention = "<@!{0}>";

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

Client.addEventListener("message", async msg => {
    if (msg.channel.type != "text" && !msg.author.bot) {
        return;
    }

    const [ guildEntry ] = await Guild.findOrCreate({
        "where": {
            "id": msg.guild.id
        },
        "defaults": {
            "id": msg.guild.id
        }
    });

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

        CommandManager.execute(commands, msg, commandLocale, guildEntry.get("shortcuts"));
    }
});

main();
