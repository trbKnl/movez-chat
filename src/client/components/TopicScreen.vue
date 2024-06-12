<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
	>
		<div class="absolute w-full h-full bg-white opacity-50"></div>
		<div class="z-50 flex flex-col items-center justify-center">
			<div
				class="flex flex-col items-center justify-center"
				v-if="currentScreen == 'AssignmentScreen'"
			>
				<div class="flex items-center justify-center">
					<img :src="getPlayerIcon(playerColor)" alt="animal" class="w-28" />
					<h1 class="font-bold text-6xl mx-8 text-movez-purple">
						You are the {{ playerColor }} Player
					</h1>
				</div>
				<h2 class="text-black text-2xl font-thin text-center">
					2 more questions before we start the game.
				</h2>
				<button
					@click="handleButtonClick"
					class="text-white font-bold py-2 px-4 rounded"
					:class="{
						'bg-blue-500 hover:bg-blue-700': isButtonActive,
						'bg-gray-300 cursor-not-allowed': !isButtonActive,
					}"
					:disabled="!isButtonActive"
				>
					Continue
				</button>
			</div>

			<div
				class="flex flex-col items-center justify-center"
				v-else-if="currentScreen == 'LikeScreen'"
			>
				<h1 class="font-bold text-6xl mx-8 text-movez-purple">
					You will talk about sports
				</h1>
				<h2 class="text-black text-3xl font-thin text-center mt-5 mb-5">
					{{ topicQuestion }}
				</h2>
				<ThumbMenu @isThumbUp="likeCallback" />
				<p class="text font-semibold text-gray-800 mb-5 text-center mt-5">
					Click on the thumbs-up or thumbs-down to make your choice. <br />
					If you do not choose, we will decide for you
				</p>
				<button
					@click="handleButtonClick"
					class="text-white font-bold py-2 px-4 rounded"
					:class="{
						'bg-blue-500 hover:bg-blue-700': isButtonActive,
						'bg-gray-300 cursor-not-allowed': !isButtonActive,
					}"
					:disabled="!isButtonActive"
				>
					Continue
				</button>
			</div>

			<div
				class="flex flex-col items-center justify-center"
				v-else-if="currentScreen == 'ImposterScreen'"
			>
				<h1 class="font-bold text-6xl mx-8 text-movez-purple mb-5">
					Would you like to be an imposter?
				</h1>
				<ThumbMenu @isThumbUp="imposterCallback" />
				<p class="text font-semibold text-gray-800 mb-5 text-center mt-5">
					Click on the thumbs-up or thumbs-down to make your choice. <br />
					If you do not choose, we will decide for you..
				</p>
				<button
					@click="handleButtonClick"
					class="text-white font-bold py-2 px-4 rounded mt-3"
					:class="{
						'bg-blue-500 hover:bg-blue-700': isButtonActive,
						'bg-gray-300 cursor-not-allowed': !isButtonActive,
					}"
					:disabled="!isButtonActive"
				>
					Continue
				</button>
			</div>

			<div v-else>
				<p class="font-bold text-4xl mb-5 text-movez-purple">
					Waiting for the other players to finish
				</p>
			</div>

			<div class="flex flex-col w-[350px] h-[35px] mt-7">
				<ProgressBar 
          :percentageComplete="progressBarValue" 
          :showTimerOnPercentageComplete="0" 
          :secondsLeft="secondsLeftInRound"
        />
			</div>
		</div>
	</div>
	<!-- </div> -->
</template>

<script>
import socket from "../socket";
import TopicMenu from "./TopicMenu.vue";
import ProgressBar from "./ProgressBar.vue";
import ThumbMenu from "./ThumbMenu.vue";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";

export default {
	components: {
		TopicMenu,
		ProgressBar,
		ThumbMenu,
	},
	data() {
		return {
			progressBarValue: 0,
			secondsLeftInRound: -1,
			currentScreen: "AssignmentScreen",
			screens: ["AssignmentScreen", "LikeScreen", "ImposterScreen", "Waiting"],
			isButtonActive: true,
			iconMapping: {
				Yellow: CatIcon,
				Green: SlothIcon,
				Blue: PandaIcon,
				Red: DogIcon,
			},
		};
	},
	props: ["playerColor", "topicQuestion"],
	created() {
    socket.on("game state progress update", ({ percentageComplete, secondsLeft }) => {
			this.progressBarValue = percentageComplete
      this.secondsLeftInRound = secondsLeft
		});
	},
	methods: {
		getPlayerIcon(color) {
			return this.iconMapping[color] || null;
		},
		likeCallback(thumbValue) {
			console.log(`like topic value: ${thumbValue}`);
			socket.emit("game state set like topic", {
				likeTopic: thumbValue,
			});
			this.isButtonActive = true;
		},

		imposterCallback(thumbValue) {
			console.log(`like imposter value: ${thumbValue}`);
			socket.emit("game state set like imposter", {
				likeImposter: thumbValue,
			});
			this.isButtonActive = true;
		},

		handleButtonClick() {
			const index = this.screens.indexOf(this.currentScreen);
			if (index !== -1 && index < this.screens.length - 1) {
				this.currentScreen = this.screens[index + 1];
			}
			this.isButtonActive = false;
		},
	},
};
</script>

<style scoped></style>
