import { Client, Collection, GuildMember } from "discord.js";
import { v4 as uuid } from "uuid";

/*
 * Commands Documentation:
 *
 * admin:
 * game: <options>
 *   create: Creates a new game object and stores it in server / dm hashmap
 *   settings: Shows game settings
 *   invite <user id | user mention>: Allow a user id to join a game
 *   uninvite <user id | user mention>: Revokes an invitation
 *   join <game id>: Allows you to join a game, as long as you are invited
 *   spectate <game id>: Allows you to get game logs
 */

export let gameData: Map<string, Game> = new Map();
export let playerData: Map<string, string> = new Map();
//* This Map links ordinary users in a game to the ownerID of that game

export function cleanMentionedUserID(userID: string): string {
  if (userID[0] == "<" && userID[userID.length - 1] == ">") {
    const newUserID = userID.substring(2).slice(undefined, -1);
    return newUserID;
  } else {
    return userID;
  }
}

export const gameTileLinks: Map<string, string> = new Map([
  ["1-1", "https://i.ibb.co/P5TNpdL/1-1.png"],
  ["1-2", "https://i.ibb.co/DYFtKn2/1-2.png"],
  ["1-3", "https://i.ibb.co/jy1zf96/1-3.png"],
  ["1-4", "https://i.ibb.co/xMz2wV8/1-4.png"],
  ["1-5", "https://i.ibb.co/qDM2ZMc/1-5.png"],
  ["1-6", "https://i.ibb.co/f0016N2/1-6.png"],
  ["1-7", "https://i.ibb.co/Dzr19qD/1-7.png"],
  ["1-8", "https://i.ibb.co/nrdDwXj/1-8.png"],
  ["1-9", "https://i.ibb.co/9h9zwy8/1-9.png"],
  ["1-10", "https://i.ibb.co/3hTMLK5/1-10.png"],
  ["1-11", "https://i.ibb.co/KLJS54x/1-11.png"],
  ["1-12", "https://i.ibb.co/zVcnbHv/1-12.png"],
  ["2-1", "https://i.ibb.co/0mKK6h7/2-1.png"],
  ["2-2", "https://i.ibb.co/d29brRV/2-2.png"],
  ["2-3", "https://i.ibb.co/xSTSTMD/2-3.png"],
  ["2-4", "https://i.ibb.co/tJwrGvn/2-4.png"],
  ["2-5", "https://i.ibb.co/FHJkfS2/2-5.png"],
  ["2-6", "https://i.ibb.co/ZxBpgFj/2-6.png"],
  ["2-7", "https://i.ibb.co/q72mcS1/2-7.png"],
  ["2-8", "https://i.ibb.co/vqtcCLp/2-8.png"],
  ["2-9", "https://i.ibb.co/Jsjdc6F/2-9.png"],
  ["2-10", "https://i.ibb.co/kXYcNf9/2-10.png"],
  ["2-11", "https://i.ibb.co/YNjPgvS/2-11.png"],
  ["2-12", "https://i.ibb.co/Ssjcc7w/2-12.png"],
  ["3-1", "https://i.ibb.co/zZgrLXQ/3-1.png"],
  ["3-2", "https://i.ibb.co/rGYdN6h/3-2.png"],
  ["3-3", "https://i.ibb.co/GvwwTFW/3-3.png"],
  ["3-4", "https://i.ibb.co/hM0K4DN/3-4.png"],
  ["3-5", "https://i.ibb.co/xgYsyN2/3-5.png"],
  ["3-6", "https://i.ibb.co/6YKSWmR/3-6.png"],
  ["3-7", "https://i.ibb.co/jrp3TPc/3-7.png"],
  ["3-8", "https://i.ibb.co/LDF5jbh/3-8.png"],
  ["3-9", "https://i.ibb.co/Wydn4Bx/3-9.png"],
  ["3-10", "https://i.ibb.co/tBsdfkt/3-10.png"],
  ["3-11", "https://i.ibb.co/31Xs2k7/3-11.png"],
  ["3-12", "https://i.ibb.co/V329238/3-12.png"],
  ["4-1", "https://i.ibb.co/Zxms9DB/4-1.png"],
  ["4-2", "https://i.ibb.co/p4VXRNv/4-2.png"],
  ["4-3", "https://i.ibb.co/YLwYkVP/4-3.png"],
  ["4-4", "https://i.ibb.co/FwbLZNk/4-4.png"],
  ["4-5", "https://i.ibb.co/j3gLkn2/4-5.png"],
  ["4-6", "https://i.ibb.co/Qk9GfpW/4-6.png"],
  ["4-7", "https://i.ibb.co/H2VcPJm/4-7.png"],
  ["4-8", "https://i.ibb.co/NmtnqJ7/4-8.png"],
  ["4-9", "https://i.ibb.co/px6b6g0/4-9.png"],
  ["4-10", "https://i.ibb.co/ftk52z6/4-10.png"],
  ["4-11", "https://i.ibb.co/xMB4KLK/4-11.png"],
  ["4-12", "https://i.ibb.co/khTPw19/4-12.png"],
  ["5-1", "https://i.ibb.co/p2mwzrT/5-1.png"],
  ["5-2", "https://i.ibb.co/0J5v60w/5-2.png"],
  ["5-3", "https://i.ibb.co/DLY8myw/5-3.png"],
  ["5-4", "https://i.ibb.co/p2Qyvbc/5-4.png"],
  ["5-5", "https://i.ibb.co/02HL5WN/5-5.png"],
  ["5-6", "https://i.ibb.co/cYrvcmX/5-6.png"],
  ["5-7", "https://i.ibb.co/L12PyrP/5-7.png"],
  ["5-8", "https://i.ibb.co/9V9JZcs/5-8.png"],
  ["5-9", "https://i.ibb.co/xYx1QD2/5-9.png"],
  ["5-10", "https://i.ibb.co/RPwm6PM/5-10.png"],
  ["5-11", "https://i.ibb.co/cCFSLfn/5-11.png"],
  ["5-12", "https://i.ibb.co/h75dHNS/5-12.png"],
  ["6-1", "https://i.ibb.co/2SXxg5D/6-1.png"],
  ["6-2", "https://i.ibb.co/swK4NxX/6-2.png"],
  ["6-3", "https://i.ibb.co/7Y4jYt6/6-3.png"],
  ["6-4", "https://i.ibb.co/f8j1Fxb/6-4.png"],
  ["6-5", "https://i.ibb.co/Zcw1Sb3/6-5.png"],
  ["6-6", "https://i.ibb.co/PCdXXyc/6-6.png"],
  ["6-7", "https://i.ibb.co/H2RJRsd/6-7.png"],
  ["6-8", "https://i.ibb.co/wKJvqFp/6-8.png"],
  ["6-9", "https://i.ibb.co/qDMSfGq/6-9.png"],
  ["6-10", "https://i.ibb.co/mXS4Wmb/6-10.png"],
  ["6-11", "https://i.ibb.co/kqPR3tV/6-11.png"],
  ["6-12", "https://i.ibb.co/tJmMHf0/6-12.png"],
  ["7-1", "https://i.ibb.co/Xb7jPj6/7-1.png"],
  ["7-2", "https://i.ibb.co/FJwTzJ6/7-2.png"],
  ["7-3", "https://i.ibb.co/R4R05JT/7-3.png"],
  ["7-4", "https://i.ibb.co/BTWvkLJ/7-4.png"],
  ["7-5", "https://i.ibb.co/g6xv63Z/7-5.png"],
  ["7-6", "https://i.ibb.co/vwmkjhD/7-6.png"],
  ["7-7", "https://i.ibb.co/0JrsjvQ/7-7.png"],
  ["7-8", "https://i.ibb.co/89zFnNz/7-8.png"],
  ["7-9", "https://i.ibb.co/jgYn16g/7-9.png"],
  ["7-10", "https://i.ibb.co/ZXVMPst/7-10.png"],
  ["7-11", "https://i.ibb.co/PxNhXtP/7-11.png"],
  ["7-12", "https://i.ibb.co/f0BCXRW/7-12.png"],
  ["8-1", "https://i.ibb.co/9vYScPn/8-1.png"],
  ["8-2", "https://i.ibb.co/ncCcgJb/8-2.png"],
  ["8-3", "https://i.ibb.co/yk0WR1T/8-3.png"],
  ["8-4", "https://i.ibb.co/xjpm8r4/8-4.png"],
  ["8-5", "https://i.ibb.co/Ypgxdq1/8-5.png"],
  ["8-6", "https://i.ibb.co/PCJLXJg/8-6.png"],
  ["8-7", "https://i.ibb.co/dfWhmsj/8-7.png"],
  ["8-8", "https://i.ibb.co/RHBJ3VC/8-8.png"],
  ["8-9", "https://i.ibb.co/BgVJ6CR/8-9.png"],
  ["8-10", "https://i.ibb.co/1Tw26Dr/8-10.png"],
  ["8-11", "https://i.ibb.co/brtSKF1/8-11.png"],
  ["8-12", "https://i.ibb.co/VwWg2wW/8-12.png"],
  ["9-1", "https://i.ibb.co/YXjqZ0H/9-1.png"],
  ["9-2", "https://i.ibb.co/H2yjKWW/9-2.png"],
  ["9-3", "https://i.ibb.co/sQ4N4dF/9-3.png"],
  ["9-4", "https://i.ibb.co/L1scVtb/9-4.png"],
  ["9-5", "https://i.ibb.co/mDqnBW2/9-5.png"],
  ["9-6", "https://i.ibb.co/r5FPMqS/9-6.png"],
  ["9-7", "https://i.ibb.co/kqf053x/9-7.png"],
  ["9-8", "https://i.ibb.co/NTfrV3x/9-8.png"],
  ["9-9", "https://i.ibb.co/4dMFYJy/9-9.png"],
  ["9-10", "https://i.ibb.co/DbBYc8L/9-10.png"],
  ["9-11", "https://i.ibb.co/48N5Q0Z/9-11.png"],
  ["9-12", "https://i.ibb.co/zxZM3Lr/9-12.png"],
  ["10-1", "https://i.ibb.co/mRrHGc0/10-1.png"],
  ["10-2", "https://i.ibb.co/qY3wQzp/10-2.png"],
  ["10-3", "https://i.ibb.co/vLrwtvr/10-3.png"],
  ["10-4", "https://i.ibb.co/KVgpRCP/10-4.png"],
  ["10-5", "https://i.ibb.co/VJHp1Wq/10-5.png"],
  ["10-6", "https://i.ibb.co/fHNfNxb/10-6.png"],
  ["10-7", "https://i.ibb.co/6N9CsMq/10-7.png"],
  ["10-8", "https://i.ibb.co/yy1t7g3/10-8.png"],
  ["10-9", "https://i.ibb.co/vcdGVX2/10-9.png"],
  ["10-10", "https://i.ibb.co/LdzPGyq/10-10.png"],
  ["10-11", "https://i.ibb.co/9YYKpJk/10-11.png"],
  ["10-12", "https://i.ibb.co/NSykPV3/10-12.png"],
  ["11-1", "https://i.ibb.co/Dg9WVFy/11-1.png"],
  ["11-2", "https://i.ibb.co/ZmrH7CF/11-2.png"],
  ["11-3", "https://i.ibb.co/bHMzkv3/11-3.png"],
  ["11-4", "https://i.ibb.co/98NYHvs/11-4.png"],
  ["11-5", "https://i.ibb.co/JkmdD65/11-5.png"],
  ["11-6", "https://i.ibb.co/1n97BqB/11-6.png"],
  ["11-7", "https://i.ibb.co/k8sYyTG/11-7.png"],
  ["11-8", "https://i.ibb.co/N6YXPzw/11-8.png"],
  ["11-9", "https://i.ibb.co/tZ6R5Q5/11-9.png"],
  ["11-10", "https://i.ibb.co/0GnQWw8/11-10.png"],
  ["11-11", "https://i.ibb.co/tqj8QYM/11-11.png"],
  ["11-12", "https://i.ibb.co/M810GRp/11-12.png"],
  ["12-1", "https://i.ibb.co/h2f8J9j/12-1.png"],
  ["12-2", "https://i.ibb.co/xF4NW1h/12-2.png"],
  ["12-3", "https://i.ibb.co/80STj8M/12-3.png"],
  ["12-4", "https://i.ibb.co/zx69bp8/12-4.png"],
  ["12-5", "https://i.ibb.co/1TStBgG/12-5.png"],
  ["12-6", "https://i.ibb.co/PhpVxTC/12-6.png"],
  ["12-7", "https://i.ibb.co/KLbqnPC/12-7.png"],
  ["12-8", "https://i.ibb.co/HGGbxhK/12-8.png"],
  ["12-9", "https://i.ibb.co/TkDdcjf/12-9.png"],
  ["12-10", "https://i.ibb.co/hyVV5K7/12-10.png"],
  ["12-11", "https://i.ibb.co/S548vJM/12-11.png"],
  ["12-12", "https://i.ibb.co/PF63Yy6/12-12.png"],
]);

