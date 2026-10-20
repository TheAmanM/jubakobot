const {
  SlashCommandBuilder,
  Routes,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
require("dotenv").config(); //to start process from .env file
const token = process.env.BOT_TOKEN;
const guildId = "1005833211420614737";
const clientId = "1005827328951205910";

const commands = [
  //   new ContextMenuCommandBuilder()
  //     .setName("name 1")
  //     .setType(ApplicationCommandType.ChatInput),
  //   new ContextMenuCommandBuilder()
  //     .setName("name 2")
  //     .setType(ApplicationCommandType.ChatInput),
  // .setDescription("Bot replies with your username!"),
  new SlashCommandBuilder()
    .setName("name")
    .setDescription("Sends name 1")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("1")
        .setDescription("Replies with 1!")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("2")
        .setDescription("Replies with 2!")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("subcommand")
        .setDescription("This is a random subcommand!")
    ),
  new SlashCommandBuilder()
    .setName("permissions")
    .setDescription(
      "Used to fetch and modify the permissions of any Discord entity. "
    )
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName("get")
        .setDescription("Used to get permissions. ")
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("user")
            .setDescription("Used to get the permissions of a user. ")
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("bot")
            .setDescription("Used to get the permissions of a bot. ")
        )
    )
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName("set")
        .setDescription("Used to set permissions. ")
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("user")
            .setDescription("Used to set the permissions of a user. ")
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("bot")
            .setDescription("Used to set the permissions of a bot. ")
        )
    ),
  //   new SlashCommandBuilder()
  //     .setName("server")
  //     .setDescription("Replies with server info!"),
  //   new SlashCommandBuilder()
  //     .setName("user")
  //     .setDescription("Replies with user info!"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
