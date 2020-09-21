const discord = require("discord.js");
const Command = require("./command.js");
const db = require("../database.js");
const { formatString } = require("../utils.js");

module.exports = class Purge extends Command {
    constructor() {
        super("purge", "p");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Command's locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {Promise<Boolean>} Whether or not the command ran succesfully
     */
    async execute(args, msg, locale, canShortcut) {
        if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
            msg.reply(locale.noPerms);
            return true;
        }

        const messagesToDelete = parseInt(args[0]);
        if (Number.isNaN(messagesToDelete)) {
            msg.reply(formatString(locale.NaN, args[0]));
            return true;
        }

        if (messagesToDelete < 0) {
            msg.reply(locale.onlyPositive);
            return true;
        }

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