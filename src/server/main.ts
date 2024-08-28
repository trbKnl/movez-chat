import express from 'express'
import http from 'http'
import { Server } from "socket.io"
import { Redis } from "ioredis"
import ViteExpress from "vite-express"
import session from "cookie-session"
import crypto from "crypto"
import { Worker, Queue } from "bullmq"
import { AsyncRedactor } from 'redact-pii'

import { RedisSessionStore } from "./sessionStore"
import type { UserSessionData } from "./sessionStore"
import { RedisMessageStore, MessageSchema } from "./messageStore"
import { Game, GameStore, PlayerDataStore, isPlayerInArray } from "./game"
import type { Player } from "./game"
import { myLogger } from "./logger"

const app = express()
const server = http.createServer(app)


// TYPE STRUGGLES

interface SessionObject {
    sessionId: string
}

declare module 'express-session' {
  export interface SessionData {
    sessionId: string
  }
}

declare module 'node:http' {
  interface IncomingMessage {
    session: SessionObject
  }
}


// CONSTANTS

const randomId = () => crypto.randomBytes(8).toString("hex")


// START SOCKET IO SERVER

const io = new Server(server)


// GET DIRNAME

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))


// SETUP PRODUCTION AND DEVELOPMENT

const environment = process.env.NODE_ENV || 'development'

let chatAppUrl
let redisHost = process.env.REDIS_HOST || "127.0.0.1"
let redisPort = process.env.REDIS_PORT || "6379"
let redisUri = `redis://${redisHost}:${redisPort}`
let redisClient = new Redis(redisUri, { maxRetriesPerRequest: null })

if (environment === 'development') {
    console.log('Running in development mode')
    chatAppUrl = "/../../chat.html"
} else if (environment === 'production') {
    console.log('Running in production mode')
    chatAppUrl = "/../../dist/chat.html"
    app.use(express.static(__dirname + '/../../dist/assets'))
} else {
  throw new Error("Environment needs to be set")
}


// INITIALIZE SESSION

const sessionMiddleware = session({
  secret: "itsnotreallysecret",
  resave: true,
  saveUninitialized: true,
})

app.use(sessionMiddleware)

io.engine.use(sessionMiddleware)


// EXPRESS ROUTES

app.get("/chat/:sessionId", (_req, res) => {
  res.sendFile(resolve(__dirname + chatAppUrl))
})


// INITIALIZE REDIS STORAGE

const sessionStore = new RedisSessionStore(redisClient)
const messageStore = new RedisMessageStore(redisClient)
const gameStore = new GameStore(redisClient)
const playerDataStore = new PlayerDataStore(redisClient)


// SOCKET IO SERVER

io.use(async (socket, next) => {

  // sessionId is extracted from the url in the frontend
  let sessionId = socket.handshake.auth.sessionId

  console.log("=====")
  console.log("from socket auth")
  console.log(sessionId)
  console.log("=====")

  // If we can find a session restore it 
  const session = await sessionStore.findSession(sessionId)
  if (session !== undefined) {
    console.log(`Loaded from session, sessionId: ${sessionId}`)
    console.log(`Loaded from session, gameId: ${session.gameId}`)
    const userSessionData: UserSessionData = {
      sessionId: sessionId,
      userId: session.userId,
      gameId: session.gameId,
      connected: session.connected,
    }
    socket.data.userSessionData = userSessionData
    return next()
  }
  console.log("===============")
  console.log("not loaded from session creating a new one")
  console.log("===============")

  // This can only be the case when connecting to socket.io server not through the browser
  // For example when testing the server load
  if (sessionId === undefined) { 
    sessionId = randomId()
  }

  const userSessionData: UserSessionData = {
    sessionId: sessionId,
    userId: randomId(),
    gameId: "",
    connected: true,
  }

  sessionStore.saveSession(userSessionData)

  socket.data.userSessionData = userSessionData
  next()
})


