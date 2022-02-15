module.exports = {
    name: "readycheck",
    description: "raid readycheck",
    async execute(message, args, MessageEmbed, client, createNewReadycheck=true, isReactionAdded=true, reaction=null, user=null) {
        const MAX_STATICS = 12;
        const EMPTY_CHAR = "\u200b";
        const WRONG_ARGUMENT_MESSAGE = "Error! Missing an argument. Make sure required arguments are provided and that they are in correct order\n ```[announcement channel] [static role] \"optional description\"```";
        // Create new readycheck
        if(createNewReadycheck) {
            console.log("readycheck command provoked!");
            // get announcement channel argument
            let announcementChannel = args.shift();
            if(!announcementChannel.startsWith("<#")) {
                message.channel.send(WRONG_ARGUMENT_MESSAGE);
                return;
            }
            let announcementChannelID = announcementChannel.slice(2,-1);
            announcementChannel = await message.guild.channels.fetch(announcementChannelID);
            // get static role argument
            let staticRole = args.shift();
            if(!staticRole.startsWith("<@")) {
                message.channel.send(WRONG_ARGUMENT_MESSAGE);
                return;
            }
            let staticRoleID = staticRole.slice(3,-1);
            // get optional description argument
            let description = "";
            let descriptionPart = args.shift();
            if (descriptionPart !== undefined) {
                if(descriptionPart[0] != '"') {
                    message.channel.send('Description should start with "');
                    return;
                }
                description = description.concat(descriptionPart.slice(1));
                if(descriptionPart[descriptionPart.length-1] != '"') {
                    while (true) {
                        descriptionPart = args.shift();
                        if(descriptionPart === "undefined") {
                            message.channel.send('Description should end with "');
                            return;
                        }
                        const length = descriptionPart.length;
                        if(descriptionPart[length-1] == '"') {
                            description = description.concat(" " + descriptionPart.slice(0, -1));
                            break;
                        }
                        description = description.concat(" " + descriptionPart);
                    }
                }
            }

            staticRole = await message.guild.roles.fetch(staticRoleID);
            await message.guild.members.fetch();

            let staticMembersID = staticRole.members.map(m=>m.user.id);
            let staticSize = staticMembersID.length;
            let fieldOneValue = "", fieldTwoValue = "";
            let isEven = true;
            for (let i = 0; i < staticSize; i++) {
                let currMember = message.guild.members.cache.get(staticMembersID[i]);
                currValue = "\n❔";
                if(currMember.nickname == null) {
                    currValue += currMember.displayName;
                }
                else {
                    currValue += currMember.nickname;
                }

                if(isEven) fieldOneValue += currValue;
                else fieldTwoValue += currValue;
                isEven = !isEven;
            }

            if(fieldOneValue == "") fieldOneValue = EMPTY_CHAR;
            if(fieldTwoValue == "") fieldTwoValue = EMPTY_CHAR;
            let fieldThreeValue = EMPTY_CHAR;

            let fieldOneName = " Statics (0/" + staticSize.toString() + ")"; 
            let fieldTwoName = EMPTY_CHAR;
            let fieldThreeName = "Substitutes available (0)";

            let title = "Ready check (Static/substitute)";
            let color = staticRole.hexColor;
            let footer = "If reactions don't work, try again when RiseBot is ONLINE";
            let embedDescription = "<@&" + staticRole.id + ">" + " -> React with ✅❌\nSubstitutes -> React with ☑";
            let author = await message.guild.members.fetch(message.author.id);
            let authorNickname = author.nickname;
            let authorIcon = author.displayAvatarURL();

            const embed = new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(embedDescription)
            .setAuthor({name: authorNickname, iconURL: authorIcon})
            .setFooter({text: footer, iconURL: client.user.displayAvatarURL()})
            .addFields(
                {name: fieldOneName, value: fieldOneValue, inline:true},
                {name: fieldTwoName, value: fieldTwoValue, inline:true},
                {name: fieldThreeName, value: fieldThreeValue, inline:false}
            );

            let postedEmbed = await announcementChannel.send({content: description, embeds: [embed]});
            await postedEmbed.react('✅');
            await postedEmbed.react('❌');
            await postedEmbed.react('☑');
            message.delete();
        }
        // Don't create new readycheck, resolve reaction to an already existing readycheck
        else if(!createNewReadycheck) {
            // Check if reacted message is a ready
            await reaction.fetch();
            let reactEmoji = reaction.emoji.name;
            let reactor = await reaction.message.guild.members.fetch(user.id);
            let reactorNickname = reactor.nickname;
            if(reactorNickname == null) {
                reactorNickname = reactor.displayName;
            }
            let readycheckMessage = reaction.message;
            let embed = readycheckMessage.embeds[0];
            let description = embed.description;
            let fields = [embed.fields[0],  embed.fields[1], embed.fields[2]];
            let staticRole = description.split(' ')[0]
            let staticRoleID = staticRole.slice(3,-1);
            staticRole = await reaction.message.guild.roles.fetch(staticRoleID);
            let defaultEmoji = "❔";

            console.log(`Ready check ${reaction.message.id} reaction changed: ${defaultEmoji}`);
            // Reaction was added to message
            if(isReactionAdded) {
                if(reaction.emoji.name == "☑") {
                    if(!reactor.roles.cache.has(staticRoleID)){
                        if(fields[2].value == "\u200b") {
                            fields[2].value = reactorNickname;
                        } else {
                            fields[2].value += "\n" + reactorNickname;
                        }
                        fields[2].name = updateParticipation(fields[2].name, "substitute", 1);

                        let editedEmbed = editEmbed(embed, fields);
                        readycheckMessage.edit({embeds:[editedEmbed]});
                    }
                }

                else if(reaction.emoji.name == "✅") {
                    // If reactor is a static
                    if(reactor.roles.cache.has(staticRoleID)){
                        // If reactor is static and is in list
                        let positionIndex = -1;
                        for(let i=0; i<2; i++) {
                            positionIndex = fields[i].value.indexOf(reactorNickname);
                            if(positionIndex != -1) {
                                fields[i].value = fields[i].value.substring(0, positionIndex - reactEmoji.length) + reactEmoji + fields[i].value.substring(positionIndex);
                                fields[0].name = updateParticipation(fields[0].name, "static", 1);
                                break;
                            }
                        }
                        // TO-DO If reactor is static but not in list
                        if(positionIndex == -1) {
                        }
                    }
                    else {
                        // TO-DO If reactor is not static
                    }
                    let editedEmbed = editEmbed(embed, fields);
                    readycheckMessage.edit({embeds:[editedEmbed]});
                } 
        
                else if (reaction.emoji.name == "❌") {
                    // If reactor is a static
                    if(reactor.roles.cache.has(staticRoleID)){
                        // If reactor is static and is in list
                        let positionIndex = -1;
                        for(let i=0; i<2; i++) {
                            positionIndex = fields[i].value.indexOf(reactorNickname);
                            if(positionIndex != -1) {
                                if(fields[i].value.substring(positionIndex - reactEmoji.length, positionIndex) == "✅") {
                                    fields[0].name = updateParticipation(fields[0].name, "static", -1);
                                }
                                fields[i].value = fields[i].value.substring(0, positionIndex - reactEmoji.length) + reactEmoji + fields[i].value.substring(positionIndex);
                            }
                        }
                        // TO-DO If reactor is static but not in list
                        if(positionIndex == -1) {

                        }           
                    }
                    // TO-DO If reactor is not a static
                    else {
                    }
                    let editedEmbed = editEmbed(embed, fields);
                    readycheckMessage.edit({embeds:[editedEmbed]});
                }

            }
            else if(!isReactionAdded) {
                if(reaction.emoji.name == "☑") {
                    if(fields[2].value.indexOf(reactorNickname) != -1) {
                        fields[2].value = fields[2].value.replace(reactorNickname, "");
                        if(fields[2].value == "") {
                            fields[2].value = "\u200b";
                        }
                        fields[2].name = updateParticipation(fields[2].name, "substitute", -1);
                    }
                }
                else if(reaction.emoji.name == "✅") {

                    let positionIndex = -1;
                    if((positionIndex = fields[0].value.indexOf(reactorNickname)) != -1) {
                        if(fields[0].value.substring(positionIndex - reactEmoji.length, positionIndex) == "✅") {
                            fields[0].name = updateParticipation(fields[0].name, "static", -1);
                        }
                        fields[0].value = fields[0].value.substring(0, positionIndex - reactEmoji.length) + defaultEmoji + fields[0].value.substring(positionIndex);
                    } 
                    else if ((positionIndex = fields[1].value.indexOf(reactorNickname)) != -1) {
                        if(fields[1].value.substring(positionIndex - reactEmoji.length, positionIndex) == "✅") {
                            fields[0].name = updateParticipation(fields[0].name, "static", -1);
                        }
                        fields[1].value = fields[1].value.substring(0, positionIndex - reactEmoji.length) + defaultEmoji + fields[1].value.substring(positionIndex);
                    } else {
                        console.log("Error! Name nout found in statics");
                        return;
                    }
                }
                
                else if(reaction.emoji.name == "❌") {
                    let positionIndex = -1;
                    if((positionIndex = fields[0].value.indexOf(reactorNickname)) != -1) {
                        if(fields[0].value.substring(positionIndex - reactEmoji.length, positionIndex) == "✅") {
                            fields[0].name = updateParticipation(fields[0].name, "static", -1);
                        }
                        fields[0].value = fields[0].value.substring(0, positionIndex - reactEmoji.length) + defaultEmoji + fields[0].value.substring(positionIndex);
                    } 
                    else if ((positionIndex = fields[1].value.indexOf(reactorNickname)) != -1) {
                        if(fields[1].value.substring(positionIndex - reactEmoji.length, positionIndex) == "✅") {
                            fields[0].name = updateParticipation(fields[0].name, "static", -1);
                        }
                        fields[1].value = fields[1].value.substring(0, positionIndex - reactEmoji.length) + defaultEmoji + fields[1].value.substring(positionIndex);
                    } else {
                        console.log("Error! Name nout found in statics");
                        return;
                    }
                }
                
                let editedEmbed = editEmbed(embed, fields);
                readycheckMessage.edit({embeds:[editedEmbed]});
                //readycheckMessage.edit(new MessageEmbed(editedEmbed.embeds[0]));
            }
        }  
    }
}
// edits embed with new values in fields
function editEmbed(embed, fields) {
    embed.setFields(
        {name: fields[0].name, value: fields[0].value, inline:true},
        {name: fields[1].name, value: fields[1].value, inline:true},
        {name: fields[2].name, value: fields[2].value, inline:false}
        );
    return embed;
}
// gets integer number from embed's field names
function updateParticipation(text, type, increment) {
    if(type == "static") {    
        let splitText = text.split("/");
        // get number of ready players
        let digitsReady = splitText[0].match(/\d/g);
        let numberReady = "";
        for(let i=0; i<digitsReady.length; i++) {
            numberReady += digitsReady[i];
        }
        // get number of total players
        let digitsTotal = splitText[1].match(/\d/g);
        let numberTotal = "";
        for(let i=0; i<digitsTotal.length; i++) {
            numberTotal += digitsTotal[i];
        }
        return ("Statics (" + (parseInt(numberReady) + increment).toString() + "/" + numberTotal + ")");
    }    

    else if (type == "substitute") {
        let digitsReady = text.match(/\d/g);
        let numberReady = "";
        for(let i=0; i<digitsReady.length; i++) {
            numberReady += digitsReady[i];
        }
        return ("Substitutes available (" + (parseInt(numberReady) + increment).toString() + ")");
    }
}