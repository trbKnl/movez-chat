<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50">
      <div class="bg-white p-8 rounded-lg shadow-lg">


        <div v-if="currentScreen == 'AssignmentScreen'">
          <p class="text-lg font-semibold text-gray-800 mb-2">You are the {{ playerColor }} Player</p>
          <p class="text-lg font-semibold text-gray-800 mb-2">2 more questions before we start the game</p>
          <button 
            @click="handleButtonClick" 
            class="text-white font-bold py-2 px-4 rounded"
            :class="{ 'bg-blue-500 hover:bg-blue-700': isButtonActive, 'bg-gray-300 cursor-not-allowed': !isButtonActive }"
            :disabled="!isButtonActive"
          >
            Continue
          </button>
        </div>
        
        <div v-else-if="currentScreen == 'LikeScreen'">
          <p class="text-lg font-semibold text-gray-800 mb-5">{{ topicQuestion }} </p>
          <ThumbMenu @isThumbUp="likeCallback"/>
          <p class="text font-semibold text-gray-800 mb-5"> Click on the thumbs-up or thumbs-down to make your choice. If you do not choose, we will decide for you</p>
          <button 
            @click="handleButtonClick" 
            class="text-white font-bold py-2 px-4 rounded"
            :class="{ 'bg-blue-500 hover:bg-blue-700': isButtonActive, 'bg-gray-300 cursor-not-allowed': !isButtonActive }"
            :disabled="!isButtonActive"
          >
            Continue
          </button>
        </div>

        <div v-else-if="currentScreen == 'ImposterScreen'">
          <p class="text-lg font-semibold text-gray-800 mb-5">Would you like to be an imposter?</p>
          <ThumbMenu @isThumbUp="imposterCallback"/>
          <p class="text font-semibold text-gray-800 mb-5"> Click on the thumbs-up or thumbs-down to make your choice. If you do not choose, we will decide for you</p>
          <button 
            @click="handleButtonClick" 
            class="text-white font-bold py-2 px-4 rounded"
            :class="{ 'bg-blue-500 hover:bg-blue-700': isButtonActive, 'bg-gray-300 cursor-not-allowed': !isButtonActive }"
            :disabled="!isButtonActive"
          >
            Continue
          </button>
        </div>

        <div v-else>
          <p class="text-lg font-semibold text-gray-800 mb-5">Waiting for the other players to finish</p>
        </div>

        <div class="flex flex-col w-[350px] h-[35px] mt-5">
          <ProgressBar :value="progressBarValue" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue"
import ProgressBar from "./ProgressBar.vue"
import ThumbMenu from "./ThumbMenu.vue"


export default {
  components: {
    TopicMenu,
    ProgressBar,
    ThumbMenu,
  },
  data() {
    return {
      progressBarValue: 0,
      currentScreen: "AssignmentScreen",
      screens: ["AssignmentScreen", "LikeScreen", "ImposterScreen", "Waiting"],
      isButtonActive: true
    };
  },
  props: [ 
    "playerColor",
    "topicQuestion",
  ],
  created() {
    socket.on("game state progress update", (progress) => {
      this.progressBarValue = progress
    })
  },
  methods: {
    likeCallback(thumbValue) {
      console.log(`like topic value: ${thumbValue}`)
      socket.emit("game state set like topic", {
        likeTopic: thumbValue
      })
      this.isButtonActive = true
    },

    imposterCallback(thumbValue) {
      console.log(`like imposter value: ${thumbValue}`)
      socket.emit("game state set like imposter", {
        likeImposter: thumbValue
      })
      this.isButtonActive = true
    },

    handleButtonClick() {
      const index = this.screens.indexOf(this.currentScreen);
      if (index !== -1 && index < this.screens.length - 1) {
          this.currentScreen = this.screens[index + 1];
      } 
      this.isButtonActive = false
    },

  }
}
</script>

<style scoped>
</style>

