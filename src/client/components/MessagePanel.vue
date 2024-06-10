<template>
	<div class="flex flex-col h-screen relative">
		<!-- Top item with fixed height -->
		<div class="flex items-center justify-around h-25 mb-10">
			<p class="text-3xl font-bold text-movez-purple mt-8">
				Team Work! Try to find out the <br />imposter together/Hey imposter, try
				not to get caught.
			</p>
			<img
				src="/public/images/light-bulb.svg"
				alt="Avatar"
				class="w-16 h-16 mr-5 mt-2"
			/>
		</div>

		<!-- Middle item that takes up the remaining space -->
		<div class="flex-1 overflow-auto center" ref="messagesContainer">
			<div class="flex items-center justify-center">
				<div class="m-5 p-3 w-full mx-4 my-4">
					<ul class="flex flex-col">
						<li
							v-for="(message, index) in messages"
							:key="index"
							:class="getMessageClass(message)"
							class="relative"
						>
							<!-- Removed the sender's username display -->
							<div v-if="displaySender(message, index)" class="font-semibold">
								{{ message.fromSelf ? "You" : "Partner" }}
							</div>

							<div class="text-base tracking-normal">{{ message.content }}</div>
							<img
								:src="getPlayerIcon(message)"
								class="w-10 h-10 absolute"
								:class="{
									'bottom-[-15px] left-[-25px]': !message.fromSelf,
									'bottom-[-15px] right-[-25px]': message.fromSelf,
								}"
							/>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Bottom item with fixed height -->
		<div class="relative w-300 h-200 m-5">
			<div
				class="flex justify-between items-center bg-gray-100 rounded-lg border border-movez-pale-pink"
			>
				<VDropdown ref="dropdown">
					<button class="m-5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path
								d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.011 9.011 0 0 1-9 9zm6-8a6 6 0 0 1-12 0 1 1 0 0 1 2 0 4 4 0 0 0 8 0 1 1 0 0 1 2 0zM8 10V9a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm6 0V9a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0z"
								fill="#e3dad8"
							/>
						</svg>
					</button>
					<template #popper>
						<VuemojiPicker @emojiClick="handleEmojiClick" />
					</template>
				</VDropdown>

				<form @submit.prevent="onSubmit" class="mt-5 w-full">
					<textarea
						ref="inputBox"
						v-model="input"
						placeholder="Type a message"
						class="w-full h-full resize-none tracking-normal text-zinc-400 focus:outline-none bg-gray-100 custom-placeholder"
						@keydown="handleKeydown"
					/>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
import { PlayerColorMapping } from "../config.ts";
import insertText from "insert-text-at-cursor";
import { VuemojiPicker } from "vuemoji-picker";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";

export default {
	name: "MessagePanel",
	emits: ["input"],
	props: ["players", "messages"],
	data() {
		return {
			input: "",
		};
	},
	components: {
		VuemojiPicker,
	},
	methods: {
		onSubmit() {
			if (this.isValid) {
				this.$refs.dropdown.hide();
				this.$emit("input", this.input);
				this.input = "";
			}
		},

		handleEmojiClick(e) {
			insertText(this.$refs.inputBox, e.unicode);
		},

		handleKeydown(event) {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				this.onSubmit();
			}
		},

		handleKeyAnywhere(event) {
			if (
				event.target !== this.$refs.inputBox &&
				!event.metaKey &&
				!event.ctrlKey &&
				!event.altKey
			) {
				event.preventDefault();

				const textarea = this.$refs.inputBox;
				textarea.focus();

				const key = event.key;
				const isShiftPressed = event.shiftKey;

				if (isShiftPressed && /^[a-zA-Z]$/.test(key)) {
					const upperKey = key.toUpperCase();
					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;
					textarea.value =
						textarea.value.slice(0, start) +
						upperKey +
						textarea.value.slice(end);
					textarea.selectionStart = start + 1;
					textarea.selectionEnd = start + 1;
				} else if (key !== "Shift") {
					// For other keys, simulate typing as before
					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;
					textarea.value =
						textarea.value.slice(0, start) + key + textarea.value.slice(end);
					textarea.selectionStart = start + 1;
					textarea.selectionEnd = start + 1;
				}
			}
		},

		displaySender(message, index) {
			return (
				index === 0 || this.messages[index - 1].fromSelf !== message.fromSelf
			);
		},

		scrollToBottom() {
			this.$nextTick(() => {
				const container = this.$refs.messagesContainer;
				container.scrollTop = container.scrollHeight;
			});
		},

		getBackgroundColor(message) {
			const player = this.players.find(
				(player) => player.userId === message.fromUserId
			);
			if (player !== undefined) {
				return PlayerColorMapping[player.color];
			} else {
				return "hidden";
			}
		},

		getPlayerIcon(message) {
			const player = this.players.find(
				(player) => player.userId === message.fromUserId
			);
			if (player !== undefined) {
				switch (player.color) {
					case "Yellow":
						return CatIcon;
					case "Green":
						return SlothIcon;
					case "Blue":
						return PandaIcon;
					case "Red":
						return DogIcon;
					default:
						return null;
				}
			} else {
				return null;
			}
		},

		getMessageClass(message) {
			const bgColorClass = this.getBackgroundColor(message);
			return {
				[bgColorClass]: true,
				"self-start ml-5": !message.fromSelf,
				"self-end mr-5": message.fromSelf,
				"text-white py-2 px-3 mt-3 rounded-lg max-w-max max-h-max p-10 m-1 shadow-lg": true,
			};
		},
	},

	computed: {
		isValid() {
			return this.input.trim().length > 0;
		},
	},
	mounted() {
		this.scrollToBottom();
		this.$nextTick(() => {
			this.$refs.inputBox.focus();
		});
		document.addEventListener("keydown", this.handleKeyAnywhere);
	},
	updated() {
		this.scrollToBottom();
	},
};
</script>

<style scoped>
.custom-placeholder::placeholder {
	color: #e3dad8;
}
@font-face {
	font-family: Fieldwork-Bold;
	src: url("/public/fonts/Fieldwork16GeoBold.otf");
}

p {
	font-family: Fieldwork-Bold, Arial, Helvetica, sans-serif;
}
</style>