io.on("connection", async (socket) => {
  const redactor = new AsyncRedactor();

  const player: Player = {
    sessionId: socket.data.userSessionData.sessionId, 
    userId: socket.data.userSessionData.userId
  }

  sessionStore.updateSessionField(player.sessionId, "connected", true)
  myLogger(player, {"state": "connected"})

  // Emit session details
  socket.emit("session", player)

  // Join the user to a channel with userId as identifier
  socket.join(player.userId)

  // If game found load game else join queue
  let game = await gameStore.load(socket.data.userSessionData.gameId)

  if (game !== undefined && game.gameState !== "results") {
    console.log("Already in a game")
    await game.syncGameForSinglePlayer(io, messageStore, playerDataStore, player)
  } else {
    console.log("Not in a game add player to game")
    await waitingQueue.add("participant", player)
  }

  socket.on("private message", ({ content, to }) => {
    to.forEach((recipient: string) => {
      console.log("Generated content: ", content)
      
      redactor.redactAsync(content).then(redactedText => {
        // Hi NAME, Please give me a call at PHONE_NUMBER
        console.log("Redacted content: ",redactedText);
      });
      const result = MessageSchema.safeParse({content: content, fromUserId: player.userId, toUserId: recipient})
      if (result.success) {
        const message = result.data
        socket.to(recipient).to(player.userId).emit("private message", message)
        messageStore.saveMessage(message)
      }
    })
    myLogger(player, {"content": content, "to": to})
  })

  socket.on("typing", ({ to }) => {
    to.forEach((recipient: string) => {
      socket.to(recipient).emit("typing", player.userId)
    })
  })

  socket.on("disconnect", async () => {
    removeFromPlayers(player.userId)
    const matchingSockets = await io.in(player.userId).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
      socket.broadcast.emit("user disconnected", player.userId)
      sessionStore.updateSessionField(player.sessionId, "connected", "false")
      myLogger(player, {"state": "disconnected"})
    }
  })

  // socket on game logic
  socket.on("game state set like topic", async ({likeTopic}) => {
    const userSessionData = await sessionStore.findSession(player.sessionId)
    if (userSessionData !== undefined) {
      playerDataStore.setPlayerData(userSessionData.gameId, player, "like topic", likeTopic)
    }
  })

  socket.on("game state set like imposter", async ({likeImposter}) => {
    const userSessionData = await sessionStore.findSession(player.sessionId)
    if (userSessionData !== undefined) {
      playerDataStore.setPlayerData(userSessionData.gameId, player, "like imposter", likeImposter)
    }
  })

  socket.on("game state set chosen imposter", async ({chosenImposter}) => {
    const userSessionData = await sessionStore.findSession(player.sessionId)
    if (userSessionData !== undefined) {
      playerDataStore.setPlayerData(userSessionData.gameId, player, "chosen imposter color", chosenImposter)
    }
  })

})


// QUEUE LOGIC

async function emptyQueue(queue: Queue) {
  await queue.obliterate({ force: true });
  console.log('Queue emptied');
}

const gameQueue = new Queue('gameQueue', { connection: redisClient });
const waitingQueue = new Queue('waitingQueue', { connection: redisClient });
emptyQueue(waitingQueue)
emptyQueue(gameQueue)


const nPlayers = 4 
let players: Player[] = []

function removeFromPlayers(userId: string) {
  players.forEach((el, idx, arr) => {
    if (el.userId === userId) {
      arr.splice(idx, 1)
    }
  })
}

// works because concurrency level is 1
const waitingQueueWorker = new Worker('waitingQueue', async (job) => {
    if (job.data !== undefined && isPlayerInArray(players, job.data) === false) {
      players.push(job.data)
    }
    if (players.length ===  nPlayers) {
      await gameQueue.add("game", {players: players});
      players.length = 0
    } else {
      // send the waiting queue count to players
      players.forEach((player) => {
        const playersNeeded = nPlayers - players.length
        io.to(player.userId).emit("update players needed", playersNeeded)
      })
    }
  }, { 
    connection: redisClient
});

const gameQueueWorker = new Worker('gameQueue', async (job) => {
  await gameLoop(job.data.players)
  }, { 
    connection: redisClient,
    concurrency: 1000
  }
)


// GAMELOOP LOGIC

async function gameLoop(players: Player[]) {
  try { // needed for development else you wont see any error messages

    // Create a game
    let gameId = randomId()
    let game = new Game(gameId, players)

    game.registerGame(sessionStore)
    await game.play(io, gameStore, messageStore, playerDataStore)
    game.unregisterGame(sessionStore)

  } catch (error) {
    console.log(error)
  }
}


// START SERVER

server.listen(3000, () =>
  console.log(`server listening at http://localhost:${3000}`)
)

ViteExpress.bind(app, server)
