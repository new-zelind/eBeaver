import {
    Guild,
    User,
    TextChannel,
    GuildMember,
    Message,
    PartialMessage
} from "discord.js";
import {makeEmbed} from "../lib/util";
import {client} from "../client";

/**
 * A function to handle a new ban
 * @pre guild.bans = #guild.bans + 1
 *      member.banned == (false -> true)
 * @param guild The guild in which the ban was created
 * @param member The newly-banned member.
 * @post Sends a message in #event-log containing the specifics
 *       of the ban
 */
async function handleBanAdd(
    guild:Guild,
    user:User
):Promise<boolean>{
    const eventLog = guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const entry = await guild
        .fetchAuditLogs({type: "MEMBER_BAN_ADD"})
        .then((logs) => logs.entries.first());
    if(!entry || entry.executor.bot) return false;

    let timestamp = new Date();

    const embed = makeEmbed()
        .setColor("#C8102E")
        .setTitle("NEW BAN ADDED")
        .setImage(user.avatarURL())
        .addFields(
            {name: "User ID", value: user.id},
            {name: "User Name", value: user.username, inline: true},
            {name: "Discriminator", value: user.discriminator, inline: true},
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
            {
                name: "Executor",
                value: `${
                    entry.executor.username}#${
                    entry.executor.discriminator}`
            }
        );

    await eventLog.send(embed);
    return true;
}

/**
 * A function to handle a ban is lifted
 * @pre guild.bans = #guild.bans - 1
 *      member.banned == (true -> false)
 * @param guild The guild in which the ban was lifted
 * @param member The member that had been previously banned
 * @post Sends a message in #event-log containing the specifics
 *       of the ban lift
 */
async function handleBanRemove(
    guild:Guild,
    user:User
):Promise<boolean>{
    const eventLog = guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const entry = await guild
        .fetchAuditLogs({type: "MEMBER_BAN_REMOVE"})
        .then((logs) => logs.entries.first());
    if(!entry || entry.executor.bot) return false;

    let timestamp = new Date();

    const embed = makeEmbed()
        .setColor("#00B2A9")
        .setTitle("BAN REMOVED")
        .setImage(user.avatarURL())
        .addFields(
            {name: "User ID", value: user.id},
            {name: "User Name", value: user.username, inline: true},
            {name: "Discriminator", value: user.discriminator, inline: true},
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
            {
                name: "Executor",
                value: `${
                    entry.executor.username}#${
                    entry.executor.discriminator}`}
        );

    await eventLog.send(embed);
    return true;
}

/**
 * A function to handle when a member leaves a server
 * @pre guild.members = #guild.members - 1
 * @param member The member that just left the server
 * @post Sends a message in #event-log containing the specifics
 *       of the kick, or voluntary exit
 */
async function handleLeave(
    member:GuildMember
):Promise<boolean>{

    const eventLog = member.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    let timestamp = new Date();

    const embed = makeEmbed()
        .setColor("#F6EB61")
        .setTitle("MEMBER REMOVAL")
        .setDescription("Member kicked or left server")
        .setImage(member.user.avatarURL())
        .addFields(
            {name: "User ID", value: member.user.id},
            {name: "User Name", value: member.user.username, inline: true},
            {
                name: "Discriminator",
                value: member.user.discriminator,
                inline: true
            },
            {name: "Timestamp", value: timestamp.toLocaleTimeString()},
        );

    await eventLog.send(embed);
    return true;
}

/**
 * A function to handle an edited message
 * @param old The old version of the message, pre-edit
 * @param current The new message, post-edit
 * @return false if event log or server log channels don't exist in #guild
 *         false if old.author.bot is true
 *         false if the updated message is in a dm
 *         true upon function completion
 */
async function handleMessageUpdate(
    old:PartialMessage | Message,
    current:PartialMessage | Message
):Promise<boolean>{
    //get old and new attributes and content
    if(old.partial) old = await old.fetch();
    if(current.partial) current = await current.fetch();
    if(old.author.bot) return false;
    if(old.channel.type === "dm") return false;

    //find and validate the server log channel
    const serverLog = old.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;

    //send the updated message
    serverLog.send(
        `[${old.author.username}#${
            old.author.discriminator}] in ${
            old.channel.toString()}: ${
            old.content.toString()} => ${
            current.content.toString()}`
    );

    const author:User = old.author;
    const timestamp:Date = new Date();
    const eventLog = old.guild?.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const embed = makeEmbed(old)
        .setColor("#3c1361")
        .setTitle("MESSAGE EDITED")
        .addFields(
            {name: "Username", value: author.username, inline: true},
            {
                name: "Discriminator",
                value: author.discriminator,
                inline: true
            },
            {
                name: "Timestamp",
                value: timestamp.toLocaleTimeString(),
                inline: true
            },
            {name: "In Channel", value: old.channel, inline: true},
            {name: "Old Text:", value: "Text: " + old.content},
            {name: "New Text:", value: "Text: " + current.content},
            {name: "Link", value: current.url}
    );

    eventLog.send(embed);

    return true;
}

/**
 * A function to handle a deleted message
 * @param message The previously deleted message
 * @return false if event log channel is not present in #guild
 *         false if message is in a dm
 *         false if #message.author.id == client.user.id
 *         true upon function completion
 */
async function handleMessageDelete(message:Message):Promise<boolean>{

    if(message.channel.type === "dm") return false;

    const eventLog = message.guild.channels.cache.find(
        channel => channel.name === "event-log"
    ) as TextChannel;
    if(!eventLog) return false;

    const author:User = message.author;
    const timestamp = new Date();

    if(author.id === client.user.id) return false;

    const embed = makeEmbed(message)
        .setColor("#034694")
        .setTitle("MESSAGE DELETED")
        .addFields(
            {name: "Username", value: author.username, inline: true},
            {
                name: "Discriminator",
                value: author.discriminator,
                inline: true
            },
            {
                name: "Timestamp",
                value: timestamp.toLocaleTimeString(),
                inline: true
            },
            {name: "In Channel", value: message.channel},
            {name: "Message Text:", value: "Text: " + message.content},
            {name: "Link (in case of TOS violation)", value: message.url}
    );

    eventLog.send(embed);

    if(message.attachments.array().length > 0){

        eventLog.send("ATTACHMENTS:");

        message.attachments.forEach(attachment => {
            let url:string = attachment.url;
            eventLog.send(url);
        });
    }

    return true;
}

export{
    handleBanAdd,
    handleBanRemove,
    handleLeave,
    handleMessageDelete,
    handleMessageUpdate
};