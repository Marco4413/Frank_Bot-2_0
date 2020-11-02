
const discord = require("discord.js");

/**
 * Returns the default reply as an embed to the specified message
 * @param {discord.Message} msg - The message that the embed should be based on
 * @returns {discord.MessageEmbed} The default embed reply to the specified message
 */
exports.createDefaultEmbed = (msg) => {
    return new discord.MessageEmbed(
        {
            "author": {
                "iconURL": msg.author.avatarURL(),
                "name": msg.member.displayName
            },
            "color": "#0000ff",
            "footer": {
                "iconURL": msg.guild.me.user.avatarURL(),
                "text": msg.guild.me.user.username
            },
            "timestamp": new Date()
        }
    );
}

/**
 * Formats the specified string replacing all {n} where n is a number with the corresponding argument
 * @param {String} str - The string to format
 * @param {...String} formats - All formats
 * @returns {String} The formatted string
 */
exports.formatString = (str, ...formats) => {
    formats.forEach((value, i) => {
        str = str.replace("{" + i.toString() + "}", value);
    });
    return str;
}

/**
 * Returns a string which will say that the user doesn't have said permission
 * @param {String} permission - The premission that is missing
 * @param {Object} locale - The current common locale
 * @returns {String} The formatted string
 */
exports.missingPerm = (permission, locale) => {
    return exports.formatString(locale.missingPerm, locale.perms[permission]);
}

/**
 * Makes the first letter of a string uppercase and the remaining lowercase
 * @param {String} str - String to capitalize
 * @returns {String} The capitalized String
 */
exports.capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

/**
 * Traverses an object using the specified path (e.g. ({a: {b: 1}}, "a.b") => 1)
 * @param {Object} object - The object to traverse
 * @param {String} path - The path to follow
 * @returns {any} The value found at the end of the path
 */
exports.traverseObject = (object, path) => {
    let oldReference = object;
    const paths = path.split(".");

    for (let i = 0; i < paths.length; i++) {
        const newRef = oldReference[paths[i]];
        if (newRef === undefined) {
            return oldReference;
        }
        oldReference = newRef;
    }

    return oldReference;
}

/**
 * Removes all mention characters from the specified string
 * @param {String} str - The string to work with
 * @returns {String} The ID that was mentioned
 */
exports.removeMention = (str) => {
    return str.replace(/<|@|!|#|>/g, "");
}
