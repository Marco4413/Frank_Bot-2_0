const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { formatString, missingPerm } = require("../../utils.js");

class Set extends Command {
    constructor() {
        super("set", "s");
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
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
            missingPerm(msg.reply, "ADMINISTRATOR", locale.common);
            return true;
        }

        const newPrefix = args[0];
        if (newPrefix === undefined) {
            msg.reply(locale.command.mustSpecify);
            return true;
        }

        const guild = await db.Guild.findByPk(msg.guild.id);
        guild.set("prefix", newPrefix);
        guild.save();

        msg.reply(formatString(locale.command.succesful, newPrefix));

        return true;
    }
}

class Get extends Command {
    constructor() {
        super("get", "g");
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
        const guild = await db.Guild.findByPk(msg.guild.id);
        const prefix = guild.get("prefix");
        msg.reply(formatString(locale.command.current, prefix));

        return true;
    }
}

module.exports = class Prefix extends Command {
    constructor() {
        super("prefix", "pf", "", [new Set(), new Get()]);
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
        if (await super.execute(args, msg, locale, canShortcut)) {
            return true;
        }

        msg.reply(locale.command.help);

        return true;
    }
}