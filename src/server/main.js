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

import { CardGame } from "./cardGame.js"

// CONSTANTS

const randomId = () => crypto.randomBytes(8).toString("hex")
const displayNameOfChatPartner = "Your chat partner"

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

app.get("/chat/:roomId/:username", (req, res) => {
  const roomId = req.params.roomId
  const username = req.params.username
  req.session.roomId = roomId
  req.session.username = username
  res.sendFile(resolve(__dirname + chatAppUrl))
})

// INITIALIZE REDIS STORAGE

import { RedisSessionStore } from "./sessionStore.js"
const sessionStore = new RedisSessionStore(redisClient)

import { RedisMessageStore } from "./messageStore.js"
const messageStore = new RedisMessageStore(redisClient)

import { RedisRoomStore } from "./roomStore.js"
const roomStore = new RedisRoomStore(redisClient)

// SOCKET IO SERVER

io.use(async (socket, next) => {
  console.log(`Extracted from url, roomId: ${socket.request.session.roomId}`)
  console.log(`Extracted from url, username: ${socket.request.session.username}`)

  const roomId = socket.request.session.roomId
  const username = socket.request.session.username
  //const sessionId = socket.handshake.auth.sessionId
  
  // Sessions are for the moment tied to usernames
  // In order to deal with the fact that session cookies are not shared between tabs in Safari
  // Old code is still in place for the moment
  const sessionId = socket.request.session.username 

  if (sessionId) {
    console.log(`session detected: ${sessionId}`)
    // If we can find a session restore it 
    const session = await sessionStore.findSession(sessionId)
    if (session) {
      socket.sessionId = sessionId
      socket.userId = session.userId
      socket.username = session.username
      socket.roomId = session.roomId
      console.log(`Loaded from session, username: ${session.username}`)
      console.log(`Loaded from session, roomId: ${session.roomId}`)
      //socket.sessionId = sessionId
      //socket.userId = session.userId
      //socket.username = session.username
      //socket.roomId = session.roomId
      //console.log(`Loaded from session, username: ${session.username}`)
      //console.log(`Loaded from session, roomId: ${session.roomId}`)
      return next()
    }
  }
  //socket.sessionId = randomId()
  socket.sessionId = username
  socket.userId = randomId()
  socket.username = displayNameOfChatPartner
  socket.roomId = roomId
  next()
})

io.on("connection", async (socket) => {

  // persist session
  sessionStore.saveSession(socket.sessionId, {
    userId: socket.userId,
    username: socket.username,
    connected: true,
    roomId: socket.roomId
  })

  // emit session details
  socket.emit("session", {
    sessionId: socket.sessionId,
    userId: socket.userId,
    roomId: socket.roomId
  })

  // Join the user to a channel with userId as identifier
  socket.join(socket.userId)

  // log connection
  logger.log("info", {"roomId": `${socket.roomId}`, "user": `${socket.username}`, "state": "connected"})

  // fetch existing users
  const users = []
  const [messages, sessions] = await Promise.all([
    messageStore.findMessagesForUser(socket.userId),
    sessionStore.findAllSessions(),
  ])
  const messagesPerUser = new Map()
  messages.forEach((message) => {
    const { from, to } = message
    const otherUser = socket.userId === from ? to : from
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message)
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  })

  sessions.forEach((session) => {
    if (session.roomId === socket.roomId) {
      users.push({
        userId: session.userId,
        username: displayNameOfChatPartner,
        connected: session.connected,
        messages: messagesPerUser.get(session.userId) || [],
      })
    }
  })
  socket.emit("users", users)

  // notify existing users
  socket.broadcast.emit("user connected", {
    userId: socket.userId,
    username: displayNameOfChatPartner,
    roomId: socket.roomId,
    connected: true,
    self: false,
    messages: [],
  })

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private message", ({ content, to }) => {
    const message = {
      content,
      from: socket.userId,
      to,
    }
    logger.log("info", { "roomId": `${socket.roomId}`, "user": `${socket.username}`, "message": `${JSON.stringify(message)}`, })
    socket.to(to).to(socket.userId).emit("private message", message)
    messageStore.saveMessage(message)
  })

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userId).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userId)
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        username: socket.username,
        connected: false,
        roomId: socket.roomId
      })
    logger.log("info", {"roomId": `${socket.roomId}`, "user": `${socket.username}`, "state": "disconnected"})
    }
  })

  // GAME EVENTS
  socket.join(socket.roomId)

  socket.on("send game update", async () => {
    let cardGame = await loadGame(socket.roomId)
    io.to(socket.roomId).emit("update game", {  // notice the use of io instead of socket
      roomId: socket.roomId, 
      card: cardGame.card,
      progress: cardGame.progress,
    })
  })

  socket.on("next card", async () => {
    let cardGame = await loadGame(socket.roomId)
    const progress = cardGame.currentProgress()
    cardGame.nextCard()
    io.to(socket.roomId).emit("update game", {
      roomId: socket.roomId, 
      card: cardGame.card,
      progress: progress,
    })
    logger.log("info", {"roomId": `${socket.roomId}`, "user": `${socket.username}`, "card": `${cardGame.card}`, "progress": `${cardGame.progress}`})
    saveGame(socket.roomId, cardGame)
  })

  // LOG SUGGESTION EVENT
  socket.on("suggestion", (suggestion) => { 
    logger.log("info", { "roomId": `${socket.roomId}`, "user": `${socket.username}`, "suggestion": suggestion, })
  })
})


// GAME FUNCTIONS
function saveGame(roomId, cardGame) {
    roomStore.saveRoom(roomId, { cardGame: cardGame.serialize() })
}

async function loadGame(roomId) {
  /* Try to load the game from the roomStore 
   * If no game can be found, create a game and store it in the roomStore
   * returns cardGame object, see cardGame.js
   */
  let cardGame
  let room = await roomStore.findRoom(roomId)
  if (!room) {
    cardGame = new CardGame()
    saveGame(roomId, cardGame)
  } else {
    cardGame = CardGame.createFromSerialized(room.cardGame)
  }
  return cardGame
}

function logGame(cardGame) {
  console.log(`${JSON.stringify(cardGame)}`)
}

// START SERVER

server.listen(3000, () =>
  console.log(`server listening at http://localhost:${3000}`)
)

ViteExpress.bind(app, server)
