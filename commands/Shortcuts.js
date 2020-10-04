const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../database.js");
const { formatString, missingPerm } = require("../utils.js");

module.exports = class Shortcuts extends Command {
    constructor() {
        super("shortcuts", "sc");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
            missingPerm(msg.reply, "ADMINISTRATOR", locale.common);
            return;
        }

        const guild = await db.Guild.findByPk(msg.guild.id);
        const shortcutsAllowed = await guild.get("shortcuts");
        guild.set("shortcuts", !shortcutsAllowed);
        guild.save();

        if (shortcutsAllowed) {
            msg.reply(locale.command.off);
        } else {
            msg.reply(locale.command.on);
        }
    }
}