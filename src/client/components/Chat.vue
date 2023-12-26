<template>
  <div>
    <div class="left-panel">
      <div class="users-section">
       <h2 class="users-header">Currently Online</h2>
          <user
            v-for="user in users"
            :key="user.userID"
            :user="user"
            :selected="selectedUser === user"
            @select="onSelectUser(user)"
          />
        </div>

      <!-- Card Pile Section -->
      <div class="cards-section">
        <div class="card-pile" @click="flipCard">
          <div v-if="!cardFlipped" class="card-back"></div>
          <div v-else class="card-front">{{ randomMessage }}</div>
        </div>
      </div>



    </div>
    <message-panel
      v-if="selectedUser"
      :user="selectedUser"
      @input="onMessage"
      class="right-panel"
    />
  </div>
</template>

<script>
import socket from "../socket";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";

export default {
  name: "Chat",
  components: { User, MessagePanel },
  data() {
    return {
      selectedUser: null,
      users: [],
      cardFlipped: false,
      randomMessage: '',
      showDialog: false,
    };
  },
  methods: {
  async flipCard() {
    this.cardFlipped = !this.cardFlipped;
    if (this.cardFlipped) {
      // Option 1: Generate message on client-side
      this.randomMessage = this.generateRandomMessage();
      console.log(this.randomMessage)
      // Option 2: Fetch message from server
      // this.randomMessage = await this.fetchRandomMessageFromServer();
    }
  },
  generateRandomMessage() {
    const messages = ["Message 1", "Message 2", "Message 3","Message 4", "Message 5", "Message 6","Message 7", "Message 8", "Message 9", /* ...more messages */];
    return messages[Math.floor(Math.random() * messages.length)];
  },
    async fetchRandomMessageFromServer() {
      // Fetch message from server and return it
      // Example: const response = await axios.get('/api/random-message');
      // return response.data.message;
    },
    onMessage(content) {
      if (this.selectedUser) {
        socket.emit("private message", {
          content,
          to: this.selectedUser.userID,
        });
        this.selectedUser.messages.push({
          content,
          fromSelf: true,
        });
      }
    },
    onSelectUser(user) {
      this.selectedUser = user;
      user.hasNewMessages = false;
    },
  },
  created() {

    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
    };

    socket.on("users", (users) => {
      users.forEach((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userID;
        });
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            existingUser.messages = user.messages;
            return;
          }
        }
        user.self = user.userID === socket.userID;
        initReactiveProperties(user);
        this.users.push(user);
      });
      // put the current user first, and sort by username
      this.users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });

    socket.on("user connected", (user) => {
      console.log(`MY SOCKET ROOM ${socket.room}`)
      console.log(`USER CONNECTED SOCKET ROOM ${user.room}`)
      if (socket.room === user.room) {
          for (let i = 0; i < this.users.length; i++) {
            const existingUser = this.users[i];
            if (existingUser.userID === user.userID) {
              existingUser.connected = true;
              return;
            }
          }
          initReactiveProperties(user);
          this.users.push(user);
     }
    });

    socket.on("user disconnected", (id) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.userID === id) {
          user.connected = false;
          break;
        }
      }
    });

    socket.on("private message", ({ content, from, to }) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        const fromSelf = socket.userID === from;
        if (user.userID === (fromSelf ? to : from)) {
          user.messages.push({
            content,
            fromSelf,
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
    });
    
  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
  },
};
</script>

<style scoped>

.right-panel {
    margin-left: 360px;
  }

  .left-panel {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 360px;
    display: flex;
    flex-direction: column;
    background-color: #3f0e40;
    color: white;
  }

  .users-section {
    overflow-y: auto;
    margin: 20px;
    /* Other styling as needed */
  }

  .cards-section {
    position: absolute; /* Absolute positioning */
    top: 50%; /* Center vertically */
    left: 50%; /* Center horizontally */
    transform: translate(-50%, -50%); /* Adjust for the size of the cards-section */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-pile {
     cursor: pointer;
     perspective: 1000px;
     width: 200px; /* Increased by 20% */
     height: 290px; /* Increased by 20% */
     position: relative;
     background-color: #FFF;
     color: black;
     display: flex;
     align-items: center;
     justify-content: center;
     text-align: center;
     font-size: 20px;
     border: 1px solid #ddd; /* Add border */
     box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2); /* Add shadow for depth */
     border-radius: 8px; /* Optional: rounded corners */
     transform-style: preserve-3d;

   }

   .card-pile:hover {
     cursor: pointer; /* Hand pointer on hover */
   }

   .card-back, .card-front {
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 10px; /* Rounded corners typical of playing cards */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
    border: 5px solid #000; /* Black border */

    background-color: #FFF; /* White background */
    display: flex;
    color: black;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    transition: transform 0.6s;
  }

  .card-back {
    /* Design for the back of the card, often a pattern or solid color */
    background-image: url('/images/card.png');


  }

  .card-front {
    /* Design for the front of the card */
    font-size: 25px; /* Adjust as needed */
    /* Add indices (e.g., number and suit) in the corners */
    &:before, &:after {
      content: 'A ♠'; /* Example: Ace of Spades */
      position: absolute;
      font-size: 24px; /* Smaller font size for indices */
    }
    &:before {
      top: 10px; /* Position at top-left corner */
      left: 10px;
    }
    &:after {
      bottom: 10px; /* Position at bottom-right corner */
      right: 10px;
      transform: rotate(180deg); /* Upside-down for bottom-right */
    }
  }

</style>
