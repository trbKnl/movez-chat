<template>
  <div>
    <!-- Overlay -->
    <div class="overlay" v-if="showOverlay">
      <!-- Overlay content -->
      <div class="overlay-content">
        <p>Waiting for chat partner</p>
      </div>
    </div>

   <div v-else-if="!showThankYou">
    <div class="left-panel">

      <!-- Active Users Section -->
      <div class="users-section">
         <div class="header">
           <h2 class="users-header">Currently Online</h2>
           <button @click="quitGame" class="quit-game-button">
               <img src="/public/images/quit.png" alt="Quit" />
             </button>
        </div>

          <user
            v-for="user in users"
            :key="user.userId"
            :user="user"
            :selected="selectedUser === user"
            @select="onSelectUser(user)"
          />
      </div>

      <!-- Card Pile Section -->
      <div class="cards-section">
        <div class="card-pile" @click="nextCard">
          <transition name="slide-fade" mode="out-in">
              <div :key="randomMessage" class="card-front">
                   {{ randomMessage }}
              </div>
          </transition>
        </div>
      </div>

      <!-- Progress Bar Section -->
      <div class="progress-bar-wrapper">
          <div class="progress-bar" ref="progressBar">
      </div>
      </div>
    </div>

    <message-panel
      v-if="selectedUser"
      :user="selectedUser"
      @input="onMessage"
      class="right-panel"
    />

    <!-- Quit Confirmation Modal -->
    <div v-if="showQuitConfirmation" class="modal">
      <div class="modal-content">
        <h2>Confirm Quit</h2>
        <p>Are you sure you want to quit the game?</p>
        <button @click="confirmQuit">Yes, Quit</button>
        <button @click="cancelQuit">Cancel</button>
      </div>
    </div>

  <!-- End   v-if="!showThankYou" case-->
  </div>
    <thank-you v-else @submit-suggestion="handleSuggestion"></thank-you>
  </div>

</template>

<script>
import socket from "../socket";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";
import ThankYou from './ThankYou.vue';

export default {
  name: "Chat",
  components: { User, MessagePanel, ThankYou },
  data() {
    return {
      selectedUser: null,
      users: [],
      cardFlipped: true,
      randomMessage: '',
      showDialog: false,
      shownMessages: [],
      showThankYou: false,
      showOverlay: true,
      progressValue: 0,
      showQuitConfirmation: false,
    };
  },
  methods: {
    // GAME METHODS
    nextCard() {
      socket.emit("next card")
    },

    showCard(card) {
        this.randomMessage = card
    },

    updateProgress(progressValue) {
      this.progressValue = progressValue
      if (this.$refs.progressBar !== undefined) {
          this.$refs.progressBar.style.width = `${this.progressValue}%`;
      }
    },

    onMessage(content) {
      if (this.selectedUser) {
        socket.emit("private message", {
          content,
          to: this.selectedUser.userId,
        });
        this.selectedUser.messages.push({
          content,
          fromSelf: true,
        });
      }
    },

    onSelectUser(user) {
      this.selectedUser = user;
      user.hasNewMessages = false;
    },

    quitGame() {
      this.showQuitConfirmation = true;
    },

    confirmQuit() {
      this.showThankYou = true;
    },

    cancelQuit() {
      this.showQuitConfirmation = false;
    },

    handleSuggestion(suggestion) {
      socket.emit("suggestion", suggestion)
    },

    closeOverlay(nUsers) {
      if (nUsers >= 2) {
          this.showOverlay = false
          socket.emit("send game update")
      }
    }
  },

  created() {
    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    // When component created ask the server for a game update
    socket.emit("send game update")

    // Check if overlay can be closed
    this.closeOverlay(this.users.length)

    socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    const initReactiveProperties = (user) => {
      user.hasNewMessages = false;
    };

    socket.on("users", (users) => {
      this.closeOverlay(users.length)
      users.forEach((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.userId;
        });
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i];
          if (existingUser.userId === user.userId) {
            existingUser.connected = user.connected;
            existingUser.messages = user.messages;
            return;
          }
        }
        user.self = user.userId === socket.userId;
        initReactiveProperties(user);
        console.log(user)
        this.users.push(user);
      });
      // put the current user first, and sort by username
      this.users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });

    socket.on("user connected", (user) => {
      console.log(`User connected to with roomId: ${socket.roomId}`)
      console.log(`The current users room is roomId ${user.roomId}`)
      if (socket.roomId === user.roomId) {
          for (let i = 0; i < this.users.length; i++) {
            const existingUser = this.users[i];
            if (existingUser.userId === user.userId) {
              existingUser.connected = true;
              return;
            }
          }
          initReactiveProperties(user);
          this.users.push(user);
          this.closeOverlay(this.users.length)
     }
    });

    socket.on("user disconnected", (id) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.userId === id) {
          user.connected = false;
          break;
        }
      }
    });

    socket.on("private message", ({ content, from, to }) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        const fromSelf = socket.userId === from;
        if (user.userId === (fromSelf ? to : from)) {
          user.messages.push({
            content,
            fromSelf,
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
    });

    // GAME LISTENERS
    socket.on("update game", ({roomId, card, progress}) => {
        console.log(`UPDATE RECEIVED: ${roomId}, ${card}, ${progress}`)
      if (socket.roomId === roomId) {
        this.showCard(card)
        this.updateProgress(progress)
      }
    })

  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
    socket.off("update game");
  },
};
</script>

