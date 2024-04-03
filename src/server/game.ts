import { Combination } from 'js-combinatorics'
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
  allPairs: z.array(z.array(PlayerSchema)).optional(),
  currentPairs: z.array(z.array(PlayerSchema)).optional(),
  imposter: PlayerSchema.optional(),
  gameOngoing: z.boolean(),
  currentRound: z.number(),
})

export type GameData = z.infer<typeof GameDataSchema>


// GAME OBJECT

export class Game {
    public gameId: string 
    public players: Player[]
    public allPairs: Player[][]
    public currentPairs: Player[][]
    public imposter: Player 
    public gameOngoing: boolean
    public currentRound: number
    public duration: number

    constructor(
      gameId: string,
      players:  Player[],
      allPairs?: Player[][],
      currentPairs?: Player[][],
      imposter?: Player,
      gameOngoing = true,
      currentRound = 0
    ) {

    if (allPairs === undefined) {
      let combinations = new Combination(players, 2);
      allPairs = [...combinations]
    }

    if (imposter === undefined) {
      imposter = players[Math.floor(Math.random() * players.length)];
    }

    if (currentPairs === undefined) {
      currentPairs = []
    }
    // Initialize class properties
    this.gameId = gameId
    this.players = players
    this.allPairs = allPairs
    this.imposter = imposter
    this.gameOngoing = gameOngoing
    this.currentPairs = currentPairs
    this.currentRound = currentRound
    this.duration = 30000
  }

  nextRound() {
    let currentPlayers = []
    this.currentPairs = []

    if (this.allPairs.length === 0) {
      this.gameOngoing = false
      return
    }
    for (let i = 0; i < this.allPairs.length; i++) {
      const pair = this.allPairs[i];
      const player1 =  pair[0]
      const player2 =  pair[1]

      const isPlayer1AlreadyPlaying = isPlayerInArray(currentPlayers, player1)
      const isPlayer2AlreadyPlaying = isPlayerInArray(currentPlayers, player2)

      if (!isPlayer1AlreadyPlaying && !isPlayer2AlreadyPlaying) {
        this.currentPairs.push(pair)
        currentPlayers.push(player1, player2)
        this.allPairs.splice(i, 1)
        i--
      }
    }
    this.currentRound += 1
  }

  // ADD METHODS HERE THAT COMMUNICATE THE STATE OF THE GAME
  // states can be "game state <description of state>"
  // The game can figure out what the state should be
 
  async sendPartnerToPlayer(io: SocketIOServer, messageStore: RedisMessageStore, player: Player) {
    for (const pair of this.currentPairs) {
      if (isPlayerInArray(pair, player)) {
        const partner = pair.find(e => e.userId !== player.userId);
        if (partner === undefined) {
          return
        }
        let users = []
        const messages = await getMessages(messageStore, player.userId, partner.userId)
        users.push({
          userId: partner.userId,
          username: partner.userId,
          connected: true,
          messages: messages
        })
        io.to(player.userId).emit("game state show infoscreen", `You are now going to talk to ${partner.userId}` )
        io.to(player.userId).emit("game state users", users)
        io.to(partner.userId).emit("game state partner connected", player.userId)
        return
      }
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

  endGame(io: SocketIOServer) {
    this.players.forEach((player) => {
      io.to(player.userId).emit("game state end")
    })
  }

  async sendPartnerToAllPlayers(io: SocketIOServer, messageStore: RedisMessageStore) {
    this.players.forEach((player) => {
      this.sendPartnerToPlayer(io, messageStore, player)
    })
  }

  async sleepAndUpdateProgress(io: SocketIOServer) {
    const updateRounds = 10
    const secondsArr = divideIntegerIntoParts(this.duration, updateRounds) // array of ms
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
    const { gameId, players, allPairs, currentPairs, imposter, gameOngoing, currentRound } = game
    return new Game( gameId, players, allPairs, currentPairs, imposter, gameOngoing, currentRound )
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
