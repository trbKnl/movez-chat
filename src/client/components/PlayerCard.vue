<template>
	<div
	  class="flex mt-1 p-5 items-center"
	  :class="{ 'bg-movez-purple text-white': playerData.isCurrentPlayer }"
	>
	  <img :src="getPlayerIcon(playerData.color)" class="w-16 h-16" />
	  <div class="text-xl ml-3">
      <div v-if="playerData.isCurrentPlayer">
        <div v-if="playerData.playerRole === 'Imposter'">
        <div v-if="playerData.likeTopic === 'like'">
          {{ gameTexts.chatScreenYouLike }}. <br />
          {{ gameTexts.overviewImposterAssignmentLike }}
        </div>
        <div v-else>
          {{ gameTexts.chatScreenYouDislike }} <br />
          {{ gameTexts.overviewImposterAssignmentDislike }}
        </div>
        </div>
        <div v-else>
        <div v-if="playerData.likeTopic === 'like'">
          {{ gameTexts.chatScreenYouLike }}
        </div>
        <div v-else>
          {{ gameTexts.chatScreenYouDislike }}
        </div>
        </div>
      </div>
      <div v-else>
      <div v-if="playerData.playerRole === 'Imposter'">
        <div v-if="playerData.likeTopic === 'like'">
        {{ gameTexts.chatScreenPlayerDislike.replace(/<PLAYER>/g, playerData.color) }}
        </div>
        <div v-else>
        {{ gameTexts.chatScreenPlayerLike.replace(/<PLAYER>/g, playerData.color) }}
        </div>
      </div>
      <div v-else>
        <div v-if="playerData.likeTopic === 'like'">
        {{ gameTexts.chatScreenPlayerLike.replace(/<PLAYER>/g, playerData.color) }}
        </div>
        <div v-else>
        {{ gameTexts.chatScreenPlayerDislike.replace(/<PLAYER>/g, playerData.color) }}
        </div>
      </div>
      </div>
      <div :class="isTyping ? 'block' : 'invisible'" class="text-sm">
        ... is typing
      </div>
	  </div>
	</div>
</template>
<script>
import socket from "../socket";
import StatusIcon from "./StatusIcon.vue";
import { PlayerColorMapping } from "../config";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";


export default {
	name: "User",
	components: { StatusIcon },
	props: [
    "playerData",
    "gameTexts",
  ],
	methods: {
		getPlayerIcon(color) {
			return this.iconMapping[color] || null;
		},
	},
	data() {
		return {
			playerColorMapping: PlayerColorMapping,
			iconMapping: {
				'Fluffy Cat': CatIcon,
				'Dreamy Sloth': SlothIcon,
				'Funky Panda': PandaIcon,
				'Bouncy Dog': DogIcon,
			},
      isTyping: false
		};
	},
	computed: {
		status() {
			return this.playerData.connected ? "online" : "offline";
		},
	},
	mounted() {
		console.log("Player Data:", this.playerData);
	},
  created() {

    // Display is typing for 1 second
    var timerId
    socket.on("typing", (userId) => {
      if (this.playerData.userId === userId) {
        this.isTyping = true;
        clearTimeout(timerId);

        timerId = setTimeout(() => {
          this.isTyping = false;
        }, 1000);
      }
    });
  },
};
</script>

<style scoped>
</style>
