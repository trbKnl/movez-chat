<template>

  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50 text-center">
      <div class="bg-white p-8 rounded-lg shadow-lg">

        <img src="/public/images/movez.png" alt="Avatar" class="mx-auto mb-2 w-16 h-16" />
        <div>{{ infoText }}</div>
        <progress-bar :value="progressValue" />

      </div>
    </div>
  </div>


</template>

<script>
import socket from "../socket";
import ProgressBar from "./ProgressBar.vue";

export default {
  name: "InfoScreen",
  emits: ["infoScreenTimerComplete"],
  components: { ProgressBar },
  props: [ "infoText" ],
  data() {
    return {
      progressValue: 0,
      progressBarDuration: 3,
    };
  },
  methods: {
    startProgressBarTimer(seconds) {
      const duration = seconds * 1000
      const steps = 100
      const increment = (duration / steps)
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += (100 / steps); 
        this.progressValue = Math.min(Math.round(currentProgress), 100); 
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          this.$emit('infoScreenTimerComplete');
        }
      }, increment);
    }
  },
  created() {
     this.startProgressBarTimer(this.progressBarDuration);
  }
}
</script>
