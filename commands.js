
const Command = require("./command.js");

class CommandManager extends Command {
    constructor() {
        super("__COMMAND_MANAGER", "__C_M", []);
    }

    /**
     * Overload of the parent class, on CommandManager it must always return true
     */
    check(commands, canShortcut) {
        return true;
    }
    
    /**
     * Overload of the parent class, on CommandManager it must always run all subcommands
     * @param {Array<String>} commands - Passed to this.check
     * @param {Boolean} canShortcut - Passed to this.check
     * @param {discord.Message} msg - The message that's going to be passed to this.execute
     * @param {Object} locale - The locale that's going to be passed to this.execute
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @returns {Promise<Boolean>} Whether or not the command was ran
     */
    async checkAndRun(commands, canShortcut, msg, locale) {
        await this.execute(
            commands,
            msg,
            locale,
            canShortcut
        );

        return true;
    }

    /**
     * Overload of the parent class, on CommandManager it must return an empty string
     * @param {String} separator - The separator to use between commands' names (e.g. sep="." => "music.queue")
     * @returns {String} The path to this command
     */
    getPath(separator=".") {
        return "";
    }
}

exports.CommandManager = new CommandManager();

const fs = require("fs");
const path = require("path");

const autoRequireFolder = path.join(__dirname, "commands");
const commandsToRequire = fs.readdirSync(autoRequireFolder);
commandsToRequire.forEach(relPath => {
    const Command = require(path.join(autoRequireFolder, relPath));
    exports.CommandManager.addChildren(new Command());
});
