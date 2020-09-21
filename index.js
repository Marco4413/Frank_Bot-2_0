
const dotenv = require("dotenv");
const fs = require("fs");
if (fs.existsSync(".env")) {
    dotenv.config();
}

const localization = require("./localization.json");
const { database, Guild } = require("./database.js");
const discord = require("discord.js");
const { Commands } = require("./commands/commands.js");
const Logger = require("./logging.js");

const Client = new discord.Client();

async function main() {
    try {
        await database.authenticate();
        Logger.info("Database was succesfully authenticated!");
    } catch (err) {
        Logger.info("There was an error while authenticating database.");
        Logger.debug(err);
    }
    await database.sync();
    Client.login(process.env.token);
}

Client.on("ready", () => {
    Logger.info("Bot started at " + (new Date()).toLocaleString());

    Logger.save();
});

Client.on("message", async msg => {
    if (msg.channel.type != "text") {
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
    if (msg.content.startsWith(prefix)) {
        const formattedMessageContent = msg.content.substr(prefix.length).trim().replace(/%s%s/g, " ");
        const commands = formattedMessageContent.split(" ");

        for (let i = 0; i < Commands.length; i++) {
            if (await Commands[i].checkAndRun(commands, false, msg, localization)) {
                break;
            }
        }
    }
});

main();