enum Ingredient {
  Blank = 0,
  Egg = 1,
  Roe = 2,
  Squid = 3,
  Broccoli = 4,
  Tuna = 5,
  Omelete = 6,
  Seaweed = 7,
  Avocado = 8,
  Rice = 9,
  Cucumber = 10,
  Tomato = 11,
  Octopus = 12,
}

class TileModel {
  topFood: Ingredient;
  bottomFood: Ingredient;

  constructor(topFood: Ingredient, bottomFood: Ingredient) {
    this.topFood = topFood;
    this.bottomFood = bottomFood;
  }
}

export class OperationResult {
  wasSuccessful: boolean;
  message: string;

  constructor(public data: { wasSuccessful: boolean; message: string }) {
    this.wasSuccessful = data.wasSuccessful;
    this.message = data.message;
  }
}

class Stack {
  /*
   * Add item to data
   * Get top of stack item
   * Get stack length
   */

  private data: Ingredient[];
  private length: number = 0;

  constructor(boardBase: Ingredient) {
    this.data = [boardBase];
  }

  push(ingredient: Ingredient) {
    this.data.push(ingredient);
    length = this.data.length - 1;
  }

  get getLength() {
    return this.length;
  }

  get getTopIngredient() {
    return this.data[this.data.length - 1];
  }
}

