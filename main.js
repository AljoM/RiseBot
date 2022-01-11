const { Client, Intents, Collection } = require("discord.js");
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
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
client.once("ready", () => {
    console.log("RiseBot is ready!");
});

client.on("messageCreate", message=> {
    if(message.author.bot) return;
    if(!message.content.startsWith(PREFIX)) client.commands.get('respond').execute(message, null);
  
    let args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
  
    if(command == "recruitment") client.commands.get("recruitment").execute(message, args);

    else if(command == "interview") client.commands.get("interview").execute(message, args, client);

    else message.channel.send("Command does not exist");
  })

client.login(TOKEN);