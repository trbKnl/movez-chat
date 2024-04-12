<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50 text-center">

      <div class="bg-white p-8 rounded-lg shadow-lg">
        <div v-if="playerRole === 'Imposter'">
          <p class="text-lg font-semibold text-gray-800 mb-2">Your were the imposter</p>
        </div>

        <div v-else>
          <p class="text-lg font-semibold text-gray-800 mb-2">The {{ imposterColor}} user was the imposter</p>
        </div>

        <p class="text-lg font-semibold text-gray-800 mb-2">Player score {{ playerScore }}/3</p>
        <p class="text-lg font-semibold text-gray-800 mb-2">Imposter score {{ imposterScore }}/3</p>

        <div v-if="playerWon === true">
          <p>Congrats on getting that right!</p>
        </div>


        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="handleContinue">Continue</button>
        <div v-if="showThankYou">
          <thank-you ></thank-you>
        </div>
    </div>
  </div>
  </div>
</template>

<script>
import TopicMenu from "./TopicMenu.vue"
import ThankYou from './ThankYou.vue';

export default {
  components: {
    TopicMenu,
    ThankYou
  },
  data() {
    return {
      showThankYou: false
    }
  },
  props: [ 
    "playerScore",
    "playerRole",
    "imposterScore",
    "imposterColor",
    "playerWon",
  ],
  methods: {
    handleContinue() {
      this.showThankYou = true
    }
  }
}
</script>

<style scoped>
</style>

