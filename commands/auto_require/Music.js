const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../../database.js");
const { formatString, missingPerm } = require("../../utils.js");

const ytdl = require("ytdl-core-discord");
const ytsr = require("ytsr");

/**
 * @typedef {Object} GuildQueue
 * @property {String} nowPlaying - The link to the currently playing song
 * @property {Array<String>} queue - An array of links to all the tracks
 */

/**
 * @type {Object<String, GuildQueue>}
 */
const allQueues = {}

/**
 * @param {String} guildID - The id of the guild
 * @param {Boolean} create - Whether or not to create a new entry on allQueues automatically
 * @returns {GuildQueue} Reference to the queue
 */
function getQueue(guildID, create) {
    if (create && allQueues[guildID] === undefined) {
        allQueues[guildID] = {
            "nowPlaying": undefined,
            "queue": []
        };
    }
    return allQueues[guildID];
}

/**
 * @param {String} guildID - The id of the guild
 * @param {String} link - The link to the song to add
 * @returns {undefined}
 */
function addToQueue(guildID, link) {
    const queue = getQueue(guildID, true);
    queue.queue.push(link);
}

/**
 * @param {String} guildID - The id of the guild
 * @param {discord.VoiceConnection} connection - The bot's connection to the guild
 * @returns {Boolean} Whether or not the bot started a new track
 */
async function nextTrack(guildID, connection) {
    const queue = getQueue(guildID, true);
    queue.nowPlaying = queue.queue.shift();

    if (queue.nowPlaying === undefined) {
        disconnect(connection);
        return false;
    }

    const stream = await ytdl(queue.nowPlaying, { "filter": "audioonly" });
    const dispatcher = connection.play(stream, { "type": "opus" });
    dispatcher.on("finish", () => nextTrack(guildID, connection));

    return true;
}

/**
 * @param {discord.VoiceConnection} connection - The bot's connection to the guild
 * @returns {undefined}
 */
function disconnect(connection) {
    if (connection.dispatcher !== null) {
        connection.dispatcher.on("finish", () => {});
    }

    connection.disconnect();
    const queue = getQueue(connection.channel.guild.id, true);
    queue.nowPlaying = undefined;
}

/**
 * @param {discord.VoiceChannel} voiceChannel - The channel to connect to
 * @returns {Boolean} Whether or not a track started playing
 */
async function joinAndPlay(voiceChannel) {
    const connection = await voiceChannel.join();

    if (connection.dispatcher === null) {
        nextTrack(voiceChannel.guild.id, connection);
        return true;
    }

    return false;
}

// Plays or adds a new song to the queue
class Play extends Command {
    constructor() {
        super("play", "p");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {

        const memberVoice = msg.member.voice;
        const selfVoice = msg.guild.me.voice;
        if (memberVoice.channel === null) {
            msg.reply(locale.command.notConnected);
            return;
        } else if (selfVoice.channel !== null && memberVoice.channelID !== selfVoice.channelID) {
            msg.reply(locale.command.notSameChannel);
            return;
        } else if (!memberVoice.channel.joinable) {
            msg.reply(locale.command.notJoinable);
            return;
        }

        let link = "https://www.youtube.com/watch?v=";

        let search = args[0];
        if (ytdl.validateURL(search)) {
            link = search;
        } else if (ytdl.validateID(search)) {
            link += search;
        } else {
            search = args.join(" ");
            const results = await ytsr(search, {
                "limit": 5
            });

            const vid = results.items[0];
            if (vid === undefined) {
                msg.reply(locale.command.videoNotFound);
                return;
            }

            link = vid.link;
        }

        const info = await ytdl.getBasicInfo(link);
        if (info.videoDetails.length_seconds > 600) {
            msg.reply(formatString(locale.command.tooLong, "10"));
            return;
        }

        addToQueue(msg.guild.id, info.videoDetails.video_url);

        if (await joinAndPlay(memberVoice.channel)) {
            msg.reply(formatString(locale.command.now, info.videoDetails.title));
            return;
        }

        msg.reply(formatString(locale.command.onQueue, info.videoDetails.title));
    }
}

// Skips current song
class Skip extends Command {
    constructor() {
        super("skip", "s");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (msg.guild.me.voice === null) {
            msg.reply(locale.command.notConnected);
            return;
        }
        msg.reply(locale.command.succesful);
        nextTrack(msg.guild.id, msg.guild.me.voice.connection);
    }
}

// Joins and resumes queue
class Join extends Command {
    constructor() {
        super("join", "j");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const queue = getQueue(msg.guild.id, true);
        if (queue.queue.length <= 0) {
            msg.reply(locale.command.emptyQueue);
            return;
        }

        const memberVoice = msg.member.voice;
        const selfVoice = msg.guild.me.voice;
        if (selfVoice.channel !== null) {
            msg.reply(locale.command.alreadyConnected);
            return;
        } else if (memberVoice.channel === null) {
            msg.reply(locale.command.notConnected);
            return;
        } else if (!memberVoice.channel.joinable) {
            msg.reply(locale.command.notJoinable);
            return;
        }

        joinAndPlay(memberVoice.channel);
        msg.reply(locale.command.succesful);
    }
}

// Disconnects if connected to a channel
class Disconnect extends Command {
    constructor() {
        super("disconnect", "dc");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (msg.guild.me.voice === null) {
            msg.reply(locale.command.notConnected);
            return;
        }
        disconnect(msg.guild.me.voice.connection);
        msg.reply(locale.command.succesful);
    }
}

// Lists all elements in the queue
class QueueList extends Command {
    constructor() {
        super("list", "l");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const embed = new discord.MessageEmbed();
        embed.title = formatString(locale.command.title, msg.guild.name);

        const queue = getQueue(msg.guild.id, true);
        if (queue.queue.length <= 0) {
            embed.description = locale.command.empty;
        } else {
            for (let i = 0; i < queue.queue.length; i++) {
                const link = queue.queue[i];
                const info = await ytdl.getBasicInfo(link);
                embed.addField(
                    formatString(locale.command.songName, info.videoDetails.title, info.videoDetails.author.name),
                    formatString(locale.command.description, Math.round(info.videoDetails.lengthSeconds / 60))
                );
            }
        }

        msg.channel.send(embed);
    }
}

// Clears the queue
class QueueClear extends Command {
    constructor() {
        super("clear", "c");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const queue = getQueue(msg.guild.id, true);
        if (queue.queue.length <= 0) {
            msg.reply(formatString(locale.command.nothing, msg.guild.name));
            return;
        }

        queue.queue = [];
        msg.reply(formatString(locale.command.succesful, msg.guild.name));
    }
}

// What's currently being played
class QueueNow extends Command {
    constructor() {
        super("now", "n");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const queue = getQueue(msg.guild.id, true);
        const link = queue.nowPlaying;

        if (link === undefined) {
            msg.reply(locale.command.nothing);
            return;
        }

        const info = await ytdl.getBasicInfo(link);
        msg.reply(formatString(locale.command.playing, info.videoDetails.title));
    }
}

// All commands related to queue management
class Queue extends Command {
    constructor() {
        super("queue", "q", [ new QueueList(), new QueueClear(), new QueueNow() ]);
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (super.execute(args, msg, locale, canShortcut)) {
            return;
        }
    }
}

// The root music command
module.exports = class Music extends Command {
    constructor() {
        super("music", "m", [ new Play(), new Skip(), new Join(), new Disconnect(), new Queue() ]);
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.general - Generic locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (super.execute(args, msg, locale, canShortcut)) {
            return;
        }
    }
}