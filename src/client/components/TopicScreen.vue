<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <p class="text-lg font-semibold text-gray-800 mb-2">You are the {{ playerColor }} Player</p>
        <p class="text-lg font-semibold text-gray-800 mb-5">Your role: {{ playerRole }} </p>
          <div class="flex flex-col mb-3">
            <p>Topic</p>
            <input v-model="chosenTopic" @input="handleInput" placeholder="Enter Topic" class="p-2 bg-gray-100 rounded-md" />
          </div>
          <div class="flex flex-col">
            <p>Talks about</p>
            <input v-model="chosenTalksAbout" @input="handleInput" placeholder="Enter talks about" class="p-2 bg-gray-100 rounded-md" />
          </div>

          <ProgressBar class="mt-1" :value="progressBarValue" />
 <!--                            <p class="text-lg font-semibold text-gray-800 mb-2">{{ topicQuestion }} </p>
<TopicMenu :menuOptions="topicOptions" @chosenOption="setChosenTopic"/> -->
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue"
import ProgressBar from "./ProgressBar.vue"
import _ from 'lodash'

export default {
  components: {
    TopicMenu,
    ProgressBar,
  },
  data() {
    return {
      //chosenTopic: "" 
      chosenTopic: "",
      chosenTalksAbout: "",
      progressBarValue: 0
    };
  },
  props: [ 
    "playerColor",
    "playerRole",
    //"topicQuestion",
    //"topicOptions",
  ],
  created() {
    socket.on("game state progress update", (progress) => {
      this.progressBarValue = progress
    })
  },
  methods: {
    handleInput: _.debounce(function() {
      console.log(`topic ${this.chosenTopic}, talksAbout ${this.chosenTalksAbout}`)
      socket.emit("game state set topic", {
        chosenTopic: this.chosenTopic,
        chosenTalksAbout: this.chosenTalksAbout
      })
    }, 2000)
  }
    //selectOption(option) {
    //  this.selectedOption = option;
    //  this.isMenuOpen = false;
    //},

    //toggleMenu() {
    //  this.isMenuOpen = !this.isMenuOpen;
    //},

    //setChosenTopic(chosenTopic) {
    //  this.chosenTopic = chosenTopic
    //  socket.emit("game state set topic", {chosenTopic})
    //}
}
</script>

<style scoped>
</style>

