<template>

<div>
   <!-- Full Screen Overlay -->
   <div v-if="showWaiting">
      <waiting />
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
              <progress-bar :value="chatRoundProgressValue" />
            </div>
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
      <div v-if="showQuitConfirmation" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
         <div class="bg-white p-8 rounded-lg">
            <h2 class="text-xl font-bold mb-4">Confirm Quit</h2>
            <p>Are you sure you want to quit the game?</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="confirmQuit">Yes, Quit</button>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="cancelQuit">Cancel</button>
         </div>
      </div>
      <div v-else-if="showInfoScreen">
         <info-screen :info-text="infoText" @closeInfoScreen="handleCloseInfoScreen()" />
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
import Waiting from './Waiting.vue';
import InfoScreen from './InfoScreen.vue';
import ProgressBar from './ProgressBar.vue';

export default {
  name: "Chat",
  components: { 
    User, 
    MessagePanel,
    ThankYou,
    Card,
    Waiting,
    InfoScreen,
    ProgressBar 
  },
  data() {
    return {
      selectedUser: null,
      users: [],
      cardFlipped: true,
      randomMessage: '',
      showDialog: false,
      shownMessages: [],
      showThankYou: false,
      showWaiting: true,
      chatRoundProgressValue: 0,
      showQuitConfirmation: false,
      showInfoScreen: true,
      infoText: "DjoMomma"
    };
  },
  methods: {
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

    closeWaiting(nUsers) {
      if (nUsers > 0) {
          console.log(nUsers)
          this.showWaiting = false
      }
    },

    handleCloseInfoScreen() {
      this.showInfoScreen = false
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

    // Check if overlay can be closed upon creation
    this.closeWaiting(this.users.length)

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
    };

    // USER CONNECTION EVENTS LISTENERS
    socket.on("game state users", (users) => {
      console.log("USERS EVENT")
      this.closeWaiting(users.length)
      this.users = []

      users.forEach((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.fromUserId === socket.userId;
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

    socket.on("game state partner connected", (partnerId) => {
      for (let i = 0; i < this.users.length; i++) {
        const existingUser = this.users[i];
        if (existingUser.userId === partnerId) {
          existingUser.connected = true;
        }
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

    socket.on("private message", ({ content, fromUserId, toUserId }) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        const fromSelf = socket.userId === fromUserId;
        if (user.userId === (fromSelf ? toUserId : fromUserId)) {
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
    socket.on("game state end", () => {
      this.confirmQuit()
    })

    socket.on("game state progress update", (progress) => {
      this.chatRoundProgressValue = progress
    })

    socket.on("game state show infoscreen", (message) => {
      this.showInfoScreen = true
      this.infoText = message
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
</style>
