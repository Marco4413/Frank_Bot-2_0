const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../database.js");
const { formatString, missingPerm, createDefaultEmbed } = require("../utils.js");

module.exports = class Oldest extends Command {
    constructor() {
        super("oldest", "old", [], false);
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

        let members;
        try {
            members = (await msg.guild.members.fetch()).array();
        } catch (err) {
            msg.reply(locale.command.error);
            return;
        }
        
        members.sort(
            (f, s) => f.user.createdTimestamp - s.user.createdTimestamp
        );

        const embed = createDefaultEmbed(msg);
        embed.title = locale.command.title;
        embed.description = locale.command.desc;

        const maxMembers = 10;
        for (let i = 0; i < Math.min(maxMembers, members.length); i++) {
            const member = members[i];
            const date = member.user.createdAt;
            embed.addField(
                member.nickname === null ?
                    formatString(locale.command.userFormat, member.user.username) :
                    formatString(locale.command.userNicknameFormat, member.user.username, member.nickname),
                formatString(locale.command.dateFormat, date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()),
                false
            )
        }
        msg.channel.send(embed);
    }
}