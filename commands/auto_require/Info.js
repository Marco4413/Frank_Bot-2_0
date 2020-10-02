const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { createDefaultEmbed, formatString, missingPerm } = require("../../utils.js");

const appInfo = require("../../package.json");

module.exports = class Info extends Command {
    constructor() {
        super("info", "i");
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
        
        embed.title = locale.command.title;

        let contributors = "";
        appInfo.contributors.forEach(
            (contributor, i) => {
                contributors += formatString("<@{0}>:\n{1}{2}", contributor.discordID, locale.command.bulletList, contributor.contribution);
                if (i < appInfo.contributors.length - 1) {
                    contributor += "\n";
                }
            }
        );

        let dependenciesDescription = "";
        Object.keys(appInfo.dependencies).forEach(
            (key, i) => {
                const version = appInfo.dependencies[key];

                if (i > 0) {
                    dependenciesDescription += "\n";
                }

                dependenciesDescription += locale.command.bulletList + key + version;
            }
        );

        embed.addFields(
            [
                {
                    "name": locale.command.name,
                    "value": "Frank Bot 2.0"
                },
                {
                    "name": locale.command.version,
                    "value": appInfo.version
                },
                {
                    "name": locale.command.description,
                    "value": appInfo.description
                },
                {
                    "name": locale.command.author,
                    "value": appInfo.author
                },
                {
                    "name": locale.command.copyright,
                    "value": appInfo.license
                },
                {
                    "name": locale.command.repository,
                    "value": appInfo.repository.url
                },
                {
                    "name": locale.command.contributors,
                    "value": contributors
                },
                {
                    "name": locale.command.dependencies,
                    "value": dependenciesDescription
                }
            ]
        );

        msg.channel.send(embed);
    }
}