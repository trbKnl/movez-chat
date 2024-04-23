import { encode, decode } from "@msgpack/msgpack"
import { Server as SocketIOServer } from 'socket.io'
import { RedisMessageStore } from './messageStore'
import { RedisSessionStore } from './sessionStore'
import { Redis } from 'ioredis'
import { z } from 'zod'

// PLAYER CLASS

export const PlayerSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
})

export type Player = z.infer<typeof PlayerSchema>

export const GameStateSchema = z.union([
  z.literal('choose topic'),
  z.literal('chatting'),
  z.literal('voting'),
  z.literal('results'),
  z.literal('end'),
]);

type GameState = z.infer<typeof GameStateSchema>;

export const PlayerColorSchema = z.union([
  z.literal('Red'),
  z.literal('Yellow'),
  z.literal('Green'),
  z.literal('Blue'),
]);

export type PlayerColor = z.infer<typeof PlayerColorSchema>;

export const GameDataSchema = z.object({
  gameId: z.string(),
  players: z.array(PlayerSchema),
  imposter: z.number(),
  currentRound: z.number(),
  gameState: GameStateSchema,
})

export type GameData = z.infer<typeof GameDataSchema>

export const ChooseTopicScreenDataSchema = z.object({
  //topicQuestion: z.string(),
  //topicOptions: z.array(z.string()),
  playerRole: z.string(),
  playerColor: z.string(),
})

export type ChooseTopicScreenData = z.infer<typeof ChooseTopicScreenDataSchema>

export const VotingScreenDataSchema = z.object({
  playerColor: z.string(),
  playerRole: z.string(),
  playerColors: z.array(z.string()),
})

export type VotingScreenData = z.infer<typeof VotingScreenDataSchema>

export const ResultScreenDataSchema = z.object({
  playerScore: z.number(),
  playerRole: z.string(),
  imposterScore: z.number(),
  imposterColor: z.string(),
  playerWon: z.boolean().optional(),
})

export type ResultScreenData = z.infer<typeof ResultScreenDataSchema>


export const ChatRoundDataSchema = z.object({
  playerColor: PlayerColorSchema,
  playerChosenTopic: z.string(),
  playerChosenTalksAbout: z.string(),
  partnerColor: PlayerColorSchema,
  partnerChosenTopic: z.string(),
  partnerChosenTalksAbout: z.string(),
})

export type ChatRoundData = z.infer<typeof ChatRoundDataSchema>


// GAME OBJECT

export class Game {
    public gameId: string 
    public players: Player[]
    public imposter: number 
    public currentRound: number
    public gameState: GameState

    private pairingsPerRound: number[][][]
    //private topicQuestion: string
    //private topicOptions: string[]
    private imposterLabel: string
    private playerLabel: string
    private playerColors: PlayerColor[]

    constructor(
      gameId: string,
      players:  Player[],
      imposter?: number,
      currentRound = 0,
      gameState: GameState = "choose topic",
    ) {

    if (imposter === undefined) {
      imposter = Math.floor(Math.random() * 4)
    }

    this.gameId = gameId
    this.players = players
    this.imposter = imposter
    this.currentRound = currentRound
    this.gameState = gameState

    this.pairingsPerRound = [[[0,1], [2,3]], [[0,2], [1,3]], [[0,3], [1,2]]]
    //this.topicQuestion = "Who is your favorite singer?" 
    //this.topicOptions = ["Michael Jackson", "Birtnet Psiers", "George michel", "Arana Grando"]
    this.imposterLabel = "Imposter"
    this.playerLabel = "Player"
    this.playerColors = ["Yellow", "Green", "Blue", "Red"]
  }

  async play(io: SocketIOServer, gameStore: GameStore, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore) {
    while (this.gameState !== "end") {
      await this.save(gameStore)
      await this.playState(io, gameStore, messageStore, playerDataStore)
      this.nextGameState()
    }
  }

  nextGameState() {
    const allGameStates: GameState[] = ["choose topic", "chatting", "voting", "results", "end"];
    const i = allGameStates.indexOf(this.gameState);
    this.gameState = allGameStates[i + 1]
  }

  async playState(io: SocketIOServer, gameStore: GameStore, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore) {
    switch (this.gameState) {
      case "choose topic":
        this.showChooseTopicScreenForAll(io);
        await this.sleepAndUpdateProgress(io, 60) // 60s
        break;
      case "chatting":
        while (this.currentRound < 3) {
          await this.showChatScreenForAll(io, messageStore, playerDataStore)
          await this.sleepAndUpdateProgress(io, 60*3) // 3*60s
          this.nextRound()
          this.save(gameStore)
        }
        break;
      case "voting":
        this.showVotingScreenForAll(io)
        await this.sleepAndUpdateProgress(io, 30) // 30s
      case "results":
        await this.sendResultScreen(io, playerDataStore)
        break;
    }
  }

