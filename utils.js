
/**
 * 
 * @param {String} str
 * @param  {...String} formats
 */
exports.formatString = (str, ...formats) => {
    formats.forEach((value, i) => {
        str = str.replace("{" + i.toString() + "}", value);
    });
    return str;
}
