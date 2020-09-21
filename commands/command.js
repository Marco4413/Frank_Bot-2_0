
const discord = require("discord.js");

class Command {
    /**
     * @param {String} name
     * @param {Array<Command>} subcommands
     */
    constructor(name, description, subcommands) {
        this.name = name;
        this.description = description === undefined ? "" : description;
        this.subcommands = subcommands === undefined ? [] : subcommands;
    }

    /**
     * @param {Array<String>} commands
     */
    check(commands) {
        return commands[0] == this.name;
    }

    /**
     * @param {Array<String>} commands
     * @param {discord.Message} msg
     * @param {Object} locale
     */
    async checkAndRun(commands, msg, locale) {
        if (this.check(commands)) {
            return await this.execute(commands.slice(1), msg, locale[this.name] === undefined ? locale : locale[this.name]);
        }
        return false;
    }

    /**
     * @param {Array<String>} args
     * @param {discord.Message} msg
     * @param {Object} locale
     */
    async execute(args, msg, locale) {
        for (let i = 0; i < this.subcommands.length; i++) {
            const sub = this.subcommands[i];
            if (await sub.checkAndRun(args, msg, locale[this.name] === undefined ? locale : locale[this.name])) {
                return true;
            }
        }
        return false;
    }
}

module.exports = Command;
