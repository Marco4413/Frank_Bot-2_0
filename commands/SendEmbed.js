const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../database.js");
const { formatString, missingPerm, removeMention } = require("../utils.js");

module.exports = class Sendembed extends Command {
    constructor() {
        super("sendEmbed", "se");
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
        if (args.length <= 0) {
            msg.reply(locale.command.noChannel);
            return;
        }

        const channelID = removeMention(args.shift());
        msg.client.channels.fetch(channelID).then(
            /**
             * @param {discord.TextChannel} channel
             */
            channel => {
                if (channel.type !== "text") {
                    msg.reply(locale.command.noTextChannel);
                    return;
                }

                const permissions = channel.permissionsFor(msg.member);
                if (!permissions.has("SEND_MESSAGES")) {
                    msg.reply(locale.command.noSendPremission);
                    return;
                }

                try {
                    /**
                     * @type {discord.MessageEmbedOptions}
                     */
                    const embedConfig = JSON.parse(args.join(" "));
                    if (embedConfig.timestamp === "auto") {
                        embedConfig.timestamp = new Date();
                    }

                    channel.send(new discord.MessageEmbed(embedConfig));
                    msg.reply(locale.command.sent);
                } catch (error) {
                    msg.reply(locale.command.invalidJSON);
                    return;
                }

            }
        ).catch(
            err => msg.reply(locale.command.invalidChannel)
        );
    }
}