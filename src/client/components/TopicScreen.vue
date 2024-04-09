<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50 text-center">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <p class="text-lg font-semibold text-gray-800 mb-2">{{ playerColor }} Player</p>
        <p class="text-lg font-semibold text-gray-800 mb-2">Your role: {{ role }} </p>
        <p class="text-lg font-semibold text-gray-800 mb-2">{{ topicQuestion }} </p>
        <TopicMenu :menuOptions="topicOptions" @chosenOption="setChosenTopic"/>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue"

export default {
  components: {
    TopicMenu
  },
  data() {
    return {
      chosenTopic: "" // SEND THIS USING SOCKET.IO
    };
  },
  props: [ 
    "playerColor",
    "role",
    "topicQuestion",
    "topicOptions",
  ],
  methods: {
    selectOption(option) {
      this.selectedOption = option;
      this.isMenuOpen = false;
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    setChosenTopic(chosenTopic) {
      this.chosenTopic = chosenTopic
      socket.emit("game state set topic", {chosenTopic})
    }
  }
}
</script>

<style scoped>
</style>

