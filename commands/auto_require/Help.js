const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { createDefaultEmbed, formatString, missingPerm, capitalize, traverseObject } = require("../../utils.js");

const { CommandManager } = require("../commands.js");

/**
 * @param {discord.MessageEmbed} embed
 * @param {Array<String>} paths
 * @param {Object<String, String>} locale
 */
function fillHelpEmbed(embed, paths, locale) {
    
    // Get the default help page
    let page = locale.descriptions;
    // Default help name
    let commandName = locale.guild;

    // Crawl through the specified path and update above variables accordingly
    for (let i = 0; i < paths.length; i++) {
        const name = paths[i];
        const thisPage = page.sub[name];
        if (thisPage === undefined) {
            break;
        }
        page = thisPage;
        commandName = name;
    }

    // Sets embed's title and description
    embed.title = formatString(locale.title, capitalize(commandName));
    embed.description = page.desc;

    if (page.sub === undefined) {
        // If there isn't any subcommand then add the noChildren text
        embed.description += "\n" + locale.noChildren;
    } else {
        // Gets all subcommands to the current one
        const subCommands = Object.keys(page.sub);
        if (subCommands.length <= 0) {
            // If there isn't any subcommand then add the noChildren text
            embed.description += "\n" + locale.noChildren;
        } else {
            // For each subcommand add a field for it and display its children names
            subCommands.forEach(subKey => {
                const subCommand = page.sub[subKey];
                embed.addField(
                    subKey,
                    formatString(
                        "{0}\n{1}",
                        subCommand.desc,
                        formatString(
                            locale.children,
                            subCommand.sub === undefined ? "" : Object.keys(subCommand.sub).join(locale.childrenSep)
                        )
                    )
                );
            });
        }
    }
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
        const embed = createDefaultEmbed(msg);

        fillHelpEmbed(embed, args, locale.command);

        msg.channel.send(embed);
    }
}