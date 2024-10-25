<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 overflow-auto"
	>
		<div class="absolute w-full h-full bg-white opacity-50"></div>
		<div class="z-50 flex flex-col items-center justify-center">
			<div
				class="flex flex-col items-center justify-center"
				v-if="currentScreen == 'AssignmentScreen'"
			>
				<div class="flex items-center justify-between mr-[100px]">
					<div>
						<img
							:src="getPlayerIcon(playerColor)"
							alt="animal"
							class="w-[150px]"
						/>
					</div>

					<div class="flex flex-col justify-center items-center">
						<h1 class="font-bold text-6xl mx-8 text-movez-purple">
							In this game you will be...
						</h1>
						<p class="font-bold text-6xl text-movez-purple">
							{{ playerColor }}
						</p>
					</div>
				</div>
				<div class="flex flex-col items-center justify-center mt-3">
					<h2 class="text-black text-2xl font-thin text-center ml-[50px]">
						We will ask 2 more questions before we start...
					</h2>
					<button
						@click="handleButtonClick"
						class="text-white font-bold py-2.5 px-10 text-[17px] rounded mt-7"
						:class="{
							'bg-movez-purple hover:bg-fuchsia-950': isButtonActive,
							'bg-gray-300 cursor-not-allowed': !isButtonActive,
						}"
						:disabled="!isButtonActive"
					>
						Continue
					</button>
				</div>
			</div>

			<div
				class="flex flex-col items-center justify-center"
				v-else-if="currentScreen == 'LikeScreen'"
			>
				<h1 class="font-bold text-6xl mx-8 text-movez-purple">
					{{ gameTexts.topicAssignment }}
				</h1>
				<h2 class="text-black text-2xl font-thin text-center mt-5 mb-5">
					{{ gameTexts.topicQuestion }}
				</h2>
				<ThumbMenu @isThumbUp="likeCallback" />
				<p class="text font-semibold text-gray-800 mb-5 text-center mt-5">
					Click on the thumbs-up or thumbs-down to make your choice. <br />
					If you do not choose, we will decide for you
				</p>
				<button
					@click="handleButtonClick"
					class="text-white font-bold py-2.5 text-[17px] px-10 rounded mt-5"
					:class="{
						'bg-movez-purple hover:bg-fuchsia-950': isButtonActive,
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
					Would you like to be the imposter?
				</h1>
				<ThumbMenu @isThumbUp="imposterCallback" />
				<p class="text font-semibold text-gray-800 mb-5 text-center mt-5">
					Click on the thumbs-up or thumbs-down to make your choice. <br />
					If you do not choose, we will decide for you..
				</p>
				<button
					@click="handleButtonClick"
					class="text-white font-bold py-2.5 text-[17px] px-10 rounded mt-5"
					:class="{
						'bg-movez-purple hover:bg-fuchsia-950': isButtonActive,
						'bg-gray-300 cursor-not-allowed': !isButtonActive,
					}"
					:disabled="!isButtonActive"
				>
					Continue
				</button>
			</div>

			<div v-else>
				<h2 class="text-5xl text-movez-purple mb-[10px]">
					Waiting for the other players to finish
				</h2>
			</div>

			<div class="flex flex-col w-[350px] h-[35px] mt-10">
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
				"Fluffy Cat": CatIcon,
				"Dreamy Sloth": SlothIcon,
				"Funky Panda": PandaIcon,
				"Bouncy Dog": DogIcon,
			},
		};
	},
	props: ["playerColor", "gameTexts"],
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
