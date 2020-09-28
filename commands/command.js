
const discord = require("discord.js");

class Command {
    /**
     * @param {String} name - The name of the command
     * @param {String} shortcut - A shortcut for the command
     * @param {String} description - The description of the command
     * @param {Array<Command>} subcommands - Command's subcommands
     */
    constructor(name, shortcut, description, subcommands) {
        this.name = name;
        this.shortcut = shortcut;
        this.description = description === undefined ? "" : description;
        this.subcommands = subcommands === undefined ? [] : subcommands;
    }

    /**
     * Checks if the command should be ran based on the array of string specified
     * @param {Array<String>} commands - The array of strings to check for
     * @param {Boolean} canShortcut - Whether or not the command's shortcut should be checked
     * @returns {Promise<Boolean>} Whether or not the command should be ran
     */
    check(commands, canShortcut) {
        return commands[0] == this.name || (canShortcut && this.shortcut === commands[0]);
    }

    /**
     * If this.check(commands, canShortcut) returns true then it will automatically execute the command
     * @param {Array<String>} commands - Passed to this.check
     * @param {Boolean} canShortcut - Passed to this.check
     * @param {discord.Message} msg - The message that's going to be passed to this.execute
     * @param {Object} locale - The locale that's going to be passed to this.execute
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @returns {Promise<Boolean>} Whether or not the command was ran
     */
    async checkAndRun(commands, canShortcut, msg, locale) {
        if (this.check(commands, canShortcut)) {
            await this.execute(
                commands.slice(1),
                msg,
                locale.command[this.name] === undefined ? locale : { "command": locale.command[this.name], "common": locale.common },
                canShortcut
            );

            return true;
        }
        return false;
    }

    /**
     * By default it runs the checkAndRun function on all subcommands though it should be overridden to add functionality
     * @param {Array<String>} args - Command arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {Promise<Boolean>} Whether or not a sub command was ran
     */
    async execute(args, msg, locale, canShortcut) {
        for (let i = 0; i < this.subcommands.length; i++) {
            const sub = this.subcommands[i];
            if (await sub.checkAndRun(args, canShortcut, msg, locale)) {
                return true;
            }
        }
        return false;
    }
}

module.exports = Command;