  async syncGameForSinglePlayer(io: SocketIOServer, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore, player: Player) {
    switch (this.gameState) {
      case "choose topic":
        this.showChooseTopicScreen(io, player);
        break;
      case "chatting":
        await this.showChatScreen(io, messageStore, playerDataStore, player)
        break;
      case "voting":
        this.showVotingScreen(io, player)
        break;
    }
  }

  nextRound() {
    this.currentRound += 1
  }

  // ADD METHODS HERE THAT COMMUNICATE THE STATE OF THE GAME
  // states can be "game state <description of state>"
  // The game can figure out what the state should be
  
  showChooseTopicScreen(io: SocketIOServer, player: Player) {
      const chooseTopicScreenData: ChooseTopicScreenData = {
          //topicQuestion: this.topicQuestion, 
          //topicOptions: this.topicOptions,
          playerRole: this.getPlayerRole(player),
          playerColor: this.getPlayerColor(player),
      }
      io.to(player.userId).emit("game state choose topic", chooseTopicScreenData)
  }
 
  showChooseTopicScreenForAll(io: SocketIOServer) {
    this.players.forEach((player) => {
      this.showChooseTopicScreen(io, player)
    })
  }
 
  showVotingScreen(io: SocketIOServer, player: Player) {
    const votingScreenData: VotingScreenData = {
      playerColor: this.getPlayerColor(player),
      playerRole: this.getPlayerRole(player),
      playerColors: this.playerColors,
    }
    io.to(player.userId).emit("game state show voting screen", votingScreenData)
  }

  showVotingScreenForAll(io: SocketIOServer) {
    this.players.forEach((player) => {
      this.showVotingScreen(io, player)
    })
  }
 
  async showChatScreen(io: SocketIOServer, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore, player: Player) {
    const currentRoundPairs = this.pairingsPerRound[this.currentRound]
    const playerIndex = this.findPlayerIndex(player)
    for (const pair of currentRoundPairs) {
      if (pair.includes(playerIndex)) {
        const partnerIndex = pair.find(e => e !== playerIndex)
        if (partnerIndex === undefined) {
          throw new Error("partnerIndex is undefined")
        }

        const partner = this.players[partnerIndex]
        const messages = await getMessages(messageStore, player.userId, partner.userId)
        const user = { // For now this is still hacky, change to a custom type
          userId: partner.userId,
          username: "Partner",
          partnerColor: this.getPlayerColor(partner),
          playerColor: this.getPlayerColor(player),
          connected: true,
          messages: messages
        }
        this.showInfoScreen(io, player, `You are now going to talk to the ${this.getPlayerColor(partner)} player`)
        io.to(player.userId).emit("game state users", user)
        io.to(partner.userId).emit("game state partner connected", player.userId)
        this.sendChatRoundInfo(io, playerDataStore, player, partner)
        return
      }
    }
  }

  async showChatScreenForAll(io: SocketIOServer, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore) {
    this.players.forEach((player) => {
      this.showChatScreen(io, messageStore, playerDataStore, player)
    })
  }

  async sendChatRoundInfo(io: SocketIOServer, playerDataStore: PlayerDataStore, user: Player, partner: Player) {
    const yourChosenTopic = await playerDataStore.getPlayerData(this.gameId, user, "topic")
    const yourChosenTalksAbout = await playerDataStore.getPlayerData(this.gameId, user, "talks about")
    const partnerChosenTopic = await playerDataStore.getPlayerData(this.gameId, partner, "topic")
    const partnerChosenTalksAbout = await playerDataStore.getPlayerData(this.gameId, partner, "talks about")
    const chatRoundData: ChatRoundData = {
      playerColor: this.getPlayerColor(user),
      playerChosenTopic: yourChosenTopic,
      playerChosenTalksAbout: yourChosenTalksAbout,
      partnerColor: this.getPlayerColor(partner),
      partnerChosenTopic: partnerChosenTopic,
      partnerChosenTalksAbout: partnerChosenTalksAbout,
    }
    io.to(user.userId).emit("game state chat round info", chatRoundData)
  }

  async sendResultScreen(io: SocketIOServer, playerDataStore: PlayerDataStore) {
    const imposterColor = this.getPlayerColor(this.getPlayerByIndex(this.imposter))
    let individualResults = new Map()
    let playerScore = 0
    let imposterScore = 0
    for (const player of this.players) {
      if (!this.isImposter(player)) {
        const chosenImposterColor = await playerDataStore.getPlayerData(this.gameId, player, "imposter")
        const playerWon = imposterColor === chosenImposterColor
        individualResults.set(player.sessionId, playerWon)
        if (playerWon) {
          playerScore += 1
        } else {
          imposterScore += 1
        }
      }
    }
    this.players.forEach((player) => {
      const resultScreenData: ResultScreenData = {
        playerScore: playerScore,
        playerRole: this.getPlayerRole(player),
        imposterScore: imposterScore,
        imposterColor: imposterColor,
        playerWon: individualResults.get(player.sessionId), // optional
      }
      io.to(player.userId).emit("game state result screen", resultScreenData)
    })
  }

