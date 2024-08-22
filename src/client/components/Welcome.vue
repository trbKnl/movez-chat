<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 overflow-auto"
	>
		<div class="absolute w-full h-full bg-white"></div>
		<div class="z-50 text-center flex justify-center items-center w-[1500px]">
			<div class="bg-white p-8 flex flex-col justify-center items-center">
				<h1 class="text-6xl text-movez-purple mt-3">Between Us</h1>

				<HowToPlaySlider @updateSlideIndex="handleSlideIndexUpdate" />

				<button
					:class="{
						'cursor-not-allowed bg-gray-400 opacity-50': slideIndex !== 6,
						'bg-movez-green': slideIndex === 6,
					}"
					:disabled="slideIndex !== 6"
					class="text-white font-bold py-2.5 text-[17px] px-10 rounded mt-12"
					@click="$emit('startChat')"
				>
					Start Game
				</button>
				<div class="flex items-center justify-center">
					<img
						class="w-30 h-24 mr-[400px]"
						src="../../../public/images/Logo_Erasmus.svg"
						alt="erasmus-logo"
					/>

					<img
						src="../../../public/images/movez_secondary-logo.svg"
						alt="movez-logo"
						class="w-30 h-24"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import HowToPlaySlider from "./HowToPlaySlider.vue";

export default {
	name: "Welcome",
	components: {
		HowToPlaySlider,
	},
	emits: ["startChat"],
	data() {
		return {
			slideIndex: 1,
		};
	},
	methods: {
		handleSlideIndexUpdate(index) {
			this.slideIndex = index;
		},
	},
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Bold;
	src: url("/public/fonts/Fieldwork16GeoBold.otf");
}
h1 {
	font-family: Fieldwork-Bold, Arial, Helvetica, sans-serif;
}
</style>
