
const discord = require("discord.js");

exports.instance = new discord.Client();

/**
 * @type {Object<String, Array>}
 */
const callbacks = {}

/**
 * @template {keyof discord.ClientEvents} K
 * @param {K} event
 * @param {(...args: discord.ClientEvents[K]) => Boolean} callback
 * @returns {discord.Client}
 */
exports.addEventListener = (event, callback) => {

    // If it's the first time we see this event
    if (callbacks[event] === undefined) {
        // Add an array to its key
        callbacks[event] = [];
        // Add main event listener
        exports.instance.on(event, async (...args) => {
            /**
             * The Array with all the callbacks to this event
             * @type {Array<() => Boolean>}
             */
            const eventCallbacks = callbacks[event];
            // For each callback
            for (let i = 0; i < eventCallbacks.length; i++) {
                // Call it and if it returns true
                if (await eventCallbacks[i](...args)) {
                    // Remove it from the array
                    eventCallbacks.splice(i--, 1);
                }
            }
        });
    }

    // Finally add the callback to its array
    callbacks[event].push(callback);

    return exports.instance;
}
