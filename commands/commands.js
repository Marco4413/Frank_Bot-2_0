
const Command = require("./command");

class CommandManager extends Command {
    constructor() {
        super("__COMMAND_MANAGER", "__C_M", "Home to all commands", []);
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
     * Adds the specified commands to itself
     * @param  {...Command} commands - Commands to be added
     */
    addCommands(...commands) {
        commands.forEach(
            command => this.subcommands.push(command)
        );
    }
}

exports.CommandManager = new CommandManager();

const fs = require("fs");
const path = require("path");

const autoRequireFolder = path.join(__dirname, "auto_require");
const commandsToRequire = fs.readdirSync(autoRequireFolder);
commandsToRequire.forEach(relPath => {
    const Command = require(path.join(autoRequireFolder, relPath));
    exports.CommandManager.addCommands(new Command());
});
