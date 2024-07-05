<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex justify-center bg-white items-center z-50 overflow-auto"
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
					<div class="mt-5 mb-2 gif-container relative">
						<iframe
							src="https://giphy.com/embed/j4fbBhYgu8mNEHkQ4w"
							width="480"
							height="480"
							style=""
							frameBorder="0"
							class="giphy-embed"
							allowFullScreen
						></iframe>
						<div class="overlay absolute top-0 left-0 w-full h-full"></div>
					</div>

					<p class="text-4xl">HERE IS A FUNNY GIF FOR YOU ;)</p>
				</div>

				<div v-else>
					<h1 class="font-bold text-5xl text-center text-movez-purple">
						GUESS THE IMPOSTER?
					</h1>
					<div
						v-for="(color, index) in playerColorsNotYourOwn"
						:key="index"
						:class="[
							'flex justify-center items-center mt-10 wrapper ml-[3rem] mr-[3rem] border-4 border-transparent hover:border-movez-purple cursor-pointer',
							{ 'bg-[#6e0069] text-white': chosenImposter === color },
						]"
						@click="(event) => handleClick(event, color)"
					>
						<div class="flex justify-center items-center flex-2">
							<img :src="iconMapping[color]" :alt="color" class="w-20" />
						</div>

						<p class="text-5xl flex justify-center items-center flex-1">
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
						:key="playerColor"
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
				"Fluffy Cat": CatIcon,
				"Dreamy Sloth": SlothIcon,
				"Funky Panda": PandaIcon,
				"Bouncy Dog": DogIcon,
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
		socket.on(
			"game state progress update",
			({ percentageComplete, secondsLeft }) => {
				this.progressBarValue = percentageComplete;
				this.secondsLeftInRound = secondsLeft;
			}
		);
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
			this.setImposterChoice(color);
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
</style>
