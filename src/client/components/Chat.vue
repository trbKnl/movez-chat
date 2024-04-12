<template>

<div>
   <div v-if="currentScreen === 'Waiting'">
      <waiting />
   </div>

   <div v-else-if="currentScreen === 'ChooseTopic'">
      <TopicScreen v-bind="propsChooseTopicScreen"/>
   </div>

   <div v-else-if="currentScreen === 'VotingScreen'">
      <VotingScreen v-bind="propsVotingScreen"/>
   </div>

   <div v-else-if="currentScreen === 'ChatScreen'">
      <div class="flex">
         <div class="w-1/3 bg-gray-300">
            <div class="p-3">
               <div class="flex items-center justify-between p-4">
                  <h2 class="font-semibold">Currently Online</h2>
               </div>
               <user :user="user" :selected="true" />
              <progress-bar :value="chatRoundProgressValue" />
              <div v-if="propsChatRound !== undefined">
                <h3>Your color: {{ propsChatRound.playerColor }}</h3>
                <h3>Your chosen topic: {{ propsChatRound.playerChosenTopic }}</h3>
                <h3>Your role: {{ propsChatRound.playerRole }}</h3>
                <h3>Partner color: {{ propsChatRound.partnerColor }}</h3>
                <h3>Partner chosen topic: {{ propsChatRound.partnerChosenTopic }}</h3>
              </div>

            </div>
         </div>
         <div class="w-2/3">
            <message-panel
               v-if="user"
               :user="user"
               @input="onMessage"
               />
         </div>
      </div>

      <div v-if="showInfoScreen">
         <InfoScreen :infoText="infoText" @close="handleCloseInfoScreen()" />
      </div>
   </div>

   <div v-else-if="currentScreen === 'ResultScreen'">
      <ResultScreen v-bind="propsResultScreen"></ResultScreen>
   </div>
</div>

</template>

<script lang="ts">
// CODE IS NOT COMPLETELY IN TYPESCRIPT
// only this component is partly written in typescript yet
// other components aren't

import socket from "../socket";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";
import Waiting from './Waiting.vue';
import InfoScreen from './InfoScreen.vue';
import ProgressBar from './ProgressBar.vue';
import TopicScreen from './TopicScreen.vue'
import VotingScreen from './VotingScreen.vue'
import ResultScreen from './ResultScreen.vue'

import type { ChooseTopicScreenData, VotingScreenData, ChatRoundData, ResultScreenData } from '../../server/game.ts'
type ShowScreen = "Waiting" | "ChooseTopic" | "ChatScreen" | "VotingScreen" | "ResultScreen" | "ThankYou" 

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
  data(): {
    user: any,
    currentScreen: ShowScreen,
    propsChooseTopicScreen: ChooseTopicScreenData | undefined,
    propsVotingScreen: VotingScreenData | undefined,
    propsChatRound: ChatRoundData | undefined,
    propsResultScreen: ResultScreenData | undefined,

    showInfoScreen: boolean,

    chatRoundProgressValue: number,
    infoText: string,
  } {
    return {
      user: {},
      currentScreen: "Waiting", // currentScreen is controlled by showScreen() method

      showInfoScreen: false,

      propsChooseTopicScreen: undefined,
      propsVotingScreen: undefined,
      propsChatRound: undefined,
      propsResultScreen: undefined,

      chatRoundProgressValue: 0, // progress bar data

      infoText: "",
    }
  },
  methods: {
    onMessage(content: any) {
      socket.emit("private message", {
        content,
        to: this.user.userId,
      });
      this.user.messages.push({
        content,
        fromSelf: true,
      });
    },

    // These screens are controlled using flags
    showScreen(screenToShow: ShowScreen) {
      this.currentScreen = screenToShow
    },

    handleCloseInfoScreen() {
      this.showInfoScreen = false
    },


  },
  created() {

    socket.on("game state users", (user) => {
      this.showScreen("ChatScreen")
      user.messages.forEach((message: any) => {
        message.fromSelf = message.fromUserId === socket.userId;
      });
      this.user = user
    })

    socket.on("game state partner connected", (partnerId) => {
      if (this.user.userId === partnerId) {
        this.user.connected = true;
      }
    });

    socket.on("user disconnected", (id) => {
      if (this.user.userId === id) {
        this.user.connected = false;
      }
    });

    socket.on("private message", ({ content, fromUserId, toUserId }) => {
      const fromSelf = socket.userId === fromUserId;
      if (this.user.userId === (fromSelf ? toUserId : fromUserId)) {
        this.user.messages.push({
          content,
          fromSelf,
        });
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
      this.showScreen("VotingScreen")
      this.propsVotingScreen = data
    })

    socket.on("game state choose topic", (data) => {
      this.showScreen("ChooseTopic")
      this.propsChooseTopicScreen = data
    })

    socket.on("game state result screen", (data) => {
      this.showScreen("ResultScreen")
      this.propsResultScreen = data
    })

    socket.on("game state chat round info", (data) => {
      this.propsChatRound = data
    })

  },
};
</script>

<style scoped>
</style>
