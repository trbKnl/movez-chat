<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50 text-center">

      <div v-if="yourRole === 'Imposter'" class="bg-white p-8 rounded-lg shadow-lg">
        <p class="text-lg font-semibold text-gray-800 mb-2">You were the imposter </p>
        <p>The other players are now voting who they think was the imposter</p>
      </div>

      <div v-else class="bg-white p-8 rounded-lg shadow-lg">
        <p class="text-lg font-semibold text-gray-800 mb-2">Time to vote! Who do you think was the imposter?</p>
        <TopicMenu :menuOptions="colorArray" @chosenOption="setImposterChoice"/>
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
      chosenImposter: "",
      colorArray: ["Yellow", "Green", "Blue", "Red"]
    };
  },
  props: [ 
    "yourColor",
    "yourRole",
  ],
  methods: {
    selectOption(option) {
      this.chosenImoster = option;
      this.isMenuOpen = false;
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    setImposterChoice(chosenImposter) {
      this.chosenImposter = chosenImposter
      socket.emit("game state set chosen imposter", {chosenImposter})
    }
  }
}
</script>

<style scoped>
</style>

