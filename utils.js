
const discord = require("discord.js");

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
 * Sends a message using sender and a default string
 * @param {Function} sender - The function that sends the message
 * @param {String} permission - The premission that is missing
 * @param {Object} locale - The current common locale
 */
exports.missingPerm = (sender, permission, locale) => {
    sender(this.formatString(locale.missingPerm, locale.perms[permission]));
}

