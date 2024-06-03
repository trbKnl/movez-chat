<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex justify-center mt-10 pt-10 z-50"
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
					<div class="flex justify-center mt-10 wrapper">
						<img src="/public/images/panda.svg" alt="panda" class="w-20" />
						<p class="text-5xl flex items-center justify-center mx-9">Panda</p>
					</div>
					<div class="flex justify-center mt-10 wrapper">
						<img src="/public/images/cat.svg" alt="cat" class="w-20" />
						<p class="text-5xl flex items-center justify-center mx-10 px-7">
							Cat
						</p>
					</div>
					<div class="flex justify-center mt-10 wrapper">
						<img src="/public/images/dog.svg" alt="dog" class="w-20" />
						<p class="text-5xl flex items-center justify-center mx-10 px-5">
							Dog
						</p>
					</div>
					<p class="mt-10 text-lg">
						Vote for the player who YOU think is the imposter.
					</p>
					<p class="text-lg">If you do not choose, the imposter might win...</p>
					<!-- <TopicMenu
						:menuLabel="'Select the imposter'"
						:menuLabelChosen="'You picked: '"
						:menuOptions="playerColorsNotYourOwn"
						@chosenOption="setImposterChoice"
					/> -->
				</div>
				<ProgressBar class="mt-4" :value="progressBarValue" />
			</div>
		</div>
	</div>
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue";
import ProgressBar from "./ProgressBar.vue";

export default {
	components: {
		TopicMenu,
		ProgressBar,
	},
	data() {
		return {
			chosenImposter: "",
			progressBarValue: 0,
		};
	},
	props: ["playerColor", "playerRole", "playerColors"],
	computed: {
		playerColorsNotYourOwn() {
			return this.playerColors.filter((item) => item !== this.playerColor);
		},
	},
	created() {
		socket.on("game state progress update", (progress) => {
			this.progressBarValue = progress;
		});
	},
	methods: {
		selectOption(option) {
			this.chosenImoster = option;
			this.isMenuOpen = false;
		},

		toggleMenu() {
			this.isMenuOpen = !this.isMenuOpen;
		},

		setImposterChoice(chosenImposter) {
			this.chosenImposter = chosenImposter;
			socket.emit("game state set chosen imposter", { chosenImposter });
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
.wrapper:hover {
	border: 4px solid #6e0069;
}
.wrapper:active {
	border: 4px #6e0069;
  background-color: #6e0069;
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
</style>
