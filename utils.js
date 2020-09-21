
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
 * 
 * @param {Function} sender
 * @param {String} permission 
 * @param {Object} locale 
 */
exports.missingPerm = (sender, permission, locale) => {
    sender(this.formatString(locale.missingPerm, locale.perms[permission]));
}

