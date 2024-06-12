<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
	>
		<div class="absolute w-full h-full bg-movez-purple"></div>
		<div class="z-50 text-movez-green">
			<div class="flex flex-col items-center justify-center">
				<h2 class="mb-2 text-6xl">Your role is</h2>
				<h1 class="mb-2 font-bold text-7xl mt-10">{{ playerRole }}</h1>
				<img :src="playerIcon" alt="player icon" class="mt-10" />
				<div
					class="player-role text-4xl font-bold mt-10 text-center"
					v-if="playerRole === 'Imposter'"
				>
          <div v-if="likeTopic === 'like'">
            {{ gameTexts.overviewImposterAssignmentLike }}
          </div>
          <div v-else>
            {{ gameTexts.overviewImposterAssignmentDislike }}
          </div>
				</div>
				<div v-else class="player-role text-4xl font-bold mt-10 text-center">
          {{ gameTexts.overviewPlayerAssignment }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";

export default {
	props: [
    "playerColor", 
    "playerRole", 
    "likeTopic",
    "gameTexts",
  ],
	data() {
		return {
			iconMapping: {
				Yellow: CatIcon,
				Green: SlothIcon,
				Blue: PandaIcon,
				Red: DogIcon,
			},
		};
	},
	computed: {
		playerIcon() {
			return this.iconMapping[this.playerColor] || null;
		},
	},
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Fat;
	src: url("/public/fonts/Fieldwork22GeoFat.otf");
}
@font-face {
	font-family: Fieldwork-Bold;
	src: url("/public/fonts/Fieldwork16GeoBold.otf");
}
h1 {
	font-family: Fieldwork-Fat, Arial, Helvetica, sans-serif;
}
.player-role {
	font-family: Fieldwork-Bold, Arial, Helvetica, sans-serif;
}
img {
	width: 250px;
}
</style>
