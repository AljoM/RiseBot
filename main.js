const { Client, Intents, Collection, MessageEmbed, Role } = require("discord.js");
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
});

require("dotenv-flow").config();
const TOKEN = process.env.TOKEN;
const PREFIX = "rb!";

client.commands = new Collection();
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
client.once("ready", async () => {
    console.log("RiseBot is ready!");
});

client.on("messageCreate", message=> {
    try{
      if(message.author.bot) return;
  
      let args = message.content.slice(PREFIX.length).trim().split(/ +/g);
      let command = args.shift().toLowerCase();
    
      if(command == "recruitment") client.commands.get("recruitment").execute(message, args);
  
      else if(command == "interview") client.commands.get("interview").execute(message, args, client);
  
      else if(command == "readycheck" || command == "rc") client.commands.get("readycheck").execute(message, args, MessageEmbed, client, createNewReadyCheck=true);
    } catch(err) {
      console.log(err);
    }
    // Test
  })


client.on("messageReactionAdd", async (reaction, user) => {
  console.log("Some message received a reaction");
  if(reaction.partial) await reaction.fetch();
  if(user.partial) await user.fetch();

  // check if reaction was added to readycheck
  if(reaction.message.author.id == client.user.id && !user.bot && reaction.message.embeds.length > 0 && reaction.message.embeds[0].title.startsWith("Ready check")) {
    await client.commands.get("readycheck").execute(null, null, MessageEmbed, client, createNewReadyCheck=false, isReactionAdded=true, reaction, user);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  console.log("Some message lost a reaction");
  if(reaction.partial) await reaction.fetch();
  if(user.partial) await user.fetch();
  console.log(user.username);
  // check if reaction was removed from readycheck
  if(reaction.message.author.id == client.user.id && !user.bot && reaction.message.embeds.length > 0 && reaction.message.embeds[0].title.startsWith("Ready check")) {
    await client.commands.get("readycheck").execute(null, null, MessageEmbed, client, createNewReadyCheck=false, isReactionAdded=false, reaction, user);
  }
});

client.login(TOKEN);