class BoardModel {
  public boardOwner: string;
  public tiles: TileModel[];
  public readonly score: number;
  public boardData: Stack[][] = [
    [
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Egg),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Blank),
    ],
    [
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Tuna),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Omelete),
      new Stack(Ingredient.Blank),
    ],
    [
      new Stack(Ingredient.Broccoli),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Octopus),
    ],
    [
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Tomato),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Seaweed),
      new Stack(Ingredient.Blank),
    ],
    [
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Squid),
      new Stack(Ingredient.Blank),
      new Stack(Ingredient.Blank),
    ],
  ];

  constructor(public data: { boardOwner: string }) {
    this.boardOwner = data.boardOwner;
    this.score = 0;
    this.tiles = [];
  }
}

export class Game {
  private gameOwnerID: string;
  private gameOwnerUsername: string;
  public players: Set<string>;
  public playersData: Map<string, BoardModel>;
  public currentPlayerTurn: string;
  private invitedPlayers: Set<string>;
  private hiddenTiles: TileModel[];
  private shownTiles: TileModel[];

  private gameStarted: boolean;
  private round: number;

  get getGameOwnerID() {
    return this.gameOwnerID;
  }

  get hiddenTilesCount(): number {
    return this.hiddenTiles.length;
  }

  get shownTilesCount(): number {
    return this.shownTiles.length;
  }

