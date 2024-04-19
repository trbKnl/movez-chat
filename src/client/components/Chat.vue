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
                 <h2 class="text-xl font-bold">Chat Room</h2>
              </div>

              <div v-if="propsChatRound !== undefined">

                <!-- You -->
                <div class="bg-gray-100 p-4 rounded-md m-1">
                  <div class="flex flex-wrap">
                  <div :class="'w-6 m-1 h-6 rounded-full ' + playerColorMapping[propsChatRound.playerColor]"></div>
                    <h3 class="text-lg font-semibold">You</h3>
                    <user class="ml-3" :connected="playerConnected" />
                  </div>
                  <p>Topic: {{ propsChatRound.playerChosenTopic }} </p>
                  <p>Talks about: {{ propsChatRound.playerChosenTalksAbout }}</p>
                </div>
                
                <!-- Partner -->
                <div class="bg-gray-100 p-4 rounded-md m-1">
                  <div class="flex flex-wrap">
                    <div :class="'w-6 m-1 h-6 rounded-full ' + playerColorMapping[propsChatRound.partnerColor]"></div>
                    <h3 class="text-lg font-semibold">Partner</h3>
                    <user class="ml-3" :connected="user.connected" />
                  </div>
                  <p>Topic: {{ propsChatRound.partnerChosenTopic }}</p>
                  <p>Talks about: {{ propsChatRound.partnerChosenTalksAbout }}</p>
                </div>

                <progress-bar class="m-1" :value="chatRoundProgressValue" />
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

import socket from "../socket";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";
import Waiting from './Waiting.vue';
import InfoScreen from './InfoScreen.vue';
import ProgressBar from './ProgressBar.vue';
import TopicScreen from './TopicScreen.vue'
import VotingScreen from './VotingScreen.vue'
import ResultScreen from './ResultScreen.vue'

import { PlayerColorMapping } from '../config'

import type { ChooseTopicScreenData, VotingScreenData, ChatRoundData, ResultScreenData, PlayerColor } from '../../server/game.ts'
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
    playerColorMapping: Record<PlayerColor, string>
    chatRoundProgressValue: number,
    infoText: string,
    playerConnected: boolean,
  } {
    return {
      user: {},
      currentScreen: "Waiting", // currentScreen is controlled by showScreen() method

      showInfoScreen: false,

      propsChooseTopicScreen: undefined,
      propsVotingScreen: undefined,
      propsChatRound: undefined,
      propsResultScreen: undefined,

      playerColorMapping: PlayerColorMapping,
      chatRoundProgressValue: 0, // progress bar data
      infoText: "",
      playerConnected: true,
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

    showScreen(screenToShow: ShowScreen) {
      this.currentScreen = screenToShow
    },

    handleCloseInfoScreen() {
      this.showInfoScreen = false
    },

  },
  created() {

    socket.on("game state users", (user) => {
      this.playerConnected = true
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

    socket.on("disconnect", () => {
      this.playerConnected = false
    })
  },
};
</script>

<style scoped>
</style>
