const { Client, Intents } = require("discord.js");
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

require("dotenv-flow").config();

client.once("ready", () => {
    console.log("RiseBot is ready!");
});

client.login(process.env.TOKEN);