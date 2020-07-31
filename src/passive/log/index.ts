import {addMessageHandler} from "../../lib/message";
import {
    TextChannel,
    Guild,
    Message,
} from "discord.js";
import {client} from "../../client";

//RegExp bullshit
function matchAll(str: string, re: RegExp){
    return (str.match(re) || [])
        .map((i) => RegExp(re.source, re.flags).exec(i))
        .filter((j) => j !== null)
}

//Message handler to log every message sent in the server
addMessageHandler(async (message) => {

    //ignore messages in DMs and messages sent by the bot
    if(message.author.bot) return false;
    if(message.channel.type === "dm") return false;
    
    //find and validate the server log channel
    const serverLog = message.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;

    //log each message sent
    serverLog.send(
        `[${message.author.username}#${message.author.discriminator}] in ${message.channel.toString()}:\`${message}\``,
        {
            files: message.attachments.map((attachment) => attachment.url),
            split: true
        }
    );

    return false;
});

//a way to log when messages are updated or edited
client.on("messageUpdate", async (old, current) => {

    //get old and new attributes and content
    if(old.partial) old = await old.fetch();
    if(current.partial) current = await current.fetch();
    if(old.author.bot) return true;
    if(old.channel.type === "dm") return false;

    //find and validate the server log channel
    const serverLog = old.guild?.channels.cache.find(
        (channel) => channel.name === "server-log"
    ) as TextChannel;
    if(!serverLog) return false;

    //send the updated message
    serverLog.send(
        `[${old.author.username}#${old.author.discriminator}] in ${old.channel.toString()}: \`${old.content.toString()}\` => \`${current.content.toString()}\``
    );
});