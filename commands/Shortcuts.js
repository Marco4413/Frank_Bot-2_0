const discord = require("discord.js");
const Command = require("./command.js");
const db = require("../database.js");
const { formatString } = require("../utils.js");

module.exports = class Shortcuts extends Command {
    constructor() {
        super("shortcuts", "sc");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Command's locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {Promise<Boolean>} Whether or not the command ran succesfully
     */
    async execute(args, msg, locale, canShortcut) {
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
            msg.reply(locale.noPerms);
            return true;
        }

        const guild = await db.Guild.findByPk(msg.guild.id);
        const shortcutsAllowed = await guild.get("shortcuts");
        guild.set("shortcuts", !shortcutsAllowed);
        guild.save();

        if (shortcutsAllowed) {
            msg.reply(locale.off);
        } else {
            msg.reply(locale.on);
        }

        return true;
    }
}