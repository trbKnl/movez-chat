<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50 text-center">

      <div class="bg-white p-8 rounded-lg shadow-lg">
        <div v-if="playerRole === 'Imposter'">

          <p class="text-lg font-semibold text-gray-800 mb-2">You were the imposter </p>
          <p>The other players are now voting who they think was the imposter</p>
        </div>

        <div v-else>
          <p class="text-lg font-semibold text-gray-800 mb-2">Guess the imposter?</p>
          <TopicMenu :menuLabel="'Select the imposter'" :menuLabelChosen="'You picked: '" :menuOptions="playerColorsNotYourOwn" @chosenOption="setImposterChoice"/>
        </div>

        <ProgressBar class="mt-4" :value="progressBarValue" />
      </div>

    </div>
  </div>
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue"
import ProgressBar from "./ProgressBar.vue"

export default {
  components: {
    TopicMenu,
    ProgressBar,
  },
  data() {
    return {
      chosenImposter: "",
      progressBarValue: 0,
    };
  },
  props: [ 
    "playerColor",
    "playerRole",
    "playerColors",
  ],
  computed: {
    playerColorsNotYourOwn() {
      return this.playerColors.filter(item => item !== this.playerColor);
    }
  },
  created() {
    socket.on("game state progress update", (progress) => {
      this.progressBarValue = progress
    })
  },
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

