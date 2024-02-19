<template>

  <div class="flex flex-col items-center justify-center mt-10">
    <div class="btn container mx-auto hover:cursor-pointer" @click="nextCard">
      <div class="bg-white rounded-lg overflow-hidden m-4 shadow-2xl">
        <div class="px-4 py-2 sm:min-h-32 md:min-h-64 flex flex-col">
          <transition name="fade" mode="out-in">
            <p :key="randomMessage" class="flex flex-grow justify-center items-center text-gray-600 font-semibold sm:text-sm md:text-lg">
              {{ randomMessage }} 
            </p>
          </transition>
        </div>
        <div class="flex items-center justify-between px-4 py-2 bg-gray-900">
          <p class="text-gray-200">Click for the next topic</p>
        </div>
      </div>
    </div>

    <div class="container mx-auto">
      <div class="border border-gray-100 rounded-lg mr-4 ml-4">
        <!-- Progress Bar Container -->
        <div class="bg-gray-200 rounded-full h-8 overflow-hidden m-4">
          <!-- Progress Bar -->
          <div :style="{ width: progressValue + '%' }" class="bg-purple-600 h-full"></div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import socket from "../socket";

export default {
  name: "Card",
  components: { },
  data() {
    return {
      cardFlipped: true,
      randomMessage: '',
      progressValue: 0,
      ripples: [],
      isBouncing: false,
    };
  },
  methods: {
    bounceUp() {
      this.isBouncing = true;
      setTimeout(() => {
        this.isBouncing = false;
      }, 1000); // Adjust timing as needed
    },
    nextCard() {
      socket.emit("next card")
    },

    showCard(card) {
        this.randomMessage = card
    },

    updateProgress(progressValue) {
      this.progressValue = progressValue
      if (this.$refs.progressBar !== undefined) {
          this.$refs.progressBar.style.width = `${this.progressValue}%`;
      }
    },

		animateRipple: function(e) {
			let el  = this.$refs.tiBtn;
			let pos = el.getBoundingClientRect();
			
			this.ripples.push({
				x: e.clientX - pos.left,
				y: e.clientY - pos.top,
				show: true
			});
		},

		rippleEnd: function(i) {
			this.ripples[i].show = false;
		},

  },
  created() {
    // When component created ask the server for a game update
    socket.emit("send game update")

    // GAME EVENT LISTENER
    socket.on("update game", ({roomId, card, progress}) => {
      console.log(`UPDATE RECEIVED: ${roomId}, ${card}, ${progress}`)
      if (socket.roomId === roomId) {
        this.showCard(card)
        this.updateProgress(progress)
      }
    })

  },
  destroyed() {
    socket.off("update game");
  },
};
</script>

<style scoped>

   .btn {
     transition: all 0.3s ease;
   }

   .btn:hover {
     transform: scale(1.05);
   }

   .btn:focus {
     outline: none;
     transform: scale(0.95);
   }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

</style>
