
const fs = require("fs");
const path = require("path");

const localePaths = fs.readdirSync("./localization");

exports.availableLocales = [];
exports.localization = {};

localePaths.forEach(
    localePath => {
        const localeName = localePath.replace(/^(.*)\.json$/g, "$1");
        exports.availableLocales.push(localeName);

        const fullPath = path.join(__dirname, "localization", localePath);
        exports.localization[localeName] = require(fullPath);
    }
);
