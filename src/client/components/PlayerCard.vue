<template>
	<div
		class="flex mt-3 p-5 items-center"
		:class="{ 'bg-movez-purple text-white': playerData.isCurrentPlayer }"
	>
		<!-- <div
				:class="
					'w-6 m-1 h-6 rounded-full ' + playerColorMapping[playerData.color]
				"
			></div>
			<h3 class="text-lg font-semibold">{{ playerData.color }}</h3>
			<div class="status">
				<status-icon class="ml-3" :connected="playerData.connected" />{{
					status
				}}
			</div> -->

		<img :src="getPlayerIcon(playerData.color)" class="w-20 h-20" />
		<p class="text-2xl ml-10">{{ playerData.topicQuestion }}</p>
	</div>
	<!-- <p>Like topic: {{ playerData.likeTopic }}</p> -->
</template>

<script>
import StatusIcon from "./StatusIcon.vue";
import { PlayerColorMapping } from "../config";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";

export default {
	name: "User",
	components: { StatusIcon },
	props: ["playerData"],
	methods: {
		getPlayerIcon(color) {
			return this.iconMapping[color] || null;
		},
	},
	data() {
		return {
			playerColorMapping: PlayerColorMapping,
			iconMapping: {
				Yellow: CatIcon,
				Green: SlothIcon,
				Blue: PandaIcon,
				Red: DogIcon,
			},
		};
	},
	computed: {
		status() {
			return this.playerData.connected ? "online" : "offline";
		},
	},
	mounted() {
		console.log("Player Data:", this.playerData);
	},
};
</script>

<style scoped>
/* .status {
	color: #92959e;
}
.new-messages {
	color: white;
	background-color: red;
	width: 20px;
	border-radius: 5px;
	text-align: center;
	float: right;
	margin-top: 10px;
} */
</style>
