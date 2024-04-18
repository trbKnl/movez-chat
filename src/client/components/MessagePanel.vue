<template>

  <div class="flex flex-col h-screen relative">

    <!-- Top item with fixed height -->
    <div class="flex items-center justify-between h-25">
      <p class="text-2xl ml-5 font-bold"> Movez Chat</p>
      <img src="/public/images/movez.png" alt="Avatar" class="w-16 h-16 mr-5" />
    </div>

    <!-- Middle item that takes up the remaining space -->
    <div class="flex-1 overflow-auto center background-image-container" ref="messagesContainer">
      <div class="flex items-center justify-center">
      <div class="m-5 p-3 w-full mx-4 my-4">
        <ul class="flex flex-col">
          <li
            v-for="(message, index) in user.messages"
            :key="index"
            :class="getMessageClass(message, this.user)"
          >
           <!-- Removed the sender's username display -->
            <div v-if="displaySender(message, index)" class="font-semibold">
              {{ message.fromSelf ? "You" : user.username }}
            </div> 

            <div>{{ message.content }}</div>
          </li>
        </ul>
      </div>
      </div>
    </div>

    <!-- Bottom item with fixed height -->
    <div class="h-25 bg-gray-100">
      <form @submit.prevent="onSubmit" class="flex items-center justify-between bg-gray-100 p-4 rounded-lg" >
        <textarea 
          v-model="input"
          placeholder="Your message..." 
          class="flex-1 mr-2 py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 resize-none"
          @keydown="handleKeydown"
        />
        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none">Send</button>
      </form>
    </div>
  </div>
</template>


<script>
import { PlayerColorMapping } from '../config.ts'

export default {
  name: "MessagePanel",
  emits: ["input"],
  props: {
    user: Object,
  },
  data() {
    return {
      input: "",
    };
  },
  methods: {
    onSubmit() {
      if (this.isValid) {
        this.$emit("input", this.input);
        this.input = "";
      }
    },

    handleKeydown(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.onSubmit();
      }
    },

    displaySender(message, index) {
      return (
        index === 0 ||
        this.user.messages[index - 1].fromSelf !== message.fromSelf
      );
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        container.scrollTop = container.scrollHeight;
      });
    },

    getMessageClass(message, user) {
      const bgColorClass = message.fromSelf ? `${PlayerColorMapping[user.playerColor]}` : `${PlayerColorMapping[user.partnerColor]}`;
      return {
        [bgColorClass]: true,
        'self-start ml-5': !message.fromSelf,
        'self-end mr-5': message.fromSelf,
        'text-white py-2 px-3 rounded-lg max-w-max max-h-max p-10 m-1 shadow-lg': true
      };
    }
  },

  computed: {
    isValid() {
      return this.input.trim().length > 0;
    },
  },
  mounted() {
    this.scrollToBottom();
  },
  updated() {
    this.scrollToBottom();
  },
};
</script>


<style scoped>

.background-image-container {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='561' preserveAspectRatio='none' viewBox='0 0 1440 561'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1100%26quot%3b)' fill='none'%3e%3crect width='1440' height='561' x='0' y='0' fill='rgba(229%2c 231%2c 235%2c 1)'%3e%3c/rect%3e%3cuse xlink:href='%23SvgjsSymbol1107' x='0' y='0'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsSymbol1107' x='720' y='0'%3e%3c/use%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1100'%3e%3crect width='1440' height='561' fill='white'%3e%3c/rect%3e%3c/mask%3e%3cpath d='M-1 0 a1 1 0 1 0 2 0 a1 1 0 1 0 -2 0z' id='SvgjsPath1104'%3e%3c/path%3e%3cpath d='M-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0z' id='SvgjsPath1103'%3e%3c/path%3e%3cpath d='M-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0z' id='SvgjsPath1101'%3e%3c/path%3e%3cpath d='M2 -2 L-2 2z' id='SvgjsPath1102'%3e%3c/path%3e%3cpath d='M6 -6 L-6 6z' id='SvgjsPath1106'%3e%3c/path%3e%3cpath d='M30 -30 L-30 30z' id='SvgjsPath1105'%3e%3c/path%3e%3c/defs%3e%3csymbol id='SvgjsSymbol1107'%3e%3cuse xlink:href='%23SvgjsPath1101' x='30' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='30' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='30' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='30' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='30' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1105' x='30' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)' stroke-width='3'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='30' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='30' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='30' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='30' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='90' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='90' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='90' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1105' x='90' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)' stroke-width='3'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='90' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='90' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='90' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='90' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='90' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='90' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='150' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='150' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='150' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='150' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='150' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='150' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='150' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='150' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='150' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='150' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='210' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='210' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='210' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='210' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='210' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='210' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='210' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='210' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='210' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='210' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='270' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='270' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='270' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='270' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='270' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='270' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='270' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='270' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='270' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='270' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='330' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='330' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='330' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='330' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='330' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='330' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='330' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='330' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='330' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='330' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='390' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='390' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='390' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='390' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='390' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='390' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='390' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='390' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='390' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='390' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='450' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='450' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='450' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='450' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='450' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='450' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='450' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='450' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='450' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1105' x='450' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)' stroke-width='3'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='510' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='510' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='510' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='510' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='510' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='510' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='510' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='510' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='510' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='510' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='570' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='570' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='570' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='570' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='570' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='570' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='570' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='570' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='570' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='570' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='630' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='630' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='630' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='630' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1103' x='630' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='630' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='630' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='630' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='630' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='630' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='690' y='30' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='690' y='90' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='690' y='150' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='690' y='210' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='690' y='270' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='690' y='330' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1102' x='690' y='390' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1104' x='690' y='450' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1101' x='690' y='510' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3cuse xlink:href='%23SvgjsPath1106' x='690' y='570' stroke='rgba(241%2c 245%2c 249%2c 1)'%3e%3c/use%3e%3c/symbol%3e%3c/svg%3e");
}

</style>
