
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

