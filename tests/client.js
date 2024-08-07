import { io } from "socket.io-client"
const URL = "http://localhost:3000"
const socket = io(URL, { autoConnect: false })

// HELPERS

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt() {
  const min = 1000
  const max = 3000
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function generateRandomSentence() {
    const subjects = ["The cat", "A dog", "The bird", "A person", "The programmer"];
    const verbs = ["jumps", "runs", "flies", "codes", "eats"];
    const objects = ["over the fence", "in the park", "to the moon", "a sandwich", "a bug"];

    const subject = getRandomElement(subjects);
    const verb = getRandomElement(verbs);
    const object = getRandomElement(objects);

    return `${subject} ${verb} ${object}.`;
}


// SETUP FAKE PARTICIPANT AND PLAY

let userId
let partnerIds = []
let gameOngoing = false

socket.on("session", (player) => {
  userId = player.userId
  gameOngoing = true
})

socket.on("game state chat screen", (chatScreenData) => {
  partnerIds = []
  chatScreenData.playerDataArray.forEach(player => {
    if (player.userId !== userId) {
      partnerIds.push(player.userId)
    }
  })
})

socket.on("private message", ({content, fromUserId, toUserId}) => {
  console.log(`received from: ${fromUserId}, to: ${toUserId}, content: ${content}`)
})

// Connect to start the game
socket.connect()

async function asyncEventLoop() {
  while (true) {
    if (gameOngoing) {
      const content = generateRandomSentence()
      socket.emit("private message", {
        content: content,
        to: partnerIds,
      })
      console.log(`userId ${userId}, send: ${content}`)
      await sleep(getRandomInt())
    } else {
      console.log("not yet in a game")
    }
    await sleep(1000)
  }
}

asyncEventLoop()
setInterval(() => {}, 1 << 30);
