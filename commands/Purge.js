const discord = require("discord.js");
const Command = require("./command.js");
const db = require("../database.js");
const { formatString } = require("../utils.js");

module.exports = class Purge extends Command {
    constructor() {
        super("purge", "p");
    }

    /**
     * @param {Array<String>} args
     * @param {discord.Message} msg
     * @param {Object} locale
     */
    async execute(args, msg, locale) {
        const messagesToDelete = parseInt(args[0]);
        if (messagesToDelete > 100) {
            msg.reply(
                formatString(locale.outOfRange, "100")
            );
        } else {
            await msg.delete();
            await msg.channel.bulkDelete(messagesToDelete);
            const reply = await msg.reply(
                formatString(locale.succesful, args[0])
            );
            reply.delete({
                "timeout": 2000
            });
        }
        return true;
    }
}