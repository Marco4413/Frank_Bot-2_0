const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { formatString, missingPerm } = require("../../utils.js");

const localization = require("../../localization.json");

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
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
            missingPerm(msg.reply, "ADMINISTRATOR", locale.common);
            return;
        }
        
        const newLang = args[0];
        if (newLang === undefined) {
            msg.reply(locale.command.mustSpecify);
            return;
        }

        const newLocale = localization[newLang];
        if (newLocale === undefined) {
            msg.reply(formatString(locale.command.undefined, newLang));
            return;
        }

        const guild = await db.Guild.findByPk(msg.guild.id);
        const currentLang = guild.get("language");
        if (currentLang === newLang) {
            msg.reply(formatString(locale.command.same, newLang));
            return;
        }

        guild.set("language", newLang);
        guild.save();

        msg.reply(formatString(locale.command.succesful, newLang));
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
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const guild = await db.Guild.findByPk(msg.guild.id);
        const currentLang = guild.get("language");
        msg.reply(formatString(locale.command.current, currentLang));
    }
}

module.exports = class Language extends Command {
    constructor() {
        super("language", "lang", [ new Set(), new Get() ]);
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
        if (await super.execute(args, msg, locale, canShortcut)) {
            return;
        }

        msg.reply(locale.command.help);
    }
}