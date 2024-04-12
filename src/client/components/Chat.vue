<template>

<div>
   <div v-if="showWaiting">
      <waiting />
   </div>

   <div v-else-if="showChooseTopic">
      <TopicScreen v-bind="propsChooseTopicScreen"/>
   </div>

   <div v-else-if="showVotingScreen">
      <VotingScreen v-bind="propsVotingScreen"/>
   </div>

   <div v-else-if="showChatScreen">
      <div class="flex">
         <div class="w-1/3 bg-gray-300">
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

              <h3>Your color: {{ propsChatRound.playerColor }}</h3>
              <h3>Your chosen topic: {{ propsChatRound.playerColor }}</h3>
              <h3>Your role: {{ propsChatRound.playerRole }}</h3>
              <h3>Partner color: {{ propsChatRound.partnerColor }}</h3>
              <h3>Partner chosen topic: {{ propsChatRound.partnerChosenTopic }}</h3>

            </div>
         </div>
         <div class="w-2/3">
            <message-panel
               v-if="selectedUser"
               :user="selectedUser"
               @input="onMessage"
               />
         </div>
      </div>

      <div v-if="showInfoScreen">
         <info-screen :info-text="infoText" @close="handleCloseInfoScreen()" />
      </div>
   </div>

   <div v-else-if="showResultScreen">
      <ResultScreen v-bind="propsResultScreen"></ResultScreen>
   </div>
</div>

</template>

<script>
import socket from "../socket";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";
import Waiting from './Waiting.vue';
import InfoScreen from './InfoScreen.vue';
import ProgressBar from './ProgressBar.vue';
import TopicScreen from './TopicScreen.vue'
import VotingScreen from './VotingScreen.vue'
import ResultScreen from './ResultScreen.vue'



export default {
  name: "Chat",
  components: { 
    User, 
    MessagePanel,
    Waiting,
    InfoScreen,
    ProgressBar,
    TopicScreen,
    VotingScreen,
    ResultScreen,
  },
  data() {
    return {
      selectedUser: null,
      users: [],

      // TODO CHANGE TO TYPESCRIPT

      // These are controled using a method called showScreen()
      showWaiting: true,
      showChooseTopic: false,
      showChatScreen: false,
      showVotingScreen: false,
      showResultScreen: false,
      showThankYou: false,

      showQuitConfirmation: false,
      showInfoScreen: false,

      propsChooseTopicScreen: null,
      propsVotingScreen: null,
      propsChatRound: null,
      propsResultScreen: null,

      // progress bar data
      chatRoundProgressValue: 0,
    }
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

    // These screens are controlled using flags
    showScreen(inputFlag) {
        this.showWaiting = inputFlag === 'showWaiting'
        this.showChooseTopic = inputFlag === 'showChooseTopic'
        this.showChatScreen = inputFlag === 'showChatScreen'
        this.showVotingScreen = inputFlag === 'showVotingScreen'
        this.showResultScreen = inputFlag === 'showResultScreen'
        this.showThankYou = inputFlag === 'showThankYou'
    },

    handleCloseInfoScreen() {
      this.showInfoScreen = false
    },

    setActiveUser(user) {
      if (user.self === false) {
        this.selectedUser = user;
        user.hasNewMessages = false;
      }
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

    // USER CONNECTION EVENTS LISTENERS
    socket.on("game state users", (users) => {
      this.showScreen("showChatScreen")
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

    socket.on("game state progress update", (progress) => {
      this.chatRoundProgressValue = progress
    })

    socket.on("game state show infoscreen", (message) => {
      this.showInfoScreen = true
      this.infoText = message
    })

    socket.on("game state show voting screen", (data) => {
      this.showScreen("showVotingScreen")
      this.propsVotingScreen = data
    })

    socket.on("game state choose topic", (data) => {
      this.showScreen("showChooseTopic")
      this.propsChooseTopicScreen = data
    })

    socket.on("game state result screen", (data) => {
      this.showScreen("showResultScreen")
      this.propsResultScreen = data
    })

    socket.on("game state chat round info", (data) => {
      this.propsChatRound = data
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
