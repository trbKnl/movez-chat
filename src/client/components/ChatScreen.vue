<template>

  <div class="flex">
     <div class="w-1/3 bg-gray-300">
        <div class="p-3">
          <div class="flex items-center justify-between p-4">
             <h2 class="text-xl font-bold">Chat Room</h2>
          </div>

          <div v-for="(playerData, index) in playerDataArray" :key="index">
            <div v-if="playerData !== undefined">
              <PlayerCard :playerData="playerData"/>
            </div>
          </div>

          <progress-bar class="m-1" :value="chatRoundProgressValue" />
        </div>

      </div>
      <div class="w-2/3">
         <message-panel
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
import PlayerCard from "./PlayerCard.vue";
import MessagePanel from "./MessagePanel.vue";
import ProgressBar from './ProgressBar.vue';

import { PlayerColorMapping } from '../config'
import type { PlayerData, PlayerColor } from '../../server/game.ts'
import type { Message } from '../../server/messageStore.ts'

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
      required: true
    },
    messages: {
      type: Array as () => Message[],
      default: []
    },
  },
  watch: {
    playerDataArray() {
      this.messageData = []
      this.messages.forEach((message: Message) => {
        const fromSelf = socket.userId === message.fromUserId
        this.messageData.push({...message, fromSelf})
      })
    }
  },
  data(): {
    chatRoundProgressValue: number,
    playerColorMapping: Record<PlayerColor, string>
    playerConnected: boolean,
    messageData: Message[],
  } {
    return {
      playerColorMapping: PlayerColorMapping,
      chatRoundProgressValue: 0, // progress bar data
      playerConnected: true,
      messageData: [],
    }
  },
  methods: {
    onMessage(content: any) {
      const partners = this.collectPartners()
      const partnerUserIds = partners.map((player: PlayerData) => player.userId)
      socket.emit("private message", { content, to: partnerUserIds, })
      this.messageData.push({ content, fromUserId: socket.userId, toUserId: "", fromSelf: true, })
    },

    collectPartners() {
      return this.playerDataArray.filter((player: PlayerData) => !player.isCurrentPlayer)
    },

  },
  created() {
    // Load the messages upon loading the component
    this.messages.forEach((message: Message) => {
      const fromSelf = socket.userId === message.fromUserId
      this.messageData.push({...message, fromSelf})
    })

    socket.on("game state partner connected", (partnerId) => {
      this.playerDataArray.forEach((player) => {
        if (player.userId === partnerId) {
          player.connected = true;
        }
      })
    });

    socket.on("user disconnected", (id) => {
      this.playerDataArray.forEach((player) => {
        if (player.userId === id) {
          player.connected = false;
        }
      })
    });

    socket.on("private message", ({ content, fromUserId, toUserId }) => {
      const fromSelf = socket.userId === fromUserId
      this.messageData.push({ content, fromUserId, toUserId, fromSelf, }) 
    });

    socket.on("game state progress update", (progress) => {
      this.chatRoundProgressValue = progress
    })

    socket.on("disconnect", () => {
      this.playerConnected = false
    })
  },
};
</script>

<style scoped>
</style>
