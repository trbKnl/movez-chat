<template>
<div class="chat-container">
  <div class="header">
  <!-- <status-icon :connected="user.connected" />
   <div class="username">{{ user.username }}</div> -->
    <div class="avatar-container"  @mouseover="showTip = true"
         @mouseleave="showTip = false">
      <img src="/public/images/movez.png" alt="Avatar" class="avatar" />
    </div>
  </div>

    <div class="content" ref="messagesContainer">
      <ul class="messages">
        <li
          v-for="(message, index) in user.messages"
          :key="index"
          class="message"
          :class="{'message-self': message.fromSelf}"
        >
         <!-- Removed the sender's username display -->
          <div v-if="displaySender(message, index)" class="sender">
            {{ message.fromSelf ? "You" : user.username }}
          </div> 

          <div class="message-content">{{ message.content }}</div>
        </li>
      </ul>
    </div>

    <form @submit.prevent="onSubmit" class="form">
      <textarea
        v-model="input"
        placeholder="Your message..."
        class="input"
        @keydown="handleKeydown"
      ></textarea>
      <button :disabled="!isValid" class="send-button">
        <i class="fas fa-paper-plane"></i> Send
      </button>
    </form>

    <div v-if="showTip" class="chat-tip">
      Here's a tip on how to conduct a conversation...
    </div>

  </div>
</template>




<script>
import StatusIcon from "./StatusIcon.vue";

export default {
  name: "MessagePanel",
  emits: ["input"],
  components: {
    StatusIcon,
  },
  props: {
    user: Object,
  },
  data() {
    return {
      input: "",
      showTip: false,
    };
  },
  methods: {
    toggleTip() {
       this.showTip = !this.showTip;
     },
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
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  background-color: #f8f8f8;
}

.header {
display: flex;
justify-content: flex-end; /* Aligns items to the end (right) */
line-height: 40px;
padding: 20px 40px;
border-bottom: 1px solid #e0e0e0;
background-color: #f5f5f5;
}
.avatar-container {
  cursor: pointer;
  margin-right: 10px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}


.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-right: auto; /* Pushes everything else to the right */
}

.chat-tip {
  position: absolute;
  top: 40px;
  right: 130px;
  padding: 10px;
  background-color: #3f0e401a;
  border-radius: 5px;
  box-shadow: 0 10px 15px rgba(0,0,0,0.5);
  z-index: 10;
}


.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages {
  margin: 0;
  padding-bottom: 20px; /* Space at the bottom */
  list-style: none;
}

.message {
  margin-bottom: 10px;
  margin-left: -40px;
  padding: 10px 15px; /* Adjust padding for a tighter fit */
  border-radius: 15px;
  background-color: #3f0e40; /* Message bubble color */
  display: block; /* Allows bubble to fit content */
  max-width:  fit-content; /* Maximum width to prevent overly wide bubbles */
}



.message-self {
  background-color: #a574a6; /* Self message color */
  margin-left: auto;
  max-width: fit-content;
}

.sender {
  font-weight: bold;
  margin-bottom: 5px;
  color: #fff;
}

.message-content {
  word-wrap: break-word;
  color: #fff;
}


.form {
  display: flex;
  padding: 20px 40px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.input {
  flex-grow: 1;
  resize: none;
  padding: 10px;
  line-height: 1.5;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.send-button {
  width: 100px;
  background-color: #3f0e40; /* Send button color */
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: #0056b3; /* Hover color */
}

@media screen and (max-width: 600px) {
  .header, .form {
    padding: 10px;
  }
  .messages {
    padding: 15px;
  }
  .input, .send-button {
    padding: 5px;
  }
}
</style>