  nextRound() {
    this.round++;
  }

  invitePlayer(data: {
    playerID: string;
    clientID: string;
    playerUsername: string;
  }): OperationResult {
    if (cleanMentionedUserID(data.playerID) === this.gameOwnerID)
      return new OperationResult({
        wasSuccessful: false,
        message: "Error: You can not invite yourself!",
      });
    if (cleanMentionedUserID(data.playerID) === data.clientID)
      return new OperationResult({
        wasSuccessful: false,
        message: "Error: You can not invite **Jubakobot**!",
      });

    this.invitedPlayers.add(cleanMentionedUserID(data.playerID));
    console.log(
      `[Game] ${this.gameOwnerUsername} invited ${data.playerUsername}`
    );
    return new OperationResult({
      wasSuccessful: true,
      message: `**${data.playerUsername}** has successfully been invited! They can now join your game by typing **=game join ${this.gameOwnerID}** or **=game join <@${this.gameOwnerID}>**!`,
    });
  }

  disinvitePlayer(data: {
    playerID: string;
    clientID: string;
    playerUsername: string;
  }): OperationResult {
    if (cleanMentionedUserID(data.playerID) === this.gameOwnerID)
      return new OperationResult({
        wasSuccessful: false,
        message: "Error: You can not disinvite yourself!",
      });
    if (cleanMentionedUserID(data.playerID) === data.clientID)
      return new OperationResult({
        wasSuccessful: false,
        message: "Error: You can not disinvite Jubakobot!",
      });
    this.invitedPlayers.delete(data.playerID);
    this.playersData.delete(cleanMentionedUserID(data.playerID));
    console.log(
      `[Game] ${this.gameOwnerUsername} disinvited ${data.playerUsername}`
    );
    return new OperationResult({
      wasSuccessful: true,
      message: `${data.playerUsername} has successfully been disinvited!`,
    });
  }

