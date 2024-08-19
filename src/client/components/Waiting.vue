<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
	>
		<div class="absolute w-full h-full bg-white"></div>
		<div class="z-50 flex flex-col items-center">
			<h2 class="text-5xl font-thin text-white">
				Waiting for {{ playersNeeded }}
				{{ playersNeeded === 1 ? "player" : "players" }} to start the game...
			</h2>
			<div class="flex flex-col w-[350px] h-[35px]">
				<ProgressBar :isStatic="true" />
			</div>
		</div>
	</div>
</template>

<script>
import socket from "../socket";
import ProgressBar from "./ProgressBar.vue";

export default {
	components: {
		ProgressBar,
	},
	data() {
		return {
			playersNeeded: "3",
		};
	},
	created() {
		socket.on("update players needed", (playersNeeded) => {
			this.playersNeeded = playersNeeded;
		});
	},
};
</script>

<style scoped>
h2 {
	color: #6e0069;
	margin-bottom: 60px;
}
</style>
