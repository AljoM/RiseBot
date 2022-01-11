module.exports = {
    name: "recruitment",
    description: "makes interview",
    async execute(message, args) {
        const managementChannelId = "779765250450259989";
        const managementChannel = message.guild.channels.cache.get(managementChannelId);
        const recruitmentMsgId = "924783120924934194";
        const recruitmentMsg = await managementChannel.messages.fetch(recruitmentMsgId);
        
        const recruitmentMessageSize = recruitmentMsg.content.length;
        if (recruitmentMsg.content[0] == "`" && recruitmentMsg.content[1] == "`" && recruitmentMsg.content[2] == "`"
        && recruitmentMsg.content[recruitmentMessageSize - 1] == "`" && recruitmentMsg.content[recruitmentMessageSize - 1 - 1] == "`"
        && recruitmentMsg.content[recruitmentMessageSize - 1 - 2] == "`") {
            //console.log("message is in code format");
            const msg = recruitmentMsg.content.slice(3, -3);
            message.channel.send(msg);     
        } else {
            message.channel.send(recruitmentMsg.content);
        }
    }
}