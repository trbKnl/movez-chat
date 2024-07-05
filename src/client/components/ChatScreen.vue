<template>
	<div class="flex">
		<div class="w-1/3 bg-movez-pale-pink">
			<div class="p-3 flex flex-col h-[96vh]">
				<div class="flex items-center justify-between p-4 pb-1">
					<h2 class="text-5xl font-bold text-movez-purple">Chat Room</h2>
				</div>
				<p class="flex items-center justify-between px-4 text-xl">
					{{ roundIndicator }}
				</p>
				<hr class="w-2/5 mt-2 ml-4 border-[1.5px] border-[rgb(160,156,156)]" />
				<div v-for="(playerData, index) in playerDataArray" :key="index">
					<div v-if="playerData !== undefined">
						<PlayerCard :playerData="playerData" :gameTexts="gameTexts" />
					</div>
				</div>

				<div class="flex flex-col h-[35px] mt-auto">
					<ProgressBar
						:key="roundIndicator"
						:percentageComplete="chatRoundProgressValue"
						:showTimerOnPercentageComplete="0"
						:secondsLeft="secondsLeftInRound"
					/>
				</div>
			</div>
		</div>
		<div class="w-2/3 bg-white">
			<message-panel
        :key="hashObject(playerDataArray)"
				:playerRole="playerRole"
				:players="playerDataArray"
				:messages="messageData"
				@input="onMessage"
			/>
		</div>
	</div>
</template>

<script lang="ts">
// CODE NOT COMPLETELY IN TYPESCRIPT

import socket from "../socket";
import { PropType } from "vue";
import objectHash from 'object-hash';

import PlayerCard from "./PlayerCard.vue";
import MessagePanel from "./MessagePanel.vue";
import ProgressBar from "./ProgressBar.vue";

import { PlayerColorMapping } from "../config";
import type { PlayerData, PlayerColor } from "../../server/game.ts";
import type { Message } from "../../server/messageStore.ts";
import type { GameTexts } from "../../server/gameTexts";

export default {
	name: "ChatScreen",
	components: {
		PlayerCard,
		MessagePanel,
		ProgressBar,
	},
	props: {
		playerDataArray: {
			type: Array as () => PlayerData[],
			required: true,
		},
		messages: {
			type: Array as () => Message[],
			default: [],
		},
		roundIndicator: {
			type: String,
		},
		gameTexts: {
			type: Object as PropType<GameTexts>,
		},
		playerRole: {
			type: String,
		},
	},
	watch: {
		playerDataArray() {
			this.messageData = [];
			this.messages.forEach((message: Message) => {
				const fromSelf = socket.userId === message.fromUserId;
				this.messageData.push({ ...message, fromSelf });
			});
		},
	},
	data(): {
		chatRoundProgressValue: number;
		secondsLeftInRound: number;
		playerColorMapping: Record<PlayerColor, string>;
		playerConnected: boolean;
		messageData: Message[];
	} {
		return {
			playerColorMapping: PlayerColorMapping,
			chatRoundProgressValue: 0, // progress bar data
			secondsLeftInRound: -1, // progress bar data
			playerConnected: true,
			messageData: [],
		};
	},
	methods: {
		onMessage(content: any) {
			const partners = this.collectPartners();
			const partnerUserIds = partners.map(
				(player: PlayerData) => player.userId
			);
			socket.emit("private message", { content, to: partnerUserIds });
			this.messageData.push({
				content,
				fromUserId: socket.userId,
				toUserId: "",
				fromSelf: true,
			});
		},

    hashObject(obj: any) {
      return objectHash(obj); // Assuming objectHash is imported or defined elsewhere
    },

		collectPartners() {
			return this.playerDataArray.filter(
				(player: PlayerData) => !player.isCurrentPlayer
			);
		},
	},
	created() {
		// Load the messages upon loading the component
		this.messages.forEach((message: Message) => {
			const fromSelf = socket.userId === message.fromUserId;
			this.messageData.push({ ...message, fromSelf });
		});

		socket.on("game state partner connected", (partnerId) => {
			this.playerDataArray.forEach((player) => {
				if (player.userId === partnerId) {
					player.connected = true;
				}
			});
		});

		socket.on("user disconnected", (id) => {
			this.playerDataArray.forEach((player) => {
				if (player.userId === id) {
					player.connected = false;
				}
			});
		});

		socket.on("private message", ({ content, fromUserId, toUserId }) => {
			const fromSelf = socket.userId === fromUserId;
			this.messageData.push({ content, fromUserId, toUserId, fromSelf });
		});

		socket.on(
			"game state progress update",
			({ percentageComplete, secondsLeft }) => {
				this.chatRoundProgressValue = percentageComplete;
				this.secondsLeftInRound = secondsLeft;
			}
		);

		socket.on("disconnect", () => {
			this.playerConnected = false;
		});
	},
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Bold;
	src: url("/public/fonts/Fieldwork16GeoBold.otf");
}

h2 {
	font-family: Fieldwork-Bold, Arial, Helvetica, sans-serif;
}
</style>
