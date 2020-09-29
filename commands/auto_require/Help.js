const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { formatString, missingPerm, capitalize, traverseObject } = require("../../utils.js");

const { CommandManager } = require("../commands.js");

/**
 * @param {discord.MessageEmbed} embed
 * @param {Command} command
 * @param {Object<String, String>} commandCommonLocale
 */
function fillHelpFields(embed, command, commandCommonLocale) {
    command.subcommands.forEach(
        child => {
            const subCommandsList = [];
            child.subcommands.forEach(
                sub => subCommandsList.push(sub.name)
            );
            embed.addField(
                child.name,
                commandCommonLocale[child.name].__text + "\nChildren: [ " + subCommandsList.join(", ") + " ]"
            );
        }
    );
}

module.exports = class Help extends Command {
    constructor() {
        super("help", "h");
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
        const embed = new discord.MessageEmbed();

        const commandPath = args.join(".");
        const commandHelpLocale = traverseObject(locale.common.descriptions, commandPath);
        const command = CommandManager.getChildByPath(commandPath);

        embed.title = formatString(locale.command.title, capitalize(command.name));
        if (command.subcommands <= 0) {
            embed.description = locale.command.noHelp;
        } else {
            fillHelpFields(embed, command, commandHelpLocale);
        }

        msg.channel.send(embed);
    }
}