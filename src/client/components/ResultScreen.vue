<template>
	<div v-if="!showThankYou">
		<div
			class="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-50"
		>
			<div class="absolute w-full h-full bg-white opacity-50"></div>
			<div
				class="z-50 text-center relative bg-movez-purple w-4/12 h-60 rounded-lg flex items-center justify-center my-7 w-[700px] h-[400px]"
			>
				<div class="text-white text-[33px]">
					<div v-if="playerRole === 'Imposter'">
						<div v-if="playerScore >= 1" class="relative">
							<img
								src="../../../public/images/sad-face.svg"
								alt="sad-face"
								class="absolute left-[-100px] bottom-[140px] w-[200px]"
							/>
							<p class="lose">
								Uh-Uh: The investigators caught you! The investigators win!
							</p>
						</div>
						<div v-else class="relative">
							<img
								src="../../../public/images/smiling-face.svg"
								alt="smiling-face"
								class="absolute left-[-140px] bottom-[130px] w-[200px]"
							/>
							<Confetti />
							<p>Well done Imposter, you tricked them all!</p>
							<p>You win!</p>
						</div>
					</div>

					<div v-else>
						<div v-if="playerWon === true" class="relative">
							<img
								src="../../../public/images/smiling-face.svg"
								alt="smiling-face"
								class="absolute left-[-100px] bottom-[130px] w-[200px]"
							/>
							<Confetti />
							<p>Well done investigator, you caught the impostor! You win!</p>
						</div>
						<div v-else class="relative">
							<img
								src="../../../public/images/sad-face.svg"
								alt="sad-face"
								class="absolute left-[-220px] bottom-[240px] w-[200px]"
							/>
							<p class="lose">Uh-Uh: You got that wrong...</p>
							<p>The Imposter was: {{ imposterColor }}</p>
							<img
								:src="imposterAvatar"
								alt="Imposter Avatar"
								class="w-[130px] mx-auto mt-4"
							/>
							<p>Better luck next time!</p>
						</div>
					</div>
				</div>
				<button
					class="bg-movez-purple text-white absolute bottom-[-110px] font-bold py-1.5 text-[17px] px-10 rounded"
					@click="handleContinue"
				>
					Continue
				</button>
			</div>
		</div>
	</div>
	<div v-if="showThankYou">
		<thank-you></thank-you>
	</div>
</template>

<script>
import TopicMenu from "./TopicMenu.vue";
import ThankYou from "./ThankYou.vue";
import Confetti from "./Confetti.vue";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";

export default {
	components: {
		TopicMenu,
		ThankYou,
		Confetti,
	},
	data() {
		return {
			showThankYou: false,
			iconMapping: {
				"Fluffy Cat": CatIcon,
				"Dreamy Sloth": SlothIcon,
				"Funky Panda": PandaIcon,
				"Bouncy Dog": DogIcon,
			},
		};
	},
	props: [
		"playerScore",
		"playerRole",
		"imposterScore",
		"imposterColor",
		"playerWon",
		"playerColor",
		"playerColors",
	],
	computed: {
		imposterAvatar() {
			return this.iconMapping[this.imposterColor] || "";
		},
		investigatorsCaught() {
			return this.playerColors.filter((color) => this.playerWon[color]);
		},
	},
	methods: {
		handleContinue() {
			this.showThankYou = true;
		},
		mounted() {
			// Debugging logs to check the values
			console.log("playerScore:", this.playerScore);
			console.log("investigatorsCaught:", this.investigatorsCaught);
		},
	},
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Fat;
	src: url("/public/fonts/Fieldwork22GeoFat.otf");
}
.lose {
	font-family: Fieldwork-Fat, sans-serif;
}
</style>
