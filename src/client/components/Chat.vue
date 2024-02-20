<template>

  <div>
    <!-- Full Screen Overlay -->
    <div v-if="showOverlay" class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
      <div class="z-50 text-center">
          <div class="bg-white p-8 rounded-lg shadow-lg">
              <img src="/public/images/movez.png" alt="Avatar"  class="mx-auto mb-2 w-16 h-16" />
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Waiting for your chat partner<span id="dots" class="ml-1">...</span></h2>
          </div>
      </div>
    </div>

   <div v-else-if="!showThankYou">
    <div class="flex">
      <!-- Left Panel Content -->
      <div class="w-1/3 bg-gray-300">
        <!-- Active Users Section -->
        <div class="p-3">
           <div class="flex items-center justify-between p-4">
             <h2 class="font-semibold">Currently Online</h2>
             <button @click="quitGame" class="w-8 h-auto">
                 <img src="/public/images/exit.svg" alt="Quit" />
               </button>
          </div>
            <user
              v-for="user in users"
              :key="user.userId"
              :user="user"
              :selected="selectedUser === user"
              @select="setActiveUser(user)"
            />
        </div>

        <!-- Card Game -->
        <card />

    </div>
    <!-- Right Panel Content -->
    <div class="w-2/3">
        <message-panel
          v-if="selectedUser"
          :user="selectedUser"
          @input="onMessage"
      />
      </div>
    </div>

    <!-- Quit Confirmation Modal -->
    <div v-if="showQuitConfirmation" class="modal">
      <div class="modal-content">
        <h2>Confirm Quit</h2>
        <p>Are you sure you want to quit the game?</p>
        <button @click="confirmQuit">Yes, Quit</button>
        <button @click="cancelQuit">Cancel</button>
      </div>
    </div>

    <div v-if="showQuitConfirmation" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div class="bg-white p-8 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Confirm Quit</h2>
        <p>Are you sure you want to quit the game?</p>
        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="confirmQuit">Yes, Quit</button>
        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="cancelQuit">Cancel</button>
      </div>
    </div>


  </div>
    <thank-you v-else @submit-suggestion="handleSuggestion"></thank-you>
  </div>

</template>

<script>
import socket from "../socket";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";
import ThankYou from './ThankYou.vue';
import Card from './Card.vue';

export default {
  name: "Chat",
  components: { User, MessagePanel, ThankYou, Card },
  data() {
    return {
      selectedUser: null,
      users: [],
      cardFlipped: true,
      randomMessage: '',
      showDialog: false,
      shownMessages: [],
      showThankYou: false,
      showOverlay: true,
      progressValue: 0,
      showQuitConfirmation: false,
    };
  },
  methods: {
    nextCard() {
      socket.emit("next card")
    },

    showCard(card) {
        this.randomMessage = card
    },

    updateProgress(progressValue) {
      this.progressValue = progressValue
      if (this.$refs.progressBar !== undefined) {
          this.$refs.progressBar.style.width = `${this.progressValue}%`;
      }
    },

    onMessage(content) {
      if (this.selectedUser) {
        socket.emit("private message", {
          content,
          to: this.selectedUser.userId,
        });
        this.selectedUser.messages.push({
          content,
          fromSelf: true,
        });
      }
    },

    setActiveUser(user) {
      if (user.self === false) {
        this.selectedUser = user;
        user.hasNewMessages = false;
      }
    },

    quitGame() {
      this.showQuitConfirmation = true;
    },

    confirmQuit() {
      this.showThankYou = true;
    },

    cancelQuit() {
      this.showQuitConfirmation = false;
    },

    handleSuggestion(suggestion) {
      socket.emit("suggestion", suggestion)
    },

    closeOverlay(nUsers) {
      if (nUsers >= 2) {
          this.showOverlay = false
          socket.emit("send game update")
      }
    }
  },
  created() {
    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    // When component created ask the server for a game update
    socket.emit("send game update")

    socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    // Check if overlay can be closed upon creation
    this.closeOverlay(this.users.length)

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
    };

    // USER CONNECTION EVENTS LISTENERS
    socket.on("users", (users) => {
      console.log("USERS EVENT")
      this.closeOverlay(users.length)
      users.forEach((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userId;
        });
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i];
          if (existingUser.userId === user.userId) {
            existingUser.connected = user.connected;
            existingUser.messages = user.messages;
            return;
          }
        }
        user.self = user.userId === socket.userId;
        initReactiveProperties(user);
        this.setActiveUser(user)
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
      console.log("USER CONNECTED EVENT")
      console.log(`User connected to with roomId: ${socket.roomId}`)
      console.log(`The current users room is roomId ${user.roomId}`)
      if (socket.roomId === user.roomId) {
          for (let i = 0; i < this.users.length; i++) {
            const existingUser = this.users[i];
            if (existingUser.userId === user.userId) {
              existingUser.connected = true;
              return;
            }
          }
          initReactiveProperties(user);
          this.setActiveUser(user)
          this.users.push(user);
          this.closeOverlay(this.users.length)
     }
    });

    socket.on("user disconnected", (id) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.userId === id) {
          user.connected = false;
          break;
        }
      }
    });

    socket.on("private message", ({ content, from, to }) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        const fromSelf = socket.userId === from;
        if (user.userId === (fromSelf ? to : from)) {
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

    // GAME EVENT LISTENERS
    socket.on("update game", ({roomId, card, progress}) => {
      console.log(`UPDATE RECEIVED: ${roomId}, ${card}, ${progress}`)
      if (socket.roomId === roomId) {
        this.showCard(card)
        this.updateProgress(progress)
      }
    })

  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
    socket.off("update game");
  },
};
</script>

<style scoped>
  @keyframes pulse {
      0%, 100% {
          opacity: 1;
      }
      50% {
          opacity: 0;
      }
  }
  #dots {
      animation: pulse 1.5s infinite;
  }


</style>
