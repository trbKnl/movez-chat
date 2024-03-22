import express from 'express'
import http from 'http'
const app = express()
const server = http.createServer(app)
import { Server } from "socket.io"
import Redis from "ioredis"
import ViteExpress from "vite-express"
import session from "express-session"
import winston  from "winston"
import crypto from "crypto"

import { Worker, Queue } from "bullmq"

import { Player, Game, GameStore } from "./game.js"



// CONSTANTS

const randomId = () => crypto.randomBytes(8).toString("hex")


// START SOCKET IO SERVER

const io = new Server(server)

// CONFIGURE LOGGER

const logger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(), 
    ),
    transports: [
        new winston.transports.Console(), 
    ]
})


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
  secret: "changeit",
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

import { RedisSessionStore } from "./sessionStore.js"
const sessionStore = new RedisSessionStore(redisClient)

import { RedisMessageStore } from "./messageStore.js"
const messageStore = new RedisMessageStore(redisClient)

let gameStore = new GameStore(new Redis())



// SOCKET IO SERVER
//
//
//

io.use(async (socket, next) => {
  console.log(`Extracted from url, sessionId: ${socket.request.session.sessionId}`)

  const sessionId = socket.request.session.sessionId 

  // If we can find a session restore it 
  const session = await sessionStore.findSession(sessionId)
  if (session) {

    console.log(session)
    console.log(`Loaded from session, sessionId: ${sessionId}`)
    console.log(`Loaded from session, gameId: ${session.gameId}`)
    socket.sessionId = sessionId
    socket.userId = session.userId
    socket.gameId = session.gameId
    return next()
  }

  // If sessions cannot be found
  socket.sessionId = sessionId
  socket.userId = randomId()
  socket.gameId = ""

  // store newly created session
  sessionStore.saveSession(sessionId, {
    userId: socket.userId,
    gameId: socket.gameId,
    connected: true,
  })

  next()
})

io.on("connection", async (socket) => {


  const player = new Player(socket.sessionId, socket.userId)

  sessionStore.updateSessionField(socket.sessionId, "connected", true)
  logger.log("info", {"sessionId": `${socket.sessionId}`, "state": "connected"})

  // Emit session details
  socket.emit("session", {
    sessionId: socket.sessionId,
    userId: socket.userId,
  })

  // Join the user to a channel with userId as identifier
  socket.join(socket.userId)

  // If game found load game
  if (socket.gameId !== "") {
    console.log("ALREADY IN GAME")
    console.log(socket.gameId)
    let game = await gameStore.load(socket.gameId)
    game.sendPartnerToPlayer(io, player)
  } else {
    console.log("NOT IN A GAME ADDED TO QUEUE")
    await waitingQueue.add("participant", player)
  }

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private message", ({ content, to }) => {
    const message = {
      content,
      from: socket.userId,
      to,
    }
    logger.log("info", {"sessionId": `${socket.sessionId}`, "message": `${JSON.stringify(message)}`, })
    socket.to(to).to(socket.userId).emit("private message", message)
    messageStore.saveMessage(message)
  })

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    removeFromPlayers(socket.userId)
    const matchingSockets = await io.in(socket.userId).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userId)
      sessionStore.updateSessionField(socket.sessionId, "connected", false)
      logger.log("info", {"sessionId": `${socket.sessionId}`, "state": "disconnected"})
    }
  })
})



// QUEUE LOGIC

async function emptyQueue(queue) {
  await queue.obliterate({ force: true });
  console.log('Queue emptied');
}

const gameQueue = new Queue('gameQueue');
const waitingQueue = new Queue('waitingQueue');
emptyQueue(waitingQueue)
emptyQueue(gameQueue)


let players = []
const nPlayers = 2 // Only 4 really makes sense

function removeFromPlayers(userId) {
  players.forEach((el, idx, arr) => {
    if (el.userId === userId) {
      arr.splice(idx, 1)
    }
  })
}

// works because concurrency level is 1
const waitingQueueWorker = new Worker('waitingQueue', async (job) => {
    if (job.data !== undefined) {
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
    concurrency: 50 
  }
)


// GAMELOOP LOGIC

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function gameLoop(playerDataArr) {
  /**
 * @param  {Array} players [should be length 4 containing player userId's]
 */
  try { // needed for development else you wont see any error messages

    console.log("==========================")
    console.log(playerDataArr)

    const players = playerDataArr.map((player) => {return Player.createFromObject(player)})
    console.log(players)
    console.log("==========================")

    // create a game
    let gameId = randomId()
    let game  = new Game(gameId, players)
    game.nextRound()
    await gameStore.save(gameId, game)

    // Register game with players
    players.forEach((player) => {
      sessionStore.updateSessionField(player.sessionId, "gameId", gameId) 
    })

    while (game.gameOngoing) {
      game.sendPartnerToAllPlayers(io)
      await sleep(game.duration)
      game.nextRound()
      await gameStore.save(gameId, game)
    }

    // Unregister game with players
    players.forEach((player) => {
      sessionStore.updateSessionField(player.sessionId, "gameId", "") 
    })
    players.forEach((player) => {
      io.to(player.userId).emit("game end")
    })
    console.log("END GAME")
  } catch (error) {
    console.log(error)
  }
}


function messageToAllPlayers(userIds, currentRound) {
  // A round consists of pairs of players
  userIds.forEach((userId) => {
    for (const pair of currentRound) {
      if (pair.includes(userId)) {
        const partnerId = pair.find(id => id !== userId)
        console.log("EMIT MESSAGE")
        const message = {
          content: `Message from this system you are now chatting with ${partnerId}`,
          from: partnerId,
          to: userId,
        }
        io.to(userId).emit("private message", message)
      }
    }
  })
}




// START SERVER

server.listen(3000, () =>
  console.log(`server listening at http://localhost:${3000}`)
)

ViteExpress.bind(app, server)
