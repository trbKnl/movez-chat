<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-400"></div> 
    <div class="z-50 text-center">
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-xl">

        <img src="/public/images/movez.png" alt="Avatar" class="mx-auto mb-2 w-16 h-16" />

        <p class="text-lg font-semibold text-gray-800 mb-2">
          Welcome
        </p>

        <p class="mb-3">
          Welcome to the Movez Lab chat application. Now that you have come up with a topic to discuss, its time to chat with each other about it! 
        </p>

        <p class="mb-3">
          You are part of 4-players team, and you will discuss on the topic with each of the players separately. One of them (or yourself) is the imposter! You will be assigned a role of player or  imposter randomly, together with a colour to help differenciate between eachother. 
        </p>

        <p class="mb-3">
          Are you a player? - try to guess who is the imposter among you!  Or, are you an imposter? Convince the others that you are not one!
        </p>

        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3" @click="$emit('startChat')">Continue</button>

    </div>
  </div>
  </div>
</template>

<script>
export default {
  emits: ["startChat"]
}
</script>

<style scoped>
</style>

