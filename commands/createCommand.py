
import sys
from os import path

commandName = sys.argv[1].lower()
fileContents = [
    "const discord = require(\"discord.js\");\n",
    "const Command = require(\"./command.js\");\n",
    "const db = require(\"../database.js\");\n",
    "const { formatString } = require(\"../utils.js\");\n",
    "\n",
    "module.exports = class " + commandName.capitalize() + " extends Command {\n",
    "    constructor() {\n",
    "        super(\"" + commandName + "\");\n",
    "    }\n",
    "\n",
    "    /**\n",
    "     * @param {Array<String>} args - Command's arguments\n",
    "     * @param {discord.Message} msg - The message that triggered the command\n",
    "     * @param {Object} locale - Command's locale\n",
    "     * @param {Boolean} canShortcut - Whether or not shortcuts can be used\n",
    "     * @returns {Promise<Boolean>} Whether or not the command ran succesfully\n",
    "     */\n",
    "    async execute(args, msg, locale, canShortcut) {\n",
    "        \n",
    "    }\n",
    "}"
]

with open(path.join("./" + commandName.capitalize() + ".js"), "w") as file:
        file.writelines(fileContents)
