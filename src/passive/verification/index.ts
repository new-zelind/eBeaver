import {
    Guild,
    GuildMember, 
    PartialGuildMember, 
    DMChannel,
    Role
} from "discord.js";
import {askString, choose} from "../../lib/prompt";
import approve from "./approve";
import {selectMajor} from "./selection";
import {roomNumbers} from "./majors";

//array of confirmation responses
const buildings: string[] = ["BYRNES", "LEVER"];
const floors: string[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10"];
const valAnswers: string[] = ["Y", "YES", "N", "NO"];

//a function to find an existing role or make a new one
export async function findOrMakeRole(name: string, guild: Guild): Promise<Role>{

    //find the role with the given name. If it doesn't exist, make a new one
    const existingRoles = await guild.roles.fetch();
    const role = existingRoles.cache.find(role => role.name === name);

    return role
        ? Promise.resolve(role)
        : guild.roles.create({data: {name}});
}

export default async function verify(member: GuildMember | PartialGuildMember){
    
    const dm: DMChannel = await member.createDM();

    //greeting message
    dm.send(
        "Hello, and welcome to the Byrnes/Lever Community Discord server! I'm eBeaver, the server moderation bot. Before you gain access to the server, I need to verify who you are."
    );
    
    //get resident's name
    const name = await askString("What is your name? (First name only, please!)", dm);
    dm.send(`Greetings, ${name}.`);
    
    //indeces and strings for college and major
    let major: string, override: boolean;
    let majorInfo: [string, boolean];

    //get resident's major
    do{
        majorInfo = await selectMajor(dm, override);
        major = majorInfo[0];
        override = majorInfo[1];
    }
    while (major === "BACK");

    //make additional variables
    let cuid: string, building: string, floor:string, reason: string;

    //get user's cuid number
    cuid = await askString(
        "Got it. What's your CUID? _(Be sure to include the C!)_",
        dm
    );

    //get user's buidling + validation
    building = await askString(
        "Which building do you live in?",
        dm
    );
    while(!buildings.includes(building.toUpperCase())){
        dm.send("I'm sorry, I can't understand what you said. Try again.");
        building = await askString(
            "Which building do you live in?",
            dm
        );
    }

    //get user's floor number + validation
    floor = await askString(
        `Which floor do you live on in ${building}`,
        dm
    );
    while(!floors.includes(floor)){
        dm.send("I'm sorry, I can't quite understand what you said. Try again.");
        floor = await askString(
            "What is your floor number? (e.g. 6, 9)",
            dm
        );
    }

    //find if the user is a RiSE student or not.
    let riseResponse:string, isRise:boolean;

    riseResponse = await askString(
        "Are you a member of RiSE? (Y/N)",
        dm
    );
    while(!valAnswers.includes(riseResponse.toUpperCase())){
        dm.send("I'm sorry, I couldn't quite understand what you said.");
        riseResponse = await askString(
            "Are you a member of RiSE? (Y/N)",
            dm
        );
    }

    //if an override was requested, get the resident's reason why
    if(override){
        reason = await askString(
            "My records indicate that you either requested an override, or something was incorrect during the process. Please explain below:", 
            dm
        );
    }

    dm.send(
        "Alright, I've got all your info. Sit tight and be sure you read the server rules. Your verification should be approved shortly!"
    );

    //log the verification
    let timestamp = new Date();
    console.log(
        `VERIFIED ${
            member.user.username}#${member.user.discriminator}: ${
            name}, ${building}, ${floor}, ${isRise} ${cuid} at ${timestamp.toLocaleTimeString()}`
    );

    //auto-grant Resident role
    const roles = [await (await findOrMakeRole("Resident", member.guild)).id];
    let majorRole = await findOrMakeRole(major.toUpperCase(), member.guild);
    roles.push(majorRole.id);

    //assign roles for AD and BC side members
    if(building.toUpperCase() === "BYRNES"){
        building = "Byrnes";
        roles.push(
            await (await findOrMakeRole("Byrnes", member.guild)).id
        );
    }
    else{
        building = "Lever";
        roles.push(
            await (await findOrMakeRole("Lever", member.guild)).id
        );
    }

    if(riseResponse === "Y" || riseResponse === "YES"){
        isRise = true;
        roles.push(
            await (await findOrMakeRole("RiSE", member.guild)).id
        )
    }

    //send approval message
    const approved = await approve(
        member, 
        name,
        building,
        floor,
        cuid,
        isRise,
        roles,
        override,
        reason
    );

    //if approved, set the user's nickname and add the roles
    if(approved){
        dm.send(`Welcome to the server, ${name}!`);
        member.setNickname(`${name} | ${building} ${floor}}`);
        member.roles.add(roles);
    }

    //otherwise, generate a new invite link and send it to the user. Kick the user.
    else{
        const invite = await member.guild.channels.cache
            .find((channel) => channel.name === "rules")
            .createInvite({
                reason: `Invite for ${member.user.username}#${member.user.discriminator}`,
                maxUses: 1,
                temporary: true
            });

        dm.send(
            `Your verification was denied. If you believe this was in error, you can try again by joining below and requesting an override. ${invite.url}`
        );
    }
}