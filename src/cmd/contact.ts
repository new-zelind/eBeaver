import Command, {Permissions} from "../lib/command";
import {makeEmbed} from "../lib/util";

export default Command ({
    names: ["contact"],
    documentation: {
        description: "Returns important contact information.",
        group: "GENERAL",
        usage:"contact",
    },

    check: Permissions.all,

    exec(message){

        //make an embed with the following information:
        const embed = makeEmbed(message)
            .setColor("522D80")
            .setTitle("Contact Information")
            .setDescription("Here's a list of all important contact information.")
            .addFields(
                {name: "Byrnes RA On Call", value: "864.986.1111"},
                {name: "Lever RA On Call", value: "864.986.1113"},
                {name: "Redfern Health Center", value: "864.656.2233"},
                {name: "CCIT", value: "864.656.3494"},
                {name: "Maintenance", value: "864.656.5450"},
                {name: "CAPS On-Call / CUPD", value: "864.656.2222"},
                {name: "Taylor Hanley, Byrnes/Lever Director", value: "tahanle@clemson.edu"},
                {name: "Noah Harrier-Burks, Lever Graduate Director", value: "nharrie@clemson.edu"},
                {name: "Pamela Ianiro, Lever Graduate Director", value: "pianiro@clemson.edu"}
            );

        return message.channel.send(embed);
    },
});
