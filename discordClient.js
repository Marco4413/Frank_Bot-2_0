
const discord = require("discord.js");

/**
 * The discord client currently in use
 */
exports.instance = new discord.Client();

/**
 * @type {Object<String, Array>}
 */
const callbacks = {}

/**
 * Adds an event listener to the specified event
 * @template {keyof discord.ClientEvents} K
 * @param {K} event - The event to listen to
 * @param {(...args: discord.ClientEvents[K]) => Boolean} listener - The listener for the event
 * @returns {discord.Client} The discord client
 */
exports.addEventListener = (event, listener) => {

    // If it's the first time we see this event
    if (callbacks[event] === undefined) {
        // Add an array to its key
        callbacks[event] = [];
        // Add main event listener
        exports.instance.on(event, async (...args) => {
            /**
             * The Array with all the listeners to this event
             * @type {Array<() => Boolean>}
             */
            const eventCallbacks = callbacks[event];
            // For each listener
            for (let i = 0; i < eventCallbacks.length; i++) {
                // Call it and if it returns true
                if (await eventCallbacks[i](...args)) {
                    // Remove it from the array
                    eventCallbacks.splice(i--, 1);
                }
            }
        });
    }

    // Finally add the listener to its array
    callbacks[event].push(listener);

    return exports.instance;
}
