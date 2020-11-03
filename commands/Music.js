const discord = require("discord.js");
const Command = require("../command.js");
const db = require("../database.js");
const { createDefaultEmbed, formatString, missingPerm } = require("../utils.js");

const Sequelize = require("sequelize");
const ytdl = require("discord-ytdl-core");
const ytsr = require("ytsr");

/**
 * Stores all songs that the bot is playing on all guilds
 * @type {Object<String, String>}
 */
const nowPlaying = {}

/**
 * @param {String} guildID - The id of the guild
 * @returns {[Array<String>, Sequelize.Model]} The queue and the guild model
 */
async function getQueue(guildID) {
    const guild = await db.Guild.findByPk(guildID);
    return [ guild.get("queue"), guild ];
}

/**
 * @param {String} guildID - The id of the guild
 * @param {String} link - The link to the song to add
 * @returns {undefined}
 */
async function addToQueue(guildID, link) {
    const [ queue, guild ] = await getQueue(guildID);
    queue.push(link);
    // Setting it to null first so that it recognizes that it has changed
    guild.set("queue", null);
    guild.set("queue", queue);
    await guild.save({});
}

/**
 * @param {String} guildID - The id of the guild
 * @param {discord.VoiceConnection} connection - The bot's connection to the guild
 * @returns {Boolean} Whether or not the bot started a new track
 */
async function nextTrack(guildID, connection) {
    const [queue, guild] = await getQueue(guildID);
    if (guild.get("isLooping")) {
        queue.push(queue[0]);
    }
    nowPlaying[guildID] = queue.shift();

    // Setting it to null first so that it recognizes that it has changed
    guild.set("queue", null);
    guild.set("queue", queue);
    await guild.save();

    if (nowPlaying[guildID] === undefined) {
        disconnect(connection);
        return false;
    }
    const stream = ytdl(nowPlaying[guildID], { "filter": "audioonly", "opusEncoded": true });
    const dispatcher = connection.play(stream, { "type": "opus" });
    dispatcher.on("speaking", isSpeaking => {
        if (!isSpeaking) {
            nextTrack(guildID, connection);
        }
    });

    return true;
}

/**
 * @param {discord.VoiceConnection} connection - The bot's connection to the guild
 * @returns {undefined}
 */
function disconnect(connection) {
    if (connection.dispatcher !== null) {
        connection.dispatcher.on("speaking", () => {});
        connection.dispatcher.end(connection.disconnect);
    } else {
        connection.disconnect();
    }

    nowPlaying[connection.channel.guild.id] = undefined;
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
     * @param {Object} locale.common - Common locale
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
            link = search.replace(/<|>/g, "");
        } else if (ytdl.validateID(search)) {
            link += search;
        } else {
            // TODO: UPDATE YTSR ASAP
            msg.reply("For now I can't search videos on YT, because of api changes. Please use links instead.");
            return;

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
        if (info.videoDetails.lengthSeconds > 600) {
            msg.reply(formatString(locale.command.tooLong, "10"));
            return;
        }

        await addToQueue(msg.guild.id, info.videoDetails.video_url);

        const embed = createDefaultEmbed(msg);

        if (await joinAndPlay(memberVoice.channel)) {
            msg.channel.send(
                embed
                    .setTitle(formatString(locale.command.playing, info.videoDetails.title))
                    .setURL(link)
                    .setThumbnail(info.videoDetails.thumbnail.thumbnails[0].url)
                    .setDescription(
                        formatString(
                            "{0}\n{1}\n{2}",
                            formatString(locale.command.author, info.videoDetails.author.name),
                            formatString(locale.command.length, Math.round(info.videoDetails.lengthSeconds / 60)),
                            formatString(locale.command.views, parseInt(info.videoDetails.viewCount).toLocaleString())
                        )
                    )
            );
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
     * @param {Object} locale.common - Common locale
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
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const [ queue, guild ] = await getQueue(msg.guild.id);
        if (queue.length <= 0) {
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
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (msg.guild.me.voice.connection === null) {
            msg.reply(locale.command.notConnected);
            return;
        } else if (msg.guild.me.voice.channel != msg.member.voice.channel) {
            msg.reply(locale.command.notSameChannel);
            return;
        }
        disconnect(msg.guild.me.voice.connection);
        msg.reply(locale.command.succesful);
    }
}

// Loops the queue
class QueueLoop extends Command {
    constructor() {
        super("loop", "lp");
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const guild = await db.Guild.findByPk(msg.guild.id);
        const isLooping = guild.get("isLooping");
        guild.set("isLooping", !isLooping);
        await guild.save();

        msg.reply(isLooping ? locale.command.notLooping : locale.command.looping);
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
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const embed = createDefaultEmbed(msg);
        embed.title = formatString(locale.command.title, msg.guild.name);

        const [ queue, guild ] = await getQueue(msg.guild.id);

        if (queue.length <= 0) {
            embed.description = locale.command.empty;
        } else {
            if (guild.get("isLooping")) {
                embed.description = locale.command.looping;
            }

            for (let i = 0; i < queue.length; i++) {
                const link = queue[i];
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
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const [ queue, guild ] = await getQueue(msg.guild.id);
        if (queue.length <= 0) {
            msg.reply(formatString(locale.command.nothing, msg.guild.name));
            return;
        }

        guild.set("queue", []);
        await guild.save();

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
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        const link = nowPlaying[msg.guild.id];

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
        super("queue", "q", [ new QueueLoop(), new QueueList(), new QueueClear(), new QueueNow() ]);
    }

    /**
     * @param {Array<String>} args - Command's arguments
     * @param {discord.Message} msg - The message that triggered the command
     * @param {Object} locale - Localization
     * @param {Object} locale.command - Command's locale
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (await super.execute(args, msg, locale, canShortcut)) {
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
     * @param {Object} locale.common - Common locale
     * @param {Boolean} canShortcut - Whether or not shortcuts can be used
     * @returns {undefined}
     */
    async execute(args, msg, locale, canShortcut) {
        if (await super.execute(args, msg, locale, canShortcut)) {
            return;
        }
    }
}