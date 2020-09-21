
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
    "     * @param {Array<String>} args\n",
    "     * @param {discord.Message} msg\n",
    "     * @param {Object} locale\n",
    "     */\n",
    "    async execute(args, msg, locale) {\n",
    "        \n",
    "    }\n",
    "}"
]

with open(path.join("./" + commandName.capitalize() + ".js"), "w") as file:
        file.writelines(fileContents)
