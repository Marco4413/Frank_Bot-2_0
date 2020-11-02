const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../database.js");
const { formatString, missingPerm, removeMention } = require("../utils.js");

/**
 * Parses a user's embed to add more functionality to it
 * @param {discord.Message} msg - The message that requested the embed
 * @param {discord.MessageEmbedOptions} config - The config sent by the user
 * @returns {discord.MessageEmbedOptions} The parsed Embed config
 */
async function parseUserEmbed(msg, config) {
    switch (config.author) {
        case "me": {
            config.author = {};
            config.author.iconURL = msg.author.displayAvatarURL({ "dynamic": true });
            config.author.name = msg.member.displayName;
            break;
        }
        case "guild": {
            config.author = {};
            config.author.iconURL = msg.guild.iconURL({ "dynamic": true });
            config.author.name = msg.guild.name;
            break;
        }
        case "bot": {
            config.author = {};
            config.author.iconURL = msg.guild.me.user.displayAvatarURL({ "dynamic": true });
            config.author.name = msg.guild.me.displayName;
            break;
        }
        default: {
            const authorType = typeof config.author;
            if (authorType === "string") {
                const userID = removeMention(config.author);
                try {
                    const member = await msg.guild.members.fetch(userID);
                    config.author = {};
                    config.author.iconURL = member.user.displayAvatarURL({ "dynamic": true });
                    config.author.name = member.displayName;
                } catch (error) {}
            }
        }
    }

    if (typeof config.footer === "object") {
        switch (config.footer.iconURL) {
            case "me": {
                config.footer.iconURL = msg.author.displayAvatarURL({ "dynamic": true });
                break;
            }
            case "guild": {
                config.footer.iconURL = msg.guild.iconURL({ "dynamic": true });
                break;
            }
            case "bot": {
                config.footer.iconURL = msg.guild.me.user.displayAvatarURL({ "dynamic": true });
                break;
            }
            default: {
                const authorType = typeof config.footer.iconURL;
                if (authorType === "string") {
                    const userID = removeMention(config.footer.iconURL);
                    try {
                        const member = await msg.guild.members.fetch(userID);
                        config.footer.iconURL = member.user.displayAvatarURL({ "dynamic": true });
                    } catch (error) {}
                }
            }
        }
    }

    if (config.timestamp === "auto") {
        config.timestamp = new Date();
    }

    return config;
}

module.exports = class SendEmbed extends Command {
    constructor() {
        super("sendembed", "se");
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
            async channel => {
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
                    const userConfig = JSON.parse(args.join(" "));
                    const embedConfig = await parseUserEmbed(msg, userConfig);

                    await channel.send(new discord.MessageEmbed(embedConfig));
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