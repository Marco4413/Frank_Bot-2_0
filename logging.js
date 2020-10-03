
const fs = require("fs");
const path = require("path");

exports.output = "";

exports.info = (...msg) => {
    const message = msg.join(" ");
    console.log(message);
    exports.output += "info : " + message + "\n";
}

exports.debug = function (...msg) {
    if (process.env.debug_log == "true") {
        const message = msg.join(" ");
        console.debug(message);
        exports.output += "debug: " + message + "\n";
    }
}

exports.save = () => {
    const date = new Date();
    const fileName = "log-" + date.toLocaleString() + ".txt";
    fs.writeFileSync(path.resolve("./logs/", fileName.replace(/\/|\\|:|\*|\?|\"|<|>|\|/g, "_")), exports.output);
}
