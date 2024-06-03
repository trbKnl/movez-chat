<template>
	<div v-if="!showThankYou">
		<div
			class="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-50"
		>
			<div class="absolute w-full h-full bg-gray-800 opacity-50"></div>
			<div
				class="z-50 text-center bg-movez-purple w-4/12 h-60 rounded-lg flex items-center justify-center my-7"
			>
				<div class="">
					<div v-if="playerRole === 'Imposter'">
						<p class="mb-2">Your were the imposter</p>
					</div>

					<div v-else>
						<p class="mb-2">The {{ imposterColor }} user was the imposter</p>
					</div>

					<p class="mb-2">Player score {{ playerScore }}/3</p>
					<p class="">Imposter score {{ imposterScore }}/3</p>

					<div v-if="playerWon === true">
						<p>Congrats on getting that right!</p>
					</div>

					<!-- <div v-if="showThankYou">
					<thank-you></thank-you>
				</div> -->
				</div>
        <button
				class="bg-movez-purple text-white p-9 font-bold rounded-lg"
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

export default {
	components: {
		TopicMenu,
		ThankYou,
	},
	data() {
		return {
			showThankYou: false,
		};
	},
	props: [
		"playerScore",
		"playerRole",
		"imposterScore",
		"imposterColor",
		"playerWon",
	],
	methods: {
		handleContinue() {
			this.showThankYou = true;
		},
	},
};
</script>

<style scoped>
button {
	color: white;
  position:absolute;
	bottom:200px;
}
</style>