<style scoped>

.right-panel {
    margin-left: 360px;
  }

  .left-panel {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 360px;
    display: flex;
    flex-direction: column;
    background-color: #3f0e40;
    color: white;
  }

  .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
    }

    .users-header {
      margin: 0;
      /* Additional styling for the header text */
    }

    .quit-game-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.quit-game-button img {
  width: 30px; /* Adjust size as needed */
  height: auto;
}

  .users-section {
    overflow-y: auto;
    margin: 20px;
    flex: 0 0 30%;
    /* Other styling as needed */
  }

  .cards-section {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 50%;
  }

  .card-pile {
     cursor: pointer;
     perspective: 1000px;
     width: 200px; /* Increased by 20% */
     height: 290px; /* Increased by 20% */
     position: relative;
     background-color: #FFF;
     color: black;
     display: flex;
     align-items: center;
     justify-content: center;
     text-align: center;
     font-size: 20px;
     border: 1px solid #ddd; /* Add border */
     box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2); /* Add shadow for depth */
     border-radius: 8px; /* Optional: rounded corners */
     transform-style: preserve-3d;

   }

   .card-pile:hover {
     cursor: pointer; /* Hand pointer on hover */
   }

   .card-back, .card-front {
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 10px; /* Rounded corners typical of playing cards */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
    border: 5px solid #000; /* Black border */

    background-color: #FFF; /* White background */
    display: flex;
    color: black;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    transition: transform 0.6s;
  }

  .card-back {
    /* Design for the back of the card, often a pattern or solid color */
    background-image: url('/images/card.png');
  }

  .card-front {
    /* Design for the front of the card */
    font-size: 25px; /* Adjust as needed */
    /* Add indices (e.g., number and suit) in the corners */
    &:before, &:after {
      content: 'A ♠'; /* Example: Ace of Spades */
      position: absolute;
      font-size: 24px; /* Smaller font size for indices */
    }
    &:before {
      top: 10px; /* Position at top-left corner */
      left: 10px;
    }
    &:after {
      bottom: 10px; /* Position at bottom-right corner */
      right: 10px;
      transform: rotate(180deg); /* Upside-down for bottom-right */
    }
  }

  .progress-bar-wrapper {
    position: absolute;
    bottom: 15%; /* Adjust the position as needed */
    left: 5%;
    width: 90%;
    flex: 0 0 20%;
    background-color: white;
    height: 3rem;
    border-radius: 10px; /* Add rounded corners */
    border: 3px solid #fff; /* Black border */
  }

  .progress-bar {
    position: absolute;
    bottom: 10%; /* Move 10% from the bottom */
    width: 100%; /* Adjust the width as needed */
    background-color: #3f0e40;
    height: 2.4rem;
    border-radius: 10px; /* Add rounded corners */
    flex: 0 0 30%;
    transition: width 0.5s, background-color 0.5s; /* Transition width and background-color */

  }
  .progress {
    background-color: #3f0e40; /* Blue color for progress */
  }

  .modal {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
   display: flex;
   align-items: center;
   justify-content: center;
 }

 .modal-content {
   background-color: white;
   padding: 20px;
   border-radius: 5px;
   text-align: center;
 }

 img {
   background-color: transparent;
 }
.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  z-index: 999; /* Ensure the overlay is on top of other content */
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

</style>
