<template>
	<div class="flex flex-col h-screen relative">
		<!-- Top item with fixed height -->
		<div class="flex items-center justify-around h-25 mb-10">
			<p class="text-3xl font-bold text-movez-purple mt-8">
        <div v-if="playerRole === 'Imposter'">
          Hey imposter, try not to get caught.
        </div>
        <div v-else>
          Try to find out who the imposter is!
        </div>
			</p>
			<div class="relative">      
        <div class="mt-8 text-amber-300 text-center"><img
					src="/public/images/light-bulb.svg"
					alt="Avatar"
					class="w-20 h-20 mt-3 light-bulb transition-opacity duration-300 opacity-70 hover:opacity-100"
					@mouseenter="showTip"
					@mouseleave="hideTip"
				/>Hover for Tips!</div>
				
				<div
					v-if="showTips"
				class="absolute top-30 right-5 w-64 p-2 rounded-lg bg-gray-100 text-zinc-400 text-sm z-10 opacity-0 transition-opacity duration-300"
               :class="{ 'opacity-80': showTips }"
				>
					{{ currentTip }}
				</div>
			</div>
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
								{{ message.fromSelf ? "You" : getPlayerName(message) }}
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

		<div class="relative w-300 h-200 m-5">
			<div
				class="flex justify-between items-center bg-gray-100 rounded-lg border border-movez-pale-pink"
			>
        <!-- emojiPicker -->
				<VDropdown ref="emojiPicker">
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
						<VuemojiPicker 
              @emojiClick="handleEmojiClick" 
            />
					</template>
				</VDropdown>

				<form @submit.prevent="onSubmit" class="mt-5 w-full">
					<textarea
						ref="inputBox"
						v-model="input"
						placeholder="Type a message"
						class="w-full h-full resize-none tracking-normal text-zinc-400  focus:outline-none bg-gray-100"
						@keydown="handleKeydown"
					/>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
import socket from "../socket";
import { PlayerColorMapping } from "../config.ts";
import insertText from "insert-text-at-cursor";
import { VuemojiPicker } from "vuemoji-picker";
import PandaIcon from "../../../public/images/panda.svg";
import CatIcon from "../../../public/images/cat.svg";
import DogIcon from "../../../public/images/dog.svg";
import SlothIcon from "../../../public/images/sloth.svg";
import throttle from 'lodash/throttle';


export default {
  name: "MessagePanel",
  emits: ["input","isTyping"],
  props: ["players", "messages", "playerRole"],
  data() {
    return {
      input: "",
      showTips: false,
      currentTip: "",
      imposterTips: [
        "Keep It Simple: Don't make your answers too complicated. Stick to simple, believable statements that are easy to remember.",
        "Blend In: Listen to what the others are saying and try to match their enthusiasm. If everyone else is excited about a certain sport, show some excitement too.",
        "Avoid Extreme Statements: Don't say anything too extreme or controversial. Stick to average opinions that don't draw too much attention.",
        "Stay Cool and Confident: Answer questions calmly and confidently. If you act nervous, they'll suspect you.",
        "Use General Knowledge: Use general knowledge about the topic to build your story. For sports, mention well-known teams, popular events, or famous players.",
        "Deflect and Redirect: If you're stuck, try to change the subject. For example, 'What do you think about that?' This buys you time and shifts focus.",
        "Create a Backstory: Have a backstory ready for why you feel a certain way. For instance, 'I got into cricket because my older brother plays.'",
        "Use Vague Answers: When you're unsure, give vague but believable answers. For example, 'I don't follow a specific team, I just enjoy watching good matches.'",
      ],
      playerTips: [
        "Ask Specific Questions: Hit them with questions that need more than just a yes or no. Stuff like, 'What's the best football match you've seen?' or 'Who's your top player and why?' These are harder for the impostor to fake.",
        "Notice the Details: Listen carefully to what they say. Real answers usually have specific details, while impostors might be vague or general.",
        "Check for Consistency: During the chat, look for any changes in their story. Ask them to repeat or explain their answers at different times to catch them slipping up.",
        "Follow-Up Questions: Based on what they say, ask more questions to dig deeper. For example, if they mention liking rugby, ask about their favourite team or a memorable match.",
        "Create Scenarios: Make up scenarios related to the topic to see how they respond. For instance, 'If you could go to any sports event, which one would it be and why?'",
        "Stay Chill and Open-Minded: Don't decide too quickly. Keep an open mind and consider all the possibilities before guessing the impostor.",
      ],
    };
  },
  components: {
    VuemojiPicker,
  },
  methods: {
    onSubmit() {
      if (this.isValid) {
        this.$refs.emojiPicker.hide();
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
    emitIsTyping: throttle(function() {
      this.$emit("isTyping");
    }, 500),

    handleKeyAnywhere(event) {
      if ( event.target === this.$refs.inputBox ) { return }
      if ( document.activeElement.nodeName === "EMOJI-PICKER" ) { return }
      const textarea = this.$refs.inputBox;
      if (textarea !== null) {
        textarea.focus();
      }
    },

    displaySender(message, index) {
      return index === 0 || this.getPlayerName(this.messages[index - 1]) !== this.getPlayerName(message);
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

    getPlayerName(message) {
      const player = this.players.find(
        (player) => player.userId === message.fromUserId
      );
      if (player !== undefined) {
        switch (player.color) {
          case "Fluffy Cat":
            return "Fluffy Cat";
          case "Dreamy Sloth":
            return "Dreamy Sloth";
          case "Funky Panda":
            return "Funky Panda";
          case "Bouncy Dog":
            return "Bouncy Dog";
          default:
            return null;
        }
      } else {
        return null;
      }
    },

    getPlayerIcon(message) {
      const player = this.players.find(
        (player) => player.userId === message.fromUserId
      );
      if (player !== undefined) {
        switch (player.color) {
          case "Fluffy Cat":
            return CatIcon;
          case "Dreamy Sloth":
            return SlothIcon;
          case "Funky Panda":
            return PandaIcon;
          case "Bouncy Dog":
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

    showTip() {
      const tips = this.playerRole === "Imposter" ? this.imposterTips : this.playerTips;
      this.currentTip = tips[Math.floor(Math.random() * tips.length)];
      this.showTips = true;
    },

    hideTip() {
      this.showTips = false;
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
    document.addEventListener("keydown", this.emitIsTyping);
    document.addEventListener("keydown", this.handleKeyAnywhere);
  },

  beforeDestroy() {
    document.removeEventListener("keydown", this.handleKeyAnywhere);
    document.removeEventListener("keydown", this.emitIsTyping);
  },

  updated() {
    this.scrollToBottom();
  },
};
</script>


<style scoped>

@font-face {
	font-family: Fieldwork-Bold;
	src: url("/public/fonts/Fieldwork16GeoBold.otf");
}

p {
	font-family: Fieldwork-Bold, Arial, Helvetica, sans-serif;
}

</style>
