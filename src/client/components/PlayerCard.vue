<template>
  <div class="bg-gray-100 p-4 rounded-md m-1">
    <div class="flex flex-wrap">
    <div :class="'w-6 m-1 h-6 rounded-full ' + playerColorMapping[playerData.color]"></div>
      <h3 class="text-lg font-semibold">{{playerData.color}}</h3>
      <div class="status">
        <status-icon class="ml-3" :connected="playerData.connected" />{{ status }}
      </div>
    </div>
    <p>Topic: {{ playerData.chosenTopic }} </p>
    <p>Talks about: {{ playerData.chosenTalksAbout }}</p>
  </div>
</template>

<script>

import StatusIcon from "./StatusIcon.vue";
import { PlayerColorMapping } from '../config'

export default {
  name: "User",
  components: { StatusIcon },
  props: [
    "playerData",
  ],
  methods: {
  },
  data() {
    return {
      playerColorMapping: PlayerColorMapping,
    }
  },
  computed: {
    status() {
      return this.playerData.connected ? "online" : "offline";
    },
  },
};
</script>

<style scoped>

 .status {
   color: #92959e;
 }
 
 .new-messages {
   color: white;
   background-color: red;
   width: 20px;
   border-radius: 5px;
   text-align: center;
   float: right;
   margin-top: 10px;
 }
</style>
