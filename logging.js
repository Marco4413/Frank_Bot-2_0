
const fs = require("fs");
const path = require("path");

const Logger = {
    "output": ""
}

Logger.info = (...msg) => {
    const message = msg.join(" ");
    console.log(message);
    Logger.output += "info : " + message + "\n";
}

Logger.debug = function (...msg) {
    if (process.env.debug_log == "true") {
        const message = msg.join(" ");
        console.debug(message);
        Logger.output += "debug: " + message + "\n";
    }
}

Logger.save = () => {
    const date = new Date();
    const fileName = "log-" + date.toLocaleString() + ".txt";
    fs.writeFileSync(path.resolve("./logs/", fileName.replace(/\/|\\|:|\*|\?|\"|<|>|\|/g, "_")), Logger.output);
}

module.exports = Logger;