  showInfoScreen(io: SocketIOServer, player: Player, message: string) {
    io.to(player.userId).emit("game state show infoscreen",  message)
  }

  findPlayerIndex(player: Player) {
    return this.players.findIndex(obj => obj.userId === player.userId);
  }

  getPlayerByIndex(index: number): Player {
    return this.players[index]
  }

  getPlayerColor(player: Player): PlayerColor {
    const index = this.findPlayerIndex(player)
    return this.playerColors[index]
  }

  getPlayerRole(player: Player): string {
    const index = this.findPlayerIndex(player)
    if (index === this.imposter) {
      return this.imposterLabel
    } else {
      return this.playerLabel
    }
  }

  isImposter(player: Player): boolean {
    return this.getPlayerRole(player) === this.imposterLabel
  }

  registerGame(sessionStore: RedisSessionStore) {
    this.players.forEach((player) => {
      sessionStore.updateSessionField(player.sessionId, "gameId", this.gameId) 
    })
  }

  unregisterGame(sessionStore: RedisSessionStore) {
    this.players.forEach((player) => {
      sessionStore.updateSessionField(player.sessionId, "gameId", "")
    })
  }

  async sleepAndUpdateProgress(io: SocketIOServer, secondsToSleep: number) {
    this.players.forEach((player) => {
      io.to(player.userId).emit("game state progress update", 0)
    })
    const updateRounds = 10
    const secondsArr = divideIntegerIntoParts(secondsToSleep, updateRounds) // array of ms
    for (let i = 0; i < secondsArr.length; i++) {
      const seconds = secondsArr[i]
      await sleep(seconds) 
      let percentageComplete = (i + 1) / updateRounds * 100
      this.players.forEach((player) => {
        io.to(player.userId).emit("game state progress update", percentageComplete)
      })
    }
  }

  async save(gameStore: GameStore) {
    const gameData: GameData = {
      gameId: this.gameId,
      players: this.players,
      imposter: this.imposter,
      currentRound: this.currentRound,
      gameState: this.gameState,
    }
    await gameStore.save(gameData)
  }

  // STATIC METHODS
  
  static createFromObject(game: GameData): Game {
    const { gameId, players, imposter, currentRound, gameState } = game
    return new Game( gameId, players, imposter, currentRound, gameState )
  }
}



// GAME STORE

const SESSION_TTL = 24 * 60 * 60;

export class GameStore {
  private  redisClient

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async load(gameId: string): Promise<Game | undefined> {
    const gameBuf = await this.redisClient.hgetBuffer(`game:${gameId}`, "game")
    if (gameBuf !== null) {
      const gameData = decode(gameBuf)
      const result = GameDataSchema.safeParse(gameData)
      if (result.success) {
        const game = Game.createFromObject(result.data)
        return game
      } else {
        console.log(result.error)
        return undefined
      }
    }
  }

  async save(game: GameData) {
    const encodedGame = Buffer.from(encode(game))
    await this.redisClient.multi().hset(
        `game:${game.gameId}`,
        "game",
        encodedGame,
      )
      .expire(`game:${game.gameId}`, SESSION_TTL)
      .exec();
  }
}

// PLAYER DATA STORE

export class PlayerDataStore {
  private  redisClient

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  setPlayerData(gameId: string, player: Player, fieldName: string, value: string): void {
    this.redisClient
      .hset(`player:${gameId}:${player.sessionId}`, fieldName, value)
  }

  async getPlayerData(gameId: string, player: Player, fieldName: string): Promise<string> {
    let value = await this.redisClient
      .hget(`player:${gameId}:${player.sessionId}`, fieldName)
    if (value === null) {
      value = ""
    }
    return value
  }
}



// HELPERS

function sleep(s: number) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

export function isPlayerInArray(playerArray: Player[], playerToCheck: Player): boolean {
  return playerArray.some(({ sessionId, userId }) =>
    sessionId === playerToCheck.sessionId && userId === playerToCheck.userId
  );
}

function divideIntegerIntoParts(integer: number, n: number): number[] {
    const parts = [];
    const remainder = integer % n;
    const base = Math.floor(integer / n);

    for (let i = 0; i < n; i++) {
        parts.push(i < remainder ? base + 1 : base);
    }
    return parts;
}

async function getMessages(messageStore: RedisMessageStore, userId: string, partnerId: string) {
  const messages = await messageStore.findMessagesForUser(userId)
  const messagesPerUser = new Map()

  messages.forEach((message) => {
    const { fromUserId, toUserId } = message
    const otherUser = userId === fromUserId ? toUserId : fromUserId
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message)
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  })
  return messagesPerUser.get(partnerId) || []
}
