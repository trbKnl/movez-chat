import express from 'express'
import http from 'http'
import { Server } from "socket.io"
import { Redis } from "ioredis"
import ViteExpress from "vite-express"
import session from "express-session"
import crypto from "crypto"
import { Worker, Queue } from "bullmq"

import { RedisSessionStore } from "./sessionStore"
import type { UserSessionData } from "./sessionStore"
import { RedisMessageStore, MessageSchema } from "./messageStore"
import { Game, GameStore, isPlayerInArray } from "./game"
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
let redisClient
let redisHost
let redisPort
let redisUri
let domain

if (environment === 'development') {
    console.log('Running in development mode')
    chatAppUrl = "/../../chat.html"
    redisClient = new Redis()
} else if (environment === 'production') {
    chatAppUrl = "/../../dist/chat.html"
    app.use(express.static(__dirname + '/../../dist/assets'))
    redisHost = process.env.REDIS_HOST || "localhost"
    redisPort = process.env.REDIS_PORT || "6379"
    redisUri = `redis://${redisHost}:${redisPort}`
    domain = process.env.DOMAIN || "http://localhost"
    redisClient = new Redis(redisUri)
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

app.get("/chat/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId
  req.session.sessionId = sessionId
  res.sendFile(resolve(__dirname + chatAppUrl))
})


// INITIALIZE REDIS STORAGE

const sessionStore = new RedisSessionStore(redisClient)
const messageStore = new RedisMessageStore(redisClient)
const gameStore = new GameStore(redisClient)


// SOCKET IO SERVER

io.use(async (socket, next) => {
  let sessionId = socket.request.session.sessionId 

  console.log("=====")
  console.log("from url")
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

  // If game found load game
  let game = await gameStore.load(socket.data.userSessionData.gameId)

  //console.log("=====")
  //console.log("from game")
  //console.log(game)
  //console.log("=====")

  if (game !== undefined && game.gameOngoing === true) {
    console.log("Already in a game")
    await game.sendPartnerToPlayer(io, messageStore, player)
  } else {
    console.log("Not in a game add player to game")
    await waitingQueue.add("participant", player)
  }

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    const result = MessageSchema.safeParse({content: content, fromUserId: player.userId, toUserId: to})
    if (result.success) {
      const message = result.data
      myLogger(player, message)
      socket.to(to).to(player.userId).emit("private message", message)
      messageStore.saveMessage(message)
    }
  })

  // notify users upon disconnection
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
})


// QUEUE LOGIC

async function emptyQueue(queue: Queue) {
  await queue.obliterate({ force: true });
  console.log('Queue emptied');
}

const gameQueue = new Queue('gameQueue');
const waitingQueue = new Queue('waitingQueue');
emptyQueue(waitingQueue)
emptyQueue(gameQueue)


let players: Player[] = []
const nPlayers = 4 // Only 4 really makes sense

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
    connection: new Redis({
      host: "0.0.0.0",
      port: 6379,
      maxRetriesPerRequest: null
  })
});


// GAMEQUEUE

const gameQueueWorker = new Worker('gameQueue', async (job) => {
  await gameLoop(job.data.players)
  }, { 
    connection: new Redis({
      host: "0.0.0.0",
      port: 6379,
      maxRetriesPerRequest: null
    }),
    concurrency: 1000
  }
)


// GAMELOOP LOGIC

async function gameLoop(players: Player[]) {
  try { // needed for development else you wont see any error messages

    console.log("==========================")
    console.log("these are the players")
    console.log(players)
    console.log("==========================")

    // Create a game
    let gameId = randomId()
    let game  = new Game(gameId, players)

    game.nextRound()
    await gameStore.save(game)

    // Register game with players
    game.registerGame(sessionStore)

    // Main game loop
    while (game.gameOngoing) {
      await game.sendPartnerToAllPlayers(io, messageStore)
      await game.sleepAndUpdateProgress(io)

      game.nextRound()
      await gameStore.save(game)
    }

    game.unregisterGame(sessionStore)
    game.endGame(io)

    console.log("END GAME")
  } catch (error) {
    console.log(error)
  }
}


// START SERVER

server.listen(3000, () =>
  console.log(`server listening at http://localhost:${3000}`)
)

ViteExpress.bind(app, server)
