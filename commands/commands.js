
exports.Commands = [
    new (require("./Prefix.js"))(),
    new (require("./Shortcuts.js"))(),
    new (require("./Purge.js"))()
]
