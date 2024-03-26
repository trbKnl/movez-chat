import { Combination } from 'js-combinatorics'
import { unpack, pack }  from 'msgpackr'


// PLAYER CLASS

export class Player {
  constructor(sessionId, userId) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  static createFromObject(player) {
    const { sessionId, userId } = player
    const newPlayer = new Player(sessionId, userId)
    return newPlayer
  }

  static areEqual(player1, player2) {
    const { sessionId: sessionId1, userId: userId1 } = player1;
    const { sessionId: sessionId2, userId: userId2 } = player2;
    return sessionId1 === sessionId2 && userId1 === userId2;
  }

  static isPlayerInArray(arrayOfPlayers, specificPlayer) {
    return arrayOfPlayers.some(player => Player.areEqual(player, specificPlayer))
  }
}


// GAME OBJECT

export class Game {
    constructor(
      gameId = null,
      players = [],
      allPairs = null,
      currentPairs = [], 
      imposter = null,
      gameOngoing = true,
      currentRound = 0
    ) {

    if (allPairs === null) {
      let combinations = new Combination(players, 2);
      allPairs = [...combinations]
    }

    if (imposter === null) {
      imposter = players[Math.floor(Math.random() * players.length)];
    }

    // Initialize class properties
    this.players = gameId
    this.players = players
    this.allPairs = allPairs
    this.imposter = imposter
    this.gameOngoing = gameOngoing
    this.currentPairs = currentPairs
    this.currentRound = currentRound
    this.duration = 10000
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

      const isPlayer1AlreadyPlaying = Player.isPlayerInArray(currentPlayers, player1)
      const isPlayer2AlreadyPlaying = Player.isPlayerInArray(currentPlayers, player2)

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
 
  async sendPartnerToPlayer(io, messageStore, player) {
    for (const pair of this.currentPairs) {
      if (Player.isPlayerInArray(pair, player)) {
        const partner = pair.find(e => e.userId !== player.userId);
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
        break
      }
    }
  }

  async sendPartnerToAllPlayers(io, messageStore) {
    this.players.forEach((player) => {
      this.sendPartnerToPlayer(io, messageStore, player)
    })
  }

  async sleepAndUpdateProgress(io) {
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
  
  static createFromObject(game) {
    const{ gameId, players, allPairs, imposter, gameOngoing, currentPairs, currentRound } = game
    const playersPlayers = players.map((player) => { 
      return Player.createFromObject(player) 
    })
    const allPairsPlayers = allPairs.map((pair) => { 
      return [Player.createFromObject(pair[0]), Player.createFromObject(pair[1])] 
    })
    const currentPairsPlayers = currentPairs.map((pair) => { 
      return [Player.createFromObject(pair[0]), Player.createFromObject(pair[1])] 
    })
    return new Game( gameId, playersPlayers, allPairsPlayers, currentPairsPlayers, imposter, gameOngoing, currentRound )
  }
}



// GAME STORE

const SESSION_TTL = 24 * 60 * 60;

export class GameStore {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async load(id) {
    let game = await this.redisClient.hgetBuffer(`game:${id}`, "game")
    if (game !== null) {
      let gameObject = unpack(game)
      game = Game.createFromObject(gameObject)
    }
    return game
  }

  async save(id, game) {
    await this.redisClient.multi().hset(
        `game:${id}`,
        "game",
        pack(game),
      )
      .expire(`game:${id}`, SESSION_TTL)
      .exec();
  }
}


// HELPERS

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function divideIntegerIntoParts(integer, n) {
    const parts = [];
    const remainder = integer % n;
    const base = Math.floor(integer / n);

    for (let i = 0; i < n; i++) {
        parts.push(i < remainder ? base + 1 : base);
    }
    return parts;
}

async function getMessages(messageStore, userId, partnerId) {
  const messages = await messageStore.findMessagesForUser(userId)
  const messagesPerUser = new Map()

  messages.forEach((message) => {
    const { from, to } = message
    const otherUser = userId === from ? to : from
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message)
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  })
  return messagesPerUser.get(partnerId) || []
}
