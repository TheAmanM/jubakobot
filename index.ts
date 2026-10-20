import "dotenv/config";
import {
  Client,
  Guild,
  GuildMember,
  Intents,
  Message,
  MessageEmbed,
} from "discord.js";
import {
  cleanMentionedUserID,
  Game,
  gameData,
  gameTileLinks,
  OperationResult,
  playerData,
  playerSearch,
} from "./jubako.js";
const client = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

const botPrefix: string = "=";
const botColor: any = "0xC0031B";

function sendHelpMessage(message: Message): void {
  const helpEmbed = new MessageEmbed()
    .setTitle("Welcome to Jubakobot!")
    .setColor(botColor)
    .setThumbnail(
      "https://discord.com/assets/6f26ddd1bf59740c536d2274bb834a05.png"
    )
    .setDescription(
      "As long as you can remember, you have had a passion for food. The art of stacking, layering, and the architecture of various cruisines, a commoner would only be able to describe as 'presentation'. You have decided to take your expertise to one of the best Japanese restaurants the world has to offer. A difficult cuisine, at a high class restaurant. Do you have what it takes to accurately transmit the Japanese cultural values to the end consumer?\n\nType **=game** to see all game related commands or **=game start** to begin a new game. Alternatively, type **=rules** to learn about the game rules. "
    )
    .setTimestamp(new Date().getTime());
  console.log(`[Help] Invoked by ${message.author.tag}`);
  message.channel.send({ embeds: [helpEmbed] });
}

function handleInfo(message: Message): void {
  const infoEmbed = new MessageEmbed()
    .setTitle("Info")
    .setColor(botColor)
    .setDescription(
      "Jubakobot is based on a board game by Michael Kiesling & Wolfgang Kramer, called Jubako. \n"
    )
    .setThumbnail(
      "https://discord.com/assets/6f26ddd1bf59740c536d2274bb834a05.png"
    )
    .addFields(
      { name: "Project Name", value: "Jubakobot", inline: true },
      { name: "Creator", value: "YheetBoi", inline: true },
      { name: "Bot Version", value: "0.1.0", inline: true }
    )
    .setTimestamp(new Date().getTime());
  console.log(`[Info] Invoked by ${message.author.tag}`);
  message.channel.send({ embeds: [infoEmbed] });
}

