module.exports = {
    name: "interview",
    description: "makes interview",
    async execute(message, args, client) {
        console.log("Interview command provoked");
        adminRoleId = "682732899874766882";
        if(message.member.roles.cache.some(r => r.id === adminRoleId)) {
          console.log("User has required permissions");
          
          const applicantId = args.shift();
          console.log(applicantId);
          if(!message.guild.members.cache.has(applicantId)) {
            return;
          } 
          const applicant = await message.guild.members.fetch(applicantId);

          const applicationId = "866789313127907340";
          const managementId = "779765250450259989";
          const managementChannel = message.guild.channels.cache.get(managementId);
    
          const channelToClone = message.guild.channels.cache.get(applicationId);
          const interviewChannel = await channelToClone.clone(undefined, true, false, "halo")
          .then(clone => clone.setName("interview_"+applicant.displayName))
          .then(clone => clone.permissionOverwrites.edit(applicant.id, { VIEW_CHANNEL: true}))
          .catch(console.error);

          const msgId = "917737799699013643";
          const msg = await managementChannel.messages.fetch(msgId);
          const msgSize = msg.content.length;
          
          await interviewChannel.send("Hello <@!" + applicantId + "> :blush:\nThank you for applying to Rise! If you would like to see our full recruitment message and what we have to offer use this command: ```rb!recruitment```");
          if (msg.content[0] == "`" && msg.content[1] == "`" && msg.content[2] == "`" && msg.content[msgSize - 1] == "`"
              && msg.content[msgSize - 1 - 1] == "`" && msg.content[msgSize - 1 - 2] == "`") { 
                const finalMsg = msg.content.slice(3, -3);
                interviewChannel.send(finalMsg);    
              }
    
          const thread = await channelToClone.threads.create({
            name: applicant.displayName,
            autoArchiveDuration: 60 * 24,
            reason: "testing",
          });
          thread.send("<@&"+adminRoleId+">\nInfo in <#" + interviewChannel.id + ">");
        }
    }
}