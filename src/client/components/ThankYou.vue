<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50 text-center">
      <div class="bg-white p-8 rounded-lg shadow-lg">

        <img src="/public/images/movez.png" alt="Avatar" class="mx-auto mb-2 w-16 h-16" />

        <div v-if="!isSubmitted">
          <p class="text-lg font-semibold text-gray-800 mb-2">Thank You!</p>
          <p class="text-gray-700 mb-4">We hope you enjoyed the game. Please share your suggestions with us.</p>
          <textarea v-model="suggestions" class="p-3 resize-none w-full border rounded-md focus:outline-none focus:border-blue-500 h-30" placeholder="Your suggestions..."></textarea>
          <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="submit">Submit</button>
        </div>

        <div v-else>
          <p class="text-lg font-semibold text-gray-800 mb-2">Thank you for participating in our experiment!</p>
          <p class="text-gray-700">Your feedback has been invaluable.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      suggestions: '',
      isSubmitted: false, 
    };
  },
  methods: {
    submit() {
      this.$emit('submit-suggestion', this.suggestions);
      this.isSubmitted = true; 
    }
  }
}
</script>

<style scoped>
</style>
