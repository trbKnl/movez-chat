<template>
    <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div>
      <div class="z-50 text-center">
          <div class="bg-white p-8 rounded-lg shadow-lg">
              <img src="/public/images/movez.png" alt="Avatar"  class="mx-auto mb-2 w-16 h-16" />
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Waiting for {{playersNeeded}} more players <span id="dots" class="ml-1">...</span></h2>
          </div>
      </div>
    </div>
</template>

<script>
import socket from "../socket";

export default {
  data() {
    return {
      playersNeeded: "3",
    }
  },
  created() {
    socket.on("update players needed", (playersNeeded) => {
      this.playersNeeded = playersNeeded
    })
  }
}

</script>

<style scoped>
  @keyframes pulse {
      0%, 100% {
          opacity: 1;
      }
      50% {
          opacity: 0;
      }
  }
  #dots {
      animation: pulse 1.5s infinite;
  }
</style>
