import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";
import {client} from "../client";

export default Command({
    names: ["about"],
    documentation:{
        description: "Returns additional information about the bot.",
        group: "META",
        usage: "about"
    },

    check: Permissions.all,

    async exec(message){

        //make a new embed with the following information:
        const embed = makeEmbed(message)
            .setColor("#3A4958")
            .setTitle(`All about ${client.user.tag}:`)
            .setDescription("Nice to meet you.")
            .addFields(
                {
                    name: "Who are you?",
                    value: "Hello. I am eBeaver, a JavaScript application powered by Node.js. I am a moderation bot made for the Byrnes/Lever Community Discord Server."
                },
                {
                    name: "Who made you?",
                    value: "I was made by Zach Lindler, B.S. CIS '21, in the summer of 2020."
                },
                {
                    name: "What do you do?",
                    value: "I the RA Staff's second-in-command. I primarily enforce the rules of the server. However, I have many useful commands that you can use. Try sending `!help` in _#bot-commands_ to see what all I can do."
                },
                {
                    name: "What if I find a bug?",
                    value: "While I assure you that my code is of the superior quality, it is inevitable that something may not go as planned. If you find a bug, please ping `Zach | Lever 7 | RA` and describe what you were doing, as well as what went wrong."
                },
                {
                    name: "Anything else?",
                    value: "I am not the only bot that Zach and Brendan have made. I have two uncles, Vexbot, who was made for the VEX Robotics Teams of South Carolina server, and AutoBLT, who was made for the Byrnes/Lever RA server. My father is ByrnesBot, who works on Zach's floor's Discord server."
                }
            );

        return message.channel.send(embed);
    }
})