import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server)
import Redis from "ioredis";
import ViteExpress from "vite-express";
import session from "express-session";
import winston  from "winston"

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
});


// GET DIRNAME

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));


// SETUP PRODUCTION AND DEVELOPMENT

const environment = process.env.NODE_ENV || 'development'

let chatAppUrl
let redisClient
let redisHost
let redisPort
let redisUri

if (environment === 'development') {
    console.log('Running in development mode');
    chatAppUrl = "/../../chat.html"
    redisClient = new Redis();
} else if (environment === 'production') {
    chatAppUrl = "/../../dist/chat.html"
    app.use(express.static(__dirname + '/../../dist/assets'));
    redisHost = process.env.REDIS_HOST || "localhost"
    redisPort = process.env.REDIS_PORT || "6379"
    redisUri = `redis://${redisHost}:${redisPort}`
    logger.log("info",  `REDIS URI ${redisUri}`)
    redisClient = new Redis(redisUri);
} else {
  throw new Error("Environment needs to be set")
}


// INITIALIZE SESSION

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);


// EXPRESS ROUTES

app.get("/chat/:room/:username", (req, res) => {
  const room = req.params.room;
  const username = req.params.username;
  req.session.room = room;
  req.session.username = username;
  res.sendFile(resolve(__dirname + chatAppUrl));
});

// SOCKET IO SERVER

import crypto from "crypto";
const randomId = () => crypto.randomBytes(8).toString("hex");

import { RedisSessionStore } from "./sessionStore.js";
const sessionStore = new RedisSessionStore(redisClient);

import { RedisMessageStore } from "./messageStore.js";
const messageStore = new RedisMessageStore(redisClient);

io.use(async (socket, next) => {
  console.log(`Extracted from url: ${socket.request.session.room}`)
  console.log(`Extracted from url: ${socket.request.session.username}`)
  const room = socket.request.session.room
  const username = socket.request.session.username

  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    console.log(`session detected: ${sessionID}`)
    // If we can find a session restore it 
    // Changing the url path won't have an effect after the initial click
    const session = await sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      socket.room = session.room
      console.log(`Loaded from session: ${session.username}`)
      console.log(`Loaded from session: ${session.room}`)
      return next();
    }
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username
  socket.room = room
  next();
});

io.on("connection", async (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
    room: socket.room
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
    room: socket.room
  });

  // join the "userID" room
  socket.join(socket.userID);

  // fetch existing users
  const users = [];
  const [messages, sessions] = await Promise.all([
    messageStore.findMessagesForUser(socket.userID),
    sessionStore.findAllSessions(),
  ]);
  const messagesPerUser = new Map();
  messages.forEach((message) => {
    const { from, to } = message;
    const otherUser = socket.userID === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });

  sessions.forEach((session) => {
    if (session.room === socket.room) {
      users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
        messages: messagesPerUser.get(session.userID) || [],
      });
    }
  });
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    room: socket.room,
    connected: true,
    messages: [],
  });

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private message", ({ content, to }) => {
    const message = {
      content,
      from: socket.userID,
      to,
    };
    logger.log("info", {
      "room": `${socket.room}`, 
      "user": `${socket.username}`,
      "message": `${JSON.stringify(message)}`,
    })
    socket.to(to).to(socket.userID).emit("private message", message);
    messageStore.saveMessage(message);
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
        room: socket.room
      });
    }
  });
});

server.listen(3000, () =>
  console.log(`server listening at http://localhost:${3000}`)
);

ViteExpress.bind(app, server);
