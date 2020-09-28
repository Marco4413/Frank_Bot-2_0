
const dotenv = require("dotenv");
const fs = require("fs");
if (fs.existsSync(".env")) {
    dotenv.config();
}

const localization = require("./localization.json");
const { database, Guild } = require("./database.js");
const discord = require("discord.js");
const { Commands } = require("./commands/commands.js");
const { formatString } = require("./utils.js");
const Logger = require("./logging.js");

const Client = new discord.Client();
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
    Client.login(process.env.token);
}

Client.on("ready", () => {
    Logger.info("Bot started at " + (new Date()).toLocaleString());
    botMention = formatString(botMention, Client.user.id);
});

Client.on("message", async msg => {
    if (msg.channel.type != "text" && !msg.author.bot) {
        return;
    }

    const [guildEntry] = await Guild.findOrCreate({
        "where": {},
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
        const noKeyword = startsWithPrefix ? msg.content.substr(prefix.length) : msg.content.substr(botMention.length);
        const formattedMessageContent = noKeyword.trim().replace(/%s%s/g, " ");
        const commands = formattedMessageContent.split(" ");

        for (let i = 0; i < Commands.length; i++) {
            if (await Commands[i].checkAndRun(commands, guildEntry.get("shortcuts"), msg, { "command": localization, "common": localization._common })) {
                break;
            }
        }
    }
});

main();
