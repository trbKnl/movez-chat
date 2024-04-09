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

export const GameDataSchema = z.object({
  gameId: z.string(),
  players: z.array(PlayerSchema),
  imposter: z.number(),
  gameOngoing: z.boolean(),
  currentRound: z.number(),
})

export type GameData = z.infer<typeof GameDataSchema>

// GAME OBJECT

// TODO: CREATE method that keeps track of the game state 
// and whenever the client requests state (upon reconnect) current state can be sent

export class Game {
    public gameId: string 
    public players: Player[]
    public imposter: number 
    public gameOngoing: boolean
    public currentRound: number

    private pairingsPerRound: number[][][]
    private duration: number
    private topicQuestion: string
    private topicOptions: string[]
    private imposterLabel: string
    private playerLabel: string
    private playerColors: string[]

    constructor(
      gameId: string,
      players:  Player[],
      imposter?: number,
      gameOngoing = true,
      currentRound = 0
    ) {

    if (imposter === undefined) {
      imposter = Math.floor(Math.random() * 4)
    }

    this.gameId = gameId
    this.players = players
    this.pairingsPerRound = [[[0,1], [2,3]], [[0,2], [1,3]], [[0,3], [1,2]]]
    this.imposter = imposter
    this.gameOngoing = gameOngoing
    this.currentRound = currentRound
    this.duration = 10  // in seconds
    this.topicQuestion = "Who is your favorite singer?" 
    this.topicOptions = ["Michael Jackson", "Birtnet Psiers", "George michel", "Arana Grando"]
    this.imposterLabel = "Imposter"
    this.playerLabel = "Player"
    this.playerColors = ["Yellow", "Green", "Blue", "Red"]
  }

  nextRound() {
    this.currentRound += 1
    if (this.currentRound > 2) {
      this.gameOngoing = false
    }
  }

  // ADD METHODS HERE THAT COMMUNICATE THE STATE OF THE GAME
  // states can be "game state <description of state>"
  // The game can figure out what the state should be
  
  async showChooseTopicScreen(io: SocketIOServer) {
    this.players.forEach((player) => {
      io.to(player.userId).emit("game state choose topic", {
          topicQuestion: this.topicQuestion, 
          topicOptions: this.topicOptions,
          playerRole: this.getPlayerRole(player),
          playerColor: this.getPlayerColor(player),
      })
    })
  }
 
  showVotingScreen(io: SocketIOServer) {
    this.players.forEach((player) => {
      const playerColor = this.getPlayerColor(player)
      const playerRole = this.getPlayerRole(player)
      io.to(player.userId).emit("game state show voting screen",  {playerColor, playerRole})
    })
  }

  async sendPartnerToPlayer(io: SocketIOServer, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore, player: Player) {
    if (this.gameOngoing === false) {
      return
    }
    const currentRoundPairs = this.pairingsPerRound[this.currentRound]
    const playerIndex = this.findPlayerIndex(player)
    for (const pair of currentRoundPairs) {
      if (pair.includes(playerIndex)) {
        const partnerIndex = pair.find(e => e !== playerIndex)
        if (partnerIndex === undefined) {
          throw new Error("partnerIndex is undefined")
        }

        const partner = this.players[partnerIndex]
        let users = []
        const messages = await getMessages(messageStore, player.userId, partner.userId)
        users.push({
          userId: partner.userId,
          username: partner.userId,
          connected: true,
          messages: messages
        })
        this.showInfoScreen(io, player, `You are now going to talk to ${partner.userId}`)
        io.to(player.userId).emit("game state users", users)
        io.to(partner.userId).emit("game state partner connected", player.userId)
        this.sendChatRoundInfo(io, playerDataStore, player, partner)
        return
      }
    }
  }

  async sendPartnerToAllPlayers(io: SocketIOServer, messageStore: RedisMessageStore, playerDataStore: PlayerDataStore) {
    this.players.forEach((player) => {
      this.sendPartnerToPlayer(io, messageStore, playerDataStore, player)
    })
  }

  async sendChatRoundInfo(io: SocketIOServer, playerDataStore: PlayerDataStore, user: Player, partner: Player) {
    const yourChosenTopic = await playerDataStore.getPlayerData(this.gameId, user, "topic")
    const partnerChosenTopic = await playerDataStore.getPlayerData(this.gameId, partner, "topic")

    io.to(user.userId).emit("game state chat round info", {
      yourRole: this.getPlayerRole(user),
      yourColor: this.getPlayerColor(user),
      partnerColor: this.getPlayerColor(partner),
      yourChosenTopic: yourChosenTopic,
      partnerChosenTopic: partnerChosenTopic,
    })
  }

  showInfoScreen(io: SocketIOServer, player: Player, message: string) {
    io.to(player.userId).emit("game state show infoscreen",  message)
  }

  findPlayerIndex(player: Player) {
    return this.players.findIndex(obj => obj.userId === player.userId);
  }

  getPlayerColor(player: Player): string {
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

  sendEndGame(io: SocketIOServer) {
    this.players.forEach((player) => {
      io.to(player.userId).emit("game state end")
    })
  }

  async sleep(seconds: number) {
    await sleep(seconds * 1000) 
  }

  async sleepAndUpdateProgress(io: SocketIOServer) {
    const updateRounds = 10
    const secondsArr = divideIntegerIntoParts(this.duration * 1000, updateRounds) // array of ms
    for (let i = 0; i < secondsArr.length; i++) {
      const seconds = secondsArr[i]
      await sleep(seconds) 
      let percentageComplete = (i + 1) / updateRounds * 100
      this.players.forEach((player) => {
        io.to(player.userId).emit("game state progress update", percentageComplete)
      })
    }
  }

  // STATIC METHODS
  
  static createFromObject(game: GameData): Game {
    const { gameId, players, imposter, gameOngoing, currentRound } = game
    return new Game( gameId, players, imposter, gameOngoing, currentRound )
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

  async save(game: Game) {
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