  /* joinGame(playerID: string, clientID: string): boolean {
    // TODO: Change return value from boolean to OperationResult.
    if (cleanMentionedUserID(playerID) === this.gameOwnerID) return false;
    if (cleanMentionedUserID(playerID) === clientID) return false;
    this.players.add(playerID);
    return true;
  } */

  joinGame(data: {
    userID: string;
    gameOwnerID: string;
    userName: string;
  }): OperationResult {
    if (this.players.has(cleanMentionedUserID(data.userID))) {
      return new OperationResult({
        wasSuccessful: false,
        message: `You have already joined **${this.gameOwnerUsername}**'s game!`,
      });
    }
    if (this.invitedPlayers.has(data.userID)) {
      this.players.add(data.userID);
      playerData.set(data.userID, this.gameOwnerID);
      console.log(`[Game] ${data.userName} joined ${this.gameOwnerUsername}`);
      return new OperationResult({
        wasSuccessful: true,
        message: `Successfully joined **${this.gameOwnerUsername}**'s game!`,
      });
    } else {
      return new OperationResult({
        wasSuccessful: false,
        message: `Error: **${this.gameOwnerUsername}** has not invited you yet!`,
      });
    }
  }

  startGame(): OperationResult {
    /*
     * Check number of players
     * Initialize boards (if not by default)
     * Select tiles for users and
     */

    if (this.players.size < 2 || this.players.size > 4) {
      return new OperationResult({
        wasSuccessful: false,
        message:
          "Error: A Jubako game must have between 2 and 4 players, including youself!",
      });
    } else {
      const tileSelection: string[] = chooseRandom(
        Array.from(gameTileLinks.keys()),
        78
      );
      this.hiddenTiles = tileSelection.map(
        (tileString) =>
          new TileModel(
            parseInt(tileString.split("-")[0]),
            parseInt(tileString.split("-")[1])
          )
      );
      Array.from(this.players.keys()).forEach((playerDataKey) => {
        let currentPlayerData: BoardModel = new BoardModel({
          boardOwner: playerDataKey,
        });
        for (
          let playerStartTileNum = 0;
          playerStartTileNum < 2;
          playerStartTileNum++
        ) {
          currentPlayerData?.tiles.push(this.hiddenTiles.shift()!);
        }
        this.playersData.set(playerDataKey, currentPlayerData);
        console.log("Player Tiles", playerDataKey);
        console.log(currentPlayerData);
      });
      for (let gameStartTileNum = 0; gameStartTileNum < 4; gameStartTileNum++) {
        this.shownTiles.push(this.hiddenTiles.shift()!);
      }
      console.log("Game Tiles");
      console.log(this.hiddenTiles);

      // Shuffle player array
      this.players = new Set(
        Array.from(this.players)
          .map((player) => {
            return { data: player, sort: Math.random() };
          })
          .sort((a, b) => a.sort - b.sort)
          .map(({ data }) => data)
      );
      this.gameStarted = true;
      return new OperationResult({
        wasSuccessful: true,
        message: "May the best Japanese chef win!",
      });
    }
  }

  constructor(gameOwnerID: string, gameOwnerUsername: string) {
    this.gameOwnerID = gameOwnerID;
    this.gameOwnerUsername = gameOwnerUsername;
    this.players = new Set([gameOwnerID]);
    playerData.set(gameOwnerID, gameOwnerID);
    this.playersData = new Map().set(
      gameOwnerID,
      new BoardModel({ boardOwner: gameOwnerID })
    );
    this.currentPlayerTurn = gameOwnerID;
    this.invitedPlayers = new Set([]);
    this.hiddenTiles = [];
    this.shownTiles = [];

    this.gameStarted = false;
    this.round = 0;
  }
}

// TODO: Select correct place for this function

function chooseRandom(arr: string[], num: number = 1) {
  const res = [];
  for (let i = 0; i < num; ) {
    const random = Math.floor(Math.random() * arr.length);
    if (res.indexOf(arr[random]) !== -1) {
      continue;
    }
    res.push(arr[random]);
    i++;
  }
  return res;
}

function removeItemOnce(arr: TileModel[], value: TileModel) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export async function playerSearch(data: {
  client: Client<boolean>;
  guildID: string;
  userID: string;
}): Promise<string> {
  const members: Promise<Collection<string, GuildMember>> = (
    await data.client.guilds.fetch(data.guildID)
  ).members.fetch();
  let dataMap: Map<string, string> = new Map();
  (await members).forEach((member) => {
    dataMap.set(member.user.id, member.user.tag);
  });
  return dataMap.get(data.userID)!;
}