client.once("ready", () => {
  console.log(`[Discord] Client logged in: ${client.user?.tag}`);
  client.user?.setActivity("@Jubakobot to start!", {
    type: 0,
    name: "@Jubakobot to start!",
  });
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.id === client.user?.id) return;
  if (message.mentions.has(client.user?.id!)) {
    sendHelpMessage(message);
    return;
  } else {
    if (message.content[0] === botPrefix) {
      let args = message.content.substring(1).split(" ");
      const command = args.shift();
      if (command === "info") {
        handleInfo(message);
      } else if (command === "game") {
        const command = args.shift();
        if (command === "create") {
          if (gameData.get(message.author.id) != undefined) {
            message.channel.send(
              "Error: You have already made a game! To delete your game, type **=game delete**. "
            );
            return;
          }
          let game = new Game(message.author.id, message.author.tag);
          gameData.set(message.author.id, game);
          console.log(`[Game] ${message.author.tag} created game`);
          message.channel.send(
            `A new game has successfully been created! You can invite players by typing **=game invite <user_id>** or **=game invite <@User>**. `
          );
          // TODO: Make a nice looking embed out of this.
          return;
        } else if (command === "delete") {
          const game: Game | undefined = gameData.get(message.author.id);
          if (game == undefined) {
            message.channel.send(
              "Error: You have not created a game! To create a game, type **=game create**. "
            );
            return;
          }
          game.players.forEach((playerID: string) => {
            playerData.delete(playerID);
          });
          gameData.delete(message.author.id);
          message.channel.send("You have successfully deleted your game!");
          return;
        } else if (command === "invite") {
          let game = gameData.get(message.author.id);
          if (game == undefined) {
            message.channel.send(
              "Error: You have not created a game! To create a game, type **=game create**. "
            );
            return;
          }
          if (args[0] == undefined) {
            message.channel.send(
              "Error: No user specified! To invite a player, type **=game invite <user_id>**. "
            );
            return;
          }
          const userName = await playerSearch({
            client: client,
            userID: cleanMentionedUserID(args[0]),
            guildID: message.guildId!,
          });
          const result: OperationResult = game.invitePlayer({
            playerID: args[0],
            clientID: client.user?.id!,
            playerUsername: userName,
          });
          message.channel.send(result.message);
          return;
        } else if (command === "join") {
          if (args[0] == undefined) {
            message.channel.send(
              "Error: No game ID specified! To join a game, type **=game join <game_id>** or **=game join <@GameCreator>**. "
            );
            return;
          }
          let game = gameData.get(cleanMentionedUserID(args[0]));
          if (game == undefined) {
            message.channel.send(
              "Error: The game you specified does not exist!"
            );
            return;
          }
          if (game.getGameOwnerID === message.author.id) {
            message.channel.send("Error: You can not join your own game!");
            return;
          }
          const result = game.joinGame({
            userID: message.author.id,
            gameOwnerID: args[0],
            userName: message.author.tag,
          });
          message.channel.send(result.message);
        } else if (command === "start") {
          if (!gameData.has(message.author.id)) {
            message.channel.send(
              `Error: You have not created a game! To create a game, type **=game create**.`
            );
            return;
          }
          const result = gameData.get(message.author.id)?.startGame();
          message.channel.send(result?.message!);
          return;
        }

        // Create game loop
        let gameObject = gameData.get(playerData.get(message.author.id)!);
        let playerTiles = 0;
        gameObject?.playersData.forEach((board) => {
          playerTiles += board.tiles.length;
        });
        while (
          gameObject!.hiddenTilesCount +
            gameObject!.shownTilesCount +
            playerTiles >
          0
        ) {
          gameObject?.nextRound();
          gameObject?.players.forEach((player) => {
            client.users.fetch(player).then(async (user) => {
              user.send("It is currently your turn!");
              const tileSelectionMessage = await user.send(
                "Pick a tile, or draw one if available!"
              );
              await tileSelectionMessage.react(":one:");
              await tileSelectionMessage.react(":two:");
              await tileSelectionMessage.react(":three:");
              await tileSelectionMessage.react(":four:");
              tileSelectionMessage
                .awaitReactions({
                  filter: (reaction, user) => {
                    return (
                      [""].includes(reaction.emoji.name!) && user.id === player
                    );
                  },
                })
                .then(() => {});
            });
          });
          // Player must pick tile, if available
        }
      } else if (command === "test") {
        console.log(gameTileLinks.get(args[0]));
        //! This is a test
        const embed = new MessageEmbed()
          .setTitle("Test Embed")
          .setDescription(
            "This is a test embed to check whether local images can be shown"
          )
          .setImage(`${gameTileLinks.get(args[0])}`)
          .setTimestamp(new Date().getTime());
        const altEmbed = new MessageEmbed().setImage(
          `${gameTileLinks.get(args[0])}`
        );
        message.channel.send({ embeds: [embed, embed, embed, embed] });
      } else if (command === "alt") {
        const exampleEmbed = new MessageEmbed()
          // .setColor(0x0099ff)
          // .setDescription("Some description here")
          .setImage("https://i.imgur.com/AfFp7pu.png");
        message.channel.send({ embeds: [exampleEmbed] });
      }
    } else {
      return;
      // TODO: Add no-command-required functionality
    }
  }
});

/* client.on("interactionCreate", async (interaction) => {
  console.log(interaction.options);
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName == "name") {
      interaction.reply("Hello name!");
    }
  } else if (interaction.isUserContextMenuCommand()) {
    if (interaction.commandName == "name 1") {
      console.log("1");
      interaction.reply(`Hello 1, ${interaction.member.user.tag}!`);
    } else if (interaction.commandName == "name 1") {
      console.log("2");
      interaction.reply(`Hello 2, ${interaction.member.user.tag}!`);
    }
  }
  return;
}); */

client.login(process.env.BOT_TOKEN);
