
const fs = require("fs");
const path = require("path");

exports.Commands = []

const autoRequireFolder = path.join(__dirname, "auto_require");
const commandsToRequire = fs.readdirSync(autoRequireFolder);
commandsToRequire.forEach(relPath => {
    const Command = require(path.join(autoRequireFolder, relPath));
    exports.Commands.push(
        new Command()
    );
});
