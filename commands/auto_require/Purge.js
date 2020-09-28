const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { formatString, missingPerm } = require("../../utils.js");

module.exports = class Purge extends Command {
    constructor() {
        super("purge", "p");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {Promise<Boolean>} Whether or not the command ran succesfully
     */
    async execute(args, msg, locale, canShortcut) {
        if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
            missingPerm(msg.reply, "MANAGE_MESSAGES", locale.common);
            return true;
        }

        const messagesToDelete = parseInt(args[0]);
        if (Number.isNaN(messagesToDelete)) {
            msg.reply(formatString(locale.command.NaN, args[0]));
            return true;
        }

        if (messagesToDelete < 0) {
            msg.reply(locale.command.onlyPositive);
            return true;
        }

        if (messagesToDelete > 100) {
            msg.reply(
                formatString(locale.command.outOfRange, "100")
            );
        } else {
            await msg.delete();
            await msg.channel.bulkDelete(messagesToDelete);
            const reply = await msg.reply(
                formatString(locale.command.succesful, args[0])
            );
            reply.delete({
                "timeout": 2000
            });
        }
        return true;
    }
}