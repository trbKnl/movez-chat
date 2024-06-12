<template>

<div>
   <div v-if="currentScreen === 'Waiting'">
      <waiting />
   </div>

   <div v-else-if="currentScreen === 'ChooseTopic'">
      <TopicScreen v-bind="propsChooseTopicScreen"/>
   </div>

   <div v-else-if="currentScreen === 'OverviewScreen'">
      <OverviewScreen v-bind="propsOverviewScreen"/>
   </div>

   <div v-else-if="currentScreen === 'VotingScreen'">
      <VotingScreen v-bind="propsVotingScreen"/>
   </div>

   <div v-else-if="currentScreen === 'ChatScreen'">
      <ChatScreen v-bind="propsChatScreen" />

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

import socket from "../socket";
import Waiting from './Waiting.vue';
import InfoScreen from './InfoScreen.vue';
import TopicScreen from './TopicScreen.vue'
import VotingScreen from './VotingScreen.vue'
import ResultScreen from './ResultScreen.vue'
import ChatScreen from './ChatScreen.vue'
import OverviewScreen from './OverviewScreen.vue'


import type { ChooseTopicScreenData, VotingScreenData, ChatScreenData, ResultScreenData, OverviewScreenData } from '../../server/game.ts'
type ShowScreen = "Waiting" | "ChooseTopic" | "OverviewScreen" | "ChatScreen" | "VotingScreen" | "ResultScreen" | "ThankYou" 

export default {
  name: "Game",
  components: { 
    Waiting,
    InfoScreen,
    TopicScreen,
    VotingScreen,
    ResultScreen,
    ChatScreen,
    OverviewScreen,
  },
  data(): {
    currentScreen: ShowScreen,

    propsChooseTopicScreen: ChooseTopicScreenData | undefined,
    propsVotingScreen: VotingScreenData | undefined,
    propsChatScreen: ChatScreenData | undefined,
    propsResultScreen: ResultScreenData | undefined,
    propsOverviewScreen: OverviewScreenData | undefined,
    showInfoScreen: boolean,

    infoText: string,
  } {
    return {
      currentScreen: "Waiting", // currentScreen is controlled by showScreen() method
      showInfoScreen: false,

      propsChooseTopicScreen: undefined,
      propsVotingScreen: undefined,
      propsChatScreen: undefined,
      propsResultScreen: undefined,
      propsOverviewScreen: undefined,

      infoText: "",
    }
  },
  methods: {
    showScreen(screenToShow: ShowScreen) {
      this.currentScreen = screenToShow
    },

    handleCloseInfoScreen() {
      this.showInfoScreen = false
    },

  },
  created() {
    socket.on("game state show infoscreen", (message) => {
      this.showInfoScreen = true
      this.infoText = message
    })

    socket.on("game state chat screen", (data) => {
      this.showScreen("ChatScreen")
      this.propsChatScreen = data
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

    socket.on("game state show overview screen", (data) => {
      this.showScreen("OverviewScreen")
      this.propsOverviewScreen = data
    })
  },
};
</script>

<style scoped>
</style>
