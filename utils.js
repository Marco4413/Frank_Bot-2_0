
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
