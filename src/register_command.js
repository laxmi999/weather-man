require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "weather",
    description: "Weather info",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("Slash commands were registered successfully.");
  } catch (err) {
    console.log(err);
  }
})();
