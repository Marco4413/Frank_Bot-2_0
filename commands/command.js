
const discord = require("discord.js");
const { formatString } = require("../utils.js");

class Command {
    /**
     * @param {String} name - The name of the command
     * @param {String} shortcut - A shortcut for the command
     * @param {Array<Command>} subcommands - Command's subcommands
     */
    constructor(name, shortcut, subcommands=[], autoHelp=true) {
        this.name = name;
        this.shortcut = shortcut;
        this.autoHelp = autoHelp;

        /**
         * @type {Array<Command>}
         */
        this.subcommands = [];
        /**
         * @type {Command}
         */
        this.parent;
        
        this.addChildren(...subcommands);
    }

    /**
     * Checks if the command should be ran based on the array of string specified
     * @param {Array<String>} commands - The array of strings to check for
     * @param {Boolean} canShortcut - Whether or not the command's shortcut should be checked
     * @returns {Boolean} Whether or not the command should be ran
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
     * @param {Object<String, String>} locale.command - Command's locale
     * @param {Object<String, String>} locale.common - Common locale
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
        if (this.autoHelp) {
            msg.reply(formatString(locale.common.genericHelp, this.getPath(" ")));
        }
        return false;
    }

    /**
     * Searches all subcommands and returns the one that meets the requirements
     * @param {Object} filter - The filter
     * @param {String} filter.name - The name of the command to search for
     * @param {String} filter.shortcut - The shortcut of the command to search for
     * @returns {Command} The command that was found (undefined if not found)
     */
    getChildByFilter(filter) {
        for (let i = 0; i < this.subcommands.length; i++) {
            const command = this.subcommands[i];
            if (command.name === filter.name || command.shortcut === filter.shortcut) {
                return command;
            }
        }
    }

    /**
     * Returns the command found at the end of the specified path
     * @param {String} path - The path to follow
     * @returns {Command} The command that was found
     */
    getChildByPath(path) {
        let currentCommand = this;
        const paths = path.split(".");
        for (let i = 0; i < paths.length; i++) {
            const newCommand = currentCommand.getChildByFilter({"name": paths[i]})
            if (newCommand === undefined) {
                return currentCommand;
            }
            currentCommand = newCommand;
        }

        return currentCommand;
    }

    /**
     * Adds the specified commands to its children
     * @param {...Command} children - Commands to be added
     * @returns {Command} this
     */
    addChildren(...children) {
        children.forEach(
            command => {
                this.subcommands.push(command);
                command.parent = this;
            }
        );
        return this;
    }

    /**
     * Gets the path to the current command
     * @param {String} separator - The separator to use between commands' names (e.g. sep="." => "music.queue")
     * @returns {String} The path to this command
     */
    getPath(separator=".") {
        if (this.parent === undefined) {
            return this.name;
        } else {
            const parentName = this.parent.getPath(separator);
            return (parentName === "" ? "" : (parentName + separator)) + this.name;
        }
    }
}

module.exports = Command;
