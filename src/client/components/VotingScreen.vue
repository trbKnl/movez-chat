<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex justify-center bg-white mt-10 pt-10 z-50"
	>
		<div class="absolute w-full h-full bg-white"></div>
		<div class="z-50 text-center">
			<div class="flex flex-col items-center">
				<div
					class="flex flex-col items-center"
					v-if="playerRole === 'Imposter'"
				>
					<h1 class="font-bold text-5xl text-movez-purple">
						HEY IMPOSTOR! SIT BACK AND RELAX ...
					</h1>
					<h1 class="font-bold text-5xl text-movez-purple">
						THE OTHERS ARE BUSY VOTING.
					</h1>
					<div class="mt-5 mb-2 gif-container">
						<iframe
							src="https://giphy.com/embed/j4fbBhYgu8mNEHkQ4w"
							width="480"
							height="480"
							style=""
							frameBorder="0"
							class="giphy-embed"
							allowFullScreen
						></iframe>
						<div class="overlay"></div>
					</div>

					<p class="text-4xl">HERE IS A FUNNY GIF FOR YOU ;)</p>
				</div>

				<div v-else>
					<h1 class="font-bold text-5xl text-movez-purple">
						GUESS THE IMPOSTER?
					</h1>
					<div
						v-for="(color, index) in playerColorsNotYourOwn"
						:key="index"
						class="flex justify-center mt-10 wrapper border-4 border-transparent hover:border-movez-purple cursor-pointer"
						@click="(event) => handleClick(event, color)"
					>
						<img :src="iconMapping[color]" :alt="color" class="w-20" />
						<p class="text-5xl flex items-center justify-center mx-9">
							{{ color }}
						</p>
					</div>
					<p class="mt-10 text-lg">
						Vote for the player who YOU think is the imposter.
					</p>
					<p class="text-lg">If you do not choose, the imposter might win...</p>
				</div>

				<div class="flex flex-col h-[35px] w-[350px] mt-5">
          <ProgressBar 
            :percentageComplete="progressBarValue" 
            :showTimerOnPercentageComplete="0" 
            :secondsLeft="secondsLeftInRound"
          />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue";
import ProgressBar from "./ProgressBar.vue";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";

export default {
	components: {
		TopicMenu,
		ProgressBar,
	},
	data() {
		return {
			chosenImposter: "",
			progressBarValue: 0,
			secondsLeftInRound: -1,
			iconMapping: {
				Yellow: CatIcon,
				Green: SlothIcon,
				Blue: PandaIcon,
				Red: DogIcon,
			},
		};
	},
	props: ["playerColor", "playerRole", "playerColors"],
	computed: {
		playerColorsNotYourOwn() {
			return this.playerColors.filter((item) => item !== this.playerColor);
		},
	},
	created() {
    socket.on("game state progress update", ({ percentageComplete, secondsLeft }) => {
			this.progressBarValue = percentageComplete;
			this.secondsLeftInRound = secondsLeft;
		});
	},
	methods: {
		toggleMenu() {
			this.isMenuOpen = !this.isMenuOpen;
		},

		setImposterChoice(chosenImposter) {
			this.chosenImposter = chosenImposter;
			socket.emit("game state set chosen imposter", { chosenImposter });
		},

		handleClick(event, color) {
      this.setImposterChoice(color)
			if (this.clickedElement) {
				this.clickedElement.classList.remove("clicked");
			}
			this.clickedElement = event.currentTarget;
			this.clickedElement.classList.add("clicked");
		},
	},
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Fat;
	src: url("/public/fonts/Fieldwork22GeoFat.otf");
}
h1 {
	font-family: Fieldwork-Fat, sans-serif;
}
.gif-container {
	position: relative;
}

.overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.clicked {
	background-color: #6e0069;
	color: white;
}
</style>
