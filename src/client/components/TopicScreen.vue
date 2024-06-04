<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <p class="text-lg font-semibold text-gray-800 mb-2">You are the {{ playerColor }} Player</p>
        <p class="text-lg font-semibold text-gray-800 mb-5">{{ topicQuestion }} </p>
        <ThumbMenu @isThumbUp="thumbMenuCallback"/>
        <ProgressBar class="mt-1" :value="progressBarValue" />
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
      //chosenTopic: "" 
      chosenTopic: "",
      chosenTalksAbout: "",
      progressBarValue: 0
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
    thumbMenuCallback(thumbValue) {
      console.log(`like topic value: ${thumbValue}`)
      socket.emit("game state set topic", {
        likeTopic: thumbValue
      })
    }
  }
}
</script>

<style scoped>
</style>

