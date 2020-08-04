import * as Discord from "discord.js";
import {
    handleBanAdd,
    handleBanRemove,
    handleLeave,
    handleMessageDelete,
    handleMessageUpdate
} from "./passive/events";
import {handleMessage, addMessageHandler} from "./lib/message";
import verify from "./passive/verification";
import {client} from "./client";
import {setTimeoutCounts} from "./lib/timeout";
import {handle, isCommand, RESPONSES} from "./lib/command";
import "./cmd";
import "./passive/log/index";
import "./passive/events";

//on startup
client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);

    //initialize timeoutCounts structure on startup
    setTimeoutCounts();

    //ignore bot messages
    addMessageHandler((message) => message.author.bot);

    //handle commands
    addMessageHandler(handle);

    client.user.setActivity("over the server", {type: "WATCHING"});
});

//verify each member upon entry
client.on("guildMemberAdd", (member: Discord.GuildMember) => {
    console.log(
        `AUTO-VERIFY ${member.user.username}#${member.user.discriminator}.`
    );
    verify(member);
});

//handle kicks or members leaving
client.on("guildMemberRemove", async (member: Discord.GuildMember) => {
    return await handleLeave(member);
})

//handle messages appropriately
client.on("message", handleMessage);

client.on("messageUpdate", async (old, current) => {
    
    //ignore bot messages
    if(old.author?.bot) return false;

    //delete old command and update
    if(isCommand(old) && RESPONSES.has(old)) RESPONSES.get(old)?.delete();
    return (await handleMessageUpdate(old, current) && handle(current));
});

client.on("messageDelete", async (message:Discord.Message) => {
    return await handleMessageDelete(message);
})

//handle banhammers
client.on("guildBanAdd", async (guild:Discord.Guild, user:Discord.User) => {
    return await handleBanAdd(guild, user);
});

//Handle unbannings
client.on("guildBanRemove", async (guild:Discord.Guild, user:Discord.User) => {
    return await handleBanRemove(guild, user);
});

//error handling
//bot will be running on local machine, so just send it to the console
process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);