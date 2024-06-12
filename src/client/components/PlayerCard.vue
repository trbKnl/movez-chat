<template>
	<div
		class="flex mt-3 p-5 items-center"
		:class="{ 'bg-movez-purple text-white': playerData.isCurrentPlayer }"
	>
		<img :src="getPlayerIcon(playerData.color)" class="w-20 h-20" />
		<p class="text-2xl ml-10">
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
        <div v-if="playerData.likeTopic === 'like'">
          {{ gameTexts.chatScreenPlayerLike.replace(/<PLAYER>/g, playerData.color) }}
        </div>
        <div v-else>
          {{ gameTexts.chatScreenPlayerDislike.replace(/<PLAYER>/g, playerData.color) }}
        </div>
      </div>
    </p>
	</div>
</template>

<script>
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
				Yellow: CatIcon,
				Green: SlothIcon,
				Blue: PandaIcon,
				Red: DogIcon,
			},
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
};
</script>

<style scoped>
</style>
