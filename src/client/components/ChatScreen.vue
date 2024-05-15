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
           :messages="messages"
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
  props: [
    "playerDataArray"
  ],
  data(): {
    chatRoundProgressValue: number,
    playerColorMapping: Record<PlayerColor, string>
    playerConnected: boolean,
    messages: Message[]
  } {
    return {
      playerColorMapping: PlayerColorMapping,
      chatRoundProgressValue: 0, // progress bar data
      playerConnected: true,
      messages: []
    }
  },
  methods: {
    onMessage(content: any) {
      const partners = this.collectPartners()
      const partnerUserIds = partners.map((player: PlayerData) => player.userId)
      socket.emit("private message", { content, to: partnerUserIds, })
      this.messages.push({ content, fromUserId: socket.userId, toUserId: "", fromSelf: true, })
    },

    collectPartners() {
      return this.playerDataArray.filter((player: PlayerData) => !player.isCurrentPlayer)
    },

  },
  created() {
    // Load the messages upon loading the component
    this.playerDataArray.forEach((player: PlayerData) => {
      if (player.messages !== undefined) {
        player.messages.forEach((message) => {
          const fromSelf = socket.userId === message.fromUserId
          this.messages.push({...message, fromSelf})
        })
      }
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
      this.messages.push({ content, fromUserId, toUserId, fromSelf, }) 
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